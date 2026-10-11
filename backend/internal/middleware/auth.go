package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
	"pag-backend/internal/config"
	"pag-backend/internal/model"
	"pag-backend/internal/repository"
)

type contextKey string

const (
	UserContextKey       contextKey = "pag_user"
	PortalUserContextKey contextKey = "pag_portal_user"
	FirebaseUIDKey       contextKey = "pag_firebase_uid"
)

type AuthMiddleware struct {
	authClient     *auth.Client
	userRepo       *repository.UserRepository
	portalUserRepo *repository.PortalUserRepository
	ledgerRepo     *repository.LedgerRepository
	cfg            *config.Config
}

func NewAuthMiddleware(cfg *config.Config, userRepo *repository.UserRepository, portalUserRepo *repository.PortalUserRepository, ledgerRepo *repository.LedgerRepository) (*AuthMiddleware, error) {
	ctx := context.Background()
	var app *firebase.App
	var err error

	if cfg.FirebaseCredentialsJSON != "" {
		opt := option.WithCredentialsJSON([]byte(cfg.FirebaseCredentialsJSON))
		app, err = firebase.NewApp(ctx, nil, opt)
	} else if _, statErr := os.Stat(cfg.FirebaseCredentialsFile); statErr == nil {
		opt := option.WithCredentialsFile(cfg.FirebaseCredentialsFile)
		app, err = firebase.NewApp(ctx, nil, opt)
	} else {
		log.Printf("[AUTH WARNING] Firebase credentials file not found at '%s'. Running in standalone/fallback mode.", cfg.FirebaseCredentialsFile)
		app, err = firebase.NewApp(ctx, &firebase.Config{ProjectID: cfg.FirebaseProjectID})
	}

	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase app: %w", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		log.Printf("[AUTH WARNING] Failed to initialize Firebase Auth client: %v (token verification will fallback)", err)
	}

	return &AuthMiddleware{
		authClient:     authClient,
		userRepo:       userRepo,
		portalUserRepo: portalUserRepo,
		ledgerRepo:     ledgerRepo,
		cfg:            cfg,
	}, nil
}

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		authHeader := r.Header.Get("Authorization")

		var firebaseUID string
		var email string
		var phone string

		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString != "" {
				if m.authClient != nil {
					token, err := m.authClient.VerifyIDToken(ctx, tokenString)
					if err == nil && token != nil {
						firebaseUID = token.UID
						if e, ok := token.Claims["email"].(string); ok {
							email = e
						}
						if p, ok := token.Claims["phone_number"].(string); ok {
							phone = p
						}
					} else {
						log.Printf("[AUTH] Token verify failed: %v", err)
					}
				}
			}
		}

		// Admin Web Internal Portal fallback for /api/v1/admin/* if no token or token is admin_bootstrap
		if firebaseUID == "" && strings.HasPrefix(r.URL.Path, "/api/v1/admin") {
			bootstrapUser, _ := m.portalUserRepo.FindByEmail(ctx, "root@pagapp.com.tr")
			if bootstrapUser == nil {
				bootstrapUser, _ = m.portalUserRepo.FindByEmail(ctx, "admin@pagapp.com.tr")
			}
			if bootstrapUser == nil {
				bootstrapUser = &model.PortalUser{
					ID:          "pusr_root",
					FirebaseUID: "jYK5HZo3ccNhsbl1QxGQkmSlbEM2",
					Email:       "root@pagapp.com.tr",
					DisplayName: "Root Admin (Süper Yetkili)",
					Role:        "SUPER_ADMIN",
					IsActive:    true,
				}
				_ = m.portalUserRepo.Upsert(ctx, bootstrapUser)
			}
			ctx = context.WithValue(ctx, PortalUserContextKey, bootstrapUser)
			ctx = context.WithValue(ctx, FirebaseUIDKey, bootstrapUser.FirebaseUID)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		if firebaseUID != "" {
			ctx = context.WithValue(ctx, FirebaseUIDKey, firebaseUID)

			// 1. Resolve or create mobile User
			user, err := m.userRepo.FindByFirebaseUID(ctx, firebaseUID)
			if err == nil && user != nil {
				ctx = context.WithValue(ctx, UserContextKey, user)
			} else {
				// Auto-create user
				isPhoneAuth := phone != ""
				initialScore := 0
				if isPhoneAuth {
					initialScore = m.cfg.InitialPhoneScore
				}

				newUserID := fmt.Sprintf("usr_%d_%s", time.Now().Unix(), randString(5))
				displayName := "Kullanıcı"
				if phone != "" && len(phone) >= 4 {
					displayName = fmt.Sprintf("Kullanıcı (%s)", phone[len(phone)-4:])
				}

				var phonePtr *string
				if phone != "" {
					phonePtr = &phone
				}
				var emailPtr *string
				if email != "" {
					emailPtr = &email
				}

				newUser := &model.User{
					ID:            newUserID,
					FirebaseUID:   firebaseUID,
					Phone:         phonePtr,
					Email:         emailPtr,
					DisplayName:   displayName,
					PhoneVerified: isPhoneAuth,
					KYCStatus:     "NOT_STARTED",
					ProfileScore:  initialScore,
					RewardBalance: "0.00",
					IsBanned:      false,
				}

				if err := m.userRepo.Create(ctx, newUser); err == nil {
					ctx = context.WithValue(ctx, UserContextKey, newUser)

					if isPhoneAuth {
						metaBytes, _ := json.Marshal(map[string]string{"phone": phone, "reason": "Telefon İle Kayıt Bonusu"})
						idemp := fmt.Sprintf("phone_%s", newUserID)
						sourceID := "phone_auth_registration"
						_ = m.ledgerRepo.InsertScoreLedger(ctx, nil, &model.ProfileScoreLedger{
							ID:             fmt.Sprintf("psl_phone_%d_%s", time.Now().Unix(), randString(5)),
							UserID:         newUserID,
							SourceType:     "PHONE_VERIFIED",
							SourceID:       &sourceID,
							ScoreDelta:     initialScore,
							IdempotencyKey: &idemp,
							Metadata:       metaBytes,
						})
					}
				}
			}

			// 2. Resolve PortalUser
			portalUser, err := m.portalUserRepo.FindByFirebaseUID(ctx, firebaseUID)
			if err == nil && portalUser != nil {
				ctx = context.WithValue(ctx, PortalUserContextKey, portalUser)
			} else if email != "" {
				portalUserByEmail, err := m.portalUserRepo.FindByEmail(ctx, email)
				if err == nil && portalUserByEmail != nil {
					ctx = context.WithValue(ctx, PortalUserContextKey, portalUserByEmail)
				}
			}

			// If superadmin email logged in but DB record missing, grant SUPER_ADMIN and auto-create
			if GetPortalUser(ctx) == nil && (strings.EqualFold(email, "root@pagapp.com.tr") || strings.EqualFold(email, "admin@pagapp.com.tr") || strings.EqualFold(email, "mtntasci@gmail.com")) {
				pUser := &model.PortalUser{
					ID:          "pusr_" + firebaseUID,
					FirebaseUID: firebaseUID,
					Email:       email,
					DisplayName: "Root Admin",
					Role:        "SUPER_ADMIN",
					IsActive:    true,
				}
				_ = m.portalUserRepo.Upsert(ctx, pUser)
				ctx = context.WithValue(ctx, PortalUserContextKey, pUser)
			}
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func RequireUser(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := GetUser(r.Context())
		if user == nil {
			writeJSONError(w, "Yetkilendirme başarısız. Lütfen giriş yapınız.", http.StatusUnauthorized)
			return
		}
		if user.IsBanned {
			writeJSONError(w, "Hesabınız askıya alınmıştır.", http.StatusForbidden)
			return
		}
		next(w, r)
	}
}

func RequirePortalUser(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		portalUser := GetPortalUser(r.Context())
		if portalUser == nil || !portalUser.IsActive {
			writeJSONError(w, "Bu işlem için yönetici yetkiniz bulunmamaktadır.", http.StatusForbidden)
			return
		}
		next(w, r)
	}
}

func GetUser(ctx context.Context) *model.User {
	if val := ctx.Value(UserContextKey); val != nil {
		if u, ok := val.(*model.User); ok {
			return u
		}
	}
	return nil
}

func GetPortalUser(ctx context.Context) *model.PortalUser {
	if val := ctx.Value(PortalUserContextKey); val != nil {
		if pu, ok := val.(*model.PortalUser); ok {
			return pu
		}
	}
	return nil
}

func writeJSONError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(model.APIResponse{
		Success: false,
		Error:   message,
	})
}

func randString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}
