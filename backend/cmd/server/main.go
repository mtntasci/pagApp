package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"pag-backend/internal/config"
	"pag-backend/internal/database"
	"pag-backend/internal/fcm"
	"pag-backend/internal/handler"
	"pag-backend/internal/middleware"
	"pag-backend/internal/repository"
	"pag-backend/internal/service"
	"pag-backend/internal/storage"
	"pag-backend/internal/websocket"
)

func main() {
	log.Println("[PAG] Starting Go Backend Server...")

	// 1. Load Config
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("[FATAL] Could not load config: %v", err)
	}

	// 2. Auto-run embedded migrations to ensure all tables, indexes, and initial seeds exist
	if err := database.AutoMigrate(cfg.DatabaseURL); err != nil {
		log.Printf("[MIGRATE WARNING] Auto-migration notice: %v (server will continue starting)", err)
	}

	// 3. Initialize PostgreSQL Pool
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	db, err := database.New(ctx, cfg)
	if err != nil {
		log.Fatalf("[FATAL] Database connection failed: %v", err)
	}
	defer db.Close()

	// 3. Initialize Repositories
	userRepo := repository.NewUserRepository(db.Pool)
	deviceRepo := repository.NewDeviceRepository(db.Pool)
	portalUserRepo := repository.NewPortalUserRepository(db.Pool)
	surveyRepo := repository.NewSurveyRepository(db.Pool)
	ledgerRepo := repository.NewLedgerRepository(db.Pool)
	adminOpsRepo := repository.NewAdminOpsRepository(db.Pool)
	locationRepo := repository.NewLocationRepo(db.Pool)

	// 4. Initialize Cloudflare R2 Storage
	r2Storage, err := storage.NewR2(cfg)
	if err != nil {
		log.Printf("[STORAGE WARNING] R2 initialization notice: %v", err)
	}

	// 5. Initialize Auth Middleware
	authMW, err := middleware.NewAuthMiddleware(cfg, userRepo, portalUserRepo, ledgerRepo)
	if err != nil {
		log.Printf("[AUTH WARNING] Firebase Auth init notice: %v", err)
	}

	// 6. Initialize WebSocket Hub
	wsHub := websocket.NewHub(cfg, nil, userRepo)
	go wsHub.Run()

	// 7. Initialize FCM Dispatcher
	fcmDispatcher, err := fcm.NewDispatcher(cfg, nil, db.Pool, deviceRepo)
	if err != nil {
		log.Printf("[FCM WARNING] FCM Dispatcher init notice: %v", err)
	}
	_ = fcmDispatcher

	// 8. Initialize Services
	surveyService := service.NewSurveyService(db.Pool, surveyRepo, userRepo, ledgerRepo, wsHub)

	// 9. Initialize Handlers
	mobileHandler := handler.NewMobileHandler(surveyService, userRepo, deviceRepo, surveyRepo, ledgerRepo, locationRepo)
	adminHandler := handler.NewAdminHandler(adminOpsRepo, surveyRepo, portalUserRepo, locationRepo, r2Storage)

	// 10. Build Chi Router
	r := chi.NewRouter()

	// Global Middlewares
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(chiMiddleware.Timeout(60 * time.Second))

	// CORS Setup
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Attach Auth Middleware
	if authMW != nil {
		r.Use(authMW.Authenticate)
	}

	// Root & Health Checks (for Docker, AlafCloud, Coolify probes)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"ok","service":"pag-backend","time":"%s"}`, time.Now().Format(time.RFC3339))
	})

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"ok","time":"%s"}`, time.Now().Format(time.RFC3339))
	})

	// WebSocket Endpoint
	r.Get("/ws", wsHub.HandleWebSocket)

	// ========================================================================
	// MOBILE REST API ROUTES (/api/v1/mobile/*)
	// ========================================================================
	r.Route("/api/v1/mobile", func(mr chi.Router) {
		mr.Get("/bootstrap", mobileHandler.Bootstrap)
		mr.Post("/bootstrap", mobileHandler.Bootstrap)
		mr.Get("/profile-questions", middleware.RequireUser(mobileHandler.GetProfileQuestions))
		mr.Post("/profile-questions", middleware.RequireUser(mobileHandler.SubmitProfileQuestions))
		mr.Get("/home", middleware.RequireUser(mobileHandler.Home))
		mr.Post("/device", middleware.RequireUser(mobileHandler.RegisterDevice))
		mr.Get("/profile", middleware.RequireUser(mobileHandler.GetProfile))
		mr.Put("/profile", middleware.RequireUser(mobileHandler.UpdateProfile))
		mr.Post("/profile/verify-phone", middleware.RequireUser(mobileHandler.VerifyPhone))
		mr.Get("/surveys/completed", middleware.RequireUser(mobileHandler.GetCompletedSurveys))
		mr.Post("/surveys/{id}/submit", middleware.RequireUser(mobileHandler.SubmitSurvey))
		mr.Get("/wallet", middleware.RequireUser(mobileHandler.GetWallet))
		mr.Post("/wallet/withdraw", middleware.RequireUser(mobileHandler.Withdraw))
		mr.Post("/permissions/location", middleware.RequireUser(mobileHandler.UpdateLocationPermission))
		mr.Get("/legal/documents", mobileHandler.GetLegalDocuments)
		mr.Post("/legal/acceptances", middleware.RequireUser(mobileHandler.AcceptLegalDocument))
		mr.Get("/locations", mobileHandler.GetLocations)
	})

	// Public Direct Locations Endpoint
	r.Get("/api/v1/locations", mobileHandler.GetLocations)

	// ========================================================================
	// ADMIN REST API ROUTES (/api/v1/admin/*)
	// ========================================================================
	r.Route("/api/v1/admin", func(ar chi.Router) {
		ar.Get("/dashboard/metrics", middleware.RequirePortalUser(adminHandler.GetMetrics))
		ar.Get("/locations", middleware.RequirePortalUser(adminHandler.GetLocations))
		ar.Get("/surveys", middleware.RequirePortalUser(adminHandler.ListSurveys))
		ar.Post("/surveys", middleware.RequirePortalUser(adminHandler.CreateOrUpdateSurvey))
		ar.Delete("/surveys", middleware.RequirePortalUser(adminHandler.DeleteSurvey))
		ar.Get("/users", middleware.RequirePortalUser(adminHandler.ListPortalUsers))
		ar.Post("/users", middleware.RequirePortalUser(adminHandler.CreatePortalUser))
		ar.Delete("/users", middleware.RequirePortalUser(adminHandler.DeletePortalUser))
		ar.Get("/organizations", middleware.RequirePortalUser(adminHandler.ListOrganizations))
		ar.Post("/organizations", middleware.RequirePortalUser(adminHandler.CreateOrganization))
		ar.Get("/categories", middleware.RequirePortalUser(adminHandler.ListCategories))
		ar.Post("/categories", middleware.RequirePortalUser(adminHandler.CreateCategory))
		ar.Get("/applications", middleware.RequirePortalUser(adminHandler.ListApplications))
		ar.Post("/applications", adminHandler.CreateApplication) // Public prospective application
		ar.Get("/verification/campaigns", middleware.RequirePortalUser(adminHandler.ListVerificationCampaigns))
		ar.Post("/verification/campaigns", middleware.RequirePortalUser(adminHandler.CreateVerificationCampaign))
		ar.Get("/verification/assignments", middleware.RequirePortalUser(adminHandler.ListVerificationAssignments))
		ar.Post("/verification/calls/result", middleware.RequirePortalUser(adminHandler.SubmitCallResult))
		ar.Get("/verification/respondents", middleware.RequirePortalUser(adminHandler.ListRespondents))
		ar.Get("/stories", middleware.RequirePortalUser(adminHandler.ListStories))
		ar.Post("/stories", middleware.RequirePortalUser(adminHandler.SaveStory))
		ar.Post("/media/upload", middleware.RequirePortalUser(adminHandler.UploadMedia))
	})

	// 11. Start HTTP Server on port 3000
	serverAddr := ":" + cfg.Port
	srv := &http.Server{
		Addr:         serverAddr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Printf("[PAG SERVER] Listening on http://0.0.0.0:%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[FATAL] Server listen error: %v", err)
		}
	}()

	// 12. Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[PAG SERVER] Shutting down gracefully...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("[ERROR] Server forced to shutdown: %v", err)
	}

	log.Println("[PAG SERVER] Server exited.")
}
