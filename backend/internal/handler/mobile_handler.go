package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"pag-backend/internal/middleware"
	"pag-backend/internal/model"
	"pag-backend/internal/repository"
	"pag-backend/internal/service"
)

type MobileHandler struct {
	surveyService *service.SurveyService
	userRepo      *repository.UserRepository
	deviceRepo    *repository.DeviceRepository
	surveyRepo    *repository.SurveyRepository
	ledgerRepo    *repository.LedgerRepository
}

func NewMobileHandler(
	surveyService *service.SurveyService,
	userRepo *repository.UserRepository,
	deviceRepo *repository.DeviceRepository,
	surveyRepo *repository.SurveyRepository,
	ledgerRepo *repository.LedgerRepository,
) *MobileHandler {
	return &MobileHandler{
		surveyService: surveyService,
		userRepo:      userRepo,
		deviceRepo:    deviceRepo,
		surveyRepo:    surveyRepo,
		ledgerRepo:    ledgerRepo,
	}
}

// GET /api/v1/mobile/bootstrap
func (h *MobileHandler) Bootstrap(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	writeSuccess(w, map[string]any{
		"user": map[string]any{
			"id":            user.ID,
			"firebaseUid":   user.FirebaseUID,
			"displayName":   user.DisplayName,
			"phone":         user.Phone,
			"city":          user.City,
			"profileScore":  user.ProfileScore,
			"rewardBalance": user.RewardBalance,
			"kycStatus":     user.KYCStatus,
			"phoneVerified": user.PhoneVerified,
		},
		"config": map[string]any{
			"minWithdrawalAmount": 100,
			"termsAccepted":       true,
			"kvkkAccepted":        true,
		},
	}, "Bootstrap verileri başarıyla yüklendi.")
}

// GET /api/v1/mobile/home
func (h *MobileHandler) Home(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	feed, err := h.surveyService.GetHomeFeed(r.Context(), user)
	if err != nil {
		writeError(w, "Ana sayfa verileri alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, feed, "Ana sayfa verileri başarıyla alındı.")
}

// POST /api/v1/mobile/device
func (h *MobileHandler) RegisterDevice(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	var body struct {
		FCMToken   string  `json:"fcmToken"`
		Platform   string  `json:"platform"`
		AppVersion *string `json:"appVersion"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.FCMToken == "" {
		writeError(w, "fcmToken alanı zorunludur.", http.StatusBadRequest)
		return
	}

	platform := strings.ToLower(body.Platform)
	if platform == "" {
		platform = "android"
	}

	device := &model.Device{
		ID:         fmt.Sprintf("dev_%d_%s", time.Now().Unix(), randString(5)),
		UserID:     user.ID,
		FCMToken:   body.FCMToken,
		Platform:   platform,
		AppVersion: body.AppVersion,
		IsActive:   true,
	}

	if err := h.deviceRepo.Upsert(r.Context(), device); err != nil {
		writeError(w, "Cihaz kaydedilirken hata: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, nil, "Cihaz ve bildirim tokenı başarıyla kaydedildi.")
}

// GET /api/v1/mobile/profile
func (h *MobileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	freshUser, _ := h.userRepo.FindByID(r.Context(), user.ID)
	if freshUser != nil {
		user = freshUser
	}

	writeSuccess(w, user, "Profil bilgileri getirildi.")
}

// PUT /api/v1/mobile/profile
func (h *MobileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	var body model.User
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, "Geçersiz istek gövdesi", http.StatusBadRequest)
		return
	}

	body.ID = user.ID
	if err := h.userRepo.UpdateProfile(r.Context(), &body); err != nil {
		writeError(w, "Profil güncellenemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	updated, _ := h.userRepo.FindByID(r.Context(), user.ID)
	writeSuccess(w, updated, "Profil başarıyla güncellendi.")
}

// POST /api/v1/mobile/profile/verify-phone
func (h *MobileHandler) VerifyPhone(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	var body struct {
		Phone string `json:"phone"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Phone == "" {
		writeError(w, "Telefon numarası gereklidir.", http.StatusBadRequest)
		return
	}

	if err := h.userRepo.VerifyPhone(r.Context(), user.ID, body.Phone); err != nil {
		writeError(w, "Telefon doğrulanamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Grant bonus if not yet verified
	if !user.PhoneVerified {
		_ = h.userRepo.UpdateScore(r.Context(), nil, user.ID, 200)
		idemp := fmt.Sprintf("phone_verify_%s", user.ID)
		_ = h.ledgerRepo.InsertScoreLedger(r.Context(), nil, &model.ProfileScoreLedger{
			ID:             fmt.Sprintf("psl_%d_%s", time.Now().Unix(), randString(5)),
			UserID:         user.ID,
			SourceType:     "PHONE_VERIFIED",
			ScoreDelta:     200,
			IdempotencyKey: &idemp,
		})
	}

	writeSuccess(w, nil, "Telefon başarıyla doğrulandı.")
}

// GET /api/v1/mobile/surveys/completed
func (h *MobileHandler) GetCompletedSurveys(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	ids, err := h.surveyRepo.GetCompletedSurveyIDs(r.Context(), user.ID)
	if err != nil {
		writeError(w, "Tamamlanan anketler alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, map[string]any{"completedSurveyIds": ids}, "Tamamlanan anketler getirildi.")
}

// POST /api/v1/mobile/surveys/{id}/submit
func (h *MobileHandler) SubmitSurvey(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	surveyID := chi.URLParam(r, "id")
	if surveyID == "" {
		writeError(w, "Anket kimliği gereklidir.", http.StatusBadRequest)
		return
	}

	var body struct {
		Answers json.RawMessage `json:"answers"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || len(body.Answers) == 0 {
		writeError(w, "Lütfen anket sorularını cevaplayınız.", http.StatusBadRequest)
		return
	}

	result, err := h.surveyService.SubmitSurvey(r.Context(), user, surveyID, body.Answers)
	if err != nil {
		if strings.Contains(err.Error(), "daha önce tamamladınız") {
			writeError(w, err.Error(), http.StatusConflict)
			return
		}
		writeError(w, "Anket gönderilirken hata: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, result, "Anket başarıyla gönderildi!")
}

// GET /api/v1/mobile/wallet
func (h *MobileHandler) GetWallet(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	freshUser, _ := h.userRepo.FindByID(r.Context(), user.ID)
	if freshUser != nil {
		user = freshUser
	}

	history, err := h.ledgerRepo.GetUserWallet(r.Context(), user.ID)
	if err != nil {
		writeError(w, "Cüzdan geçmişi alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, map[string]any{
		"rewardBalance": user.RewardBalance,
		"profileScore":  user.ProfileScore,
		"history":       history,
	}, "Cüzdan bilgileri getirildi.")
}

// POST /api/v1/mobile/wallet/withdraw
func (h *MobileHandler) Withdraw(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	var body struct {
		Amount            string `json:"amount"`
		IBAN              string `json:"iban"`
		AccountHolderName string `json:"accountHolderName"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.IBAN == "" || body.AccountHolderName == "" {
		writeError(w, "IBAN ve alıcı adı zorunludur.", http.StatusBadRequest)
		return
	}

	reqID := fmt.Sprintf("wd_%d_%s", time.Now().Unix(), randString(5))
	req := &model.WithdrawalRequest{
		ID:                reqID,
		UserID:            user.ID,
		Amount:            body.Amount,
		Currency:          "TL",
		IBAN:              body.IBAN,
		AccountHolderName: body.AccountHolderName,
		Status:            "PENDING",
	}

	if err := h.ledgerRepo.CreateWithdrawalRequest(r.Context(), req); err != nil {
		writeError(w, "Çekim talebi oluşturulamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, req, "Para çekme talebiniz başarıyla alındı.")
}

// POST /api/v1/mobile/permissions/location
func (h *MobileHandler) UpdateLocationPermission(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, map[string]bool{"recorded": true}, "Konum izni kaydedildi.")
}

// GET /api/v1/mobile/legal/documents
func (h *MobileHandler) GetLegalDocuments(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, []map[string]string{
		{"docType": "TERMS", "title": "Kullanım Koşulları", "version": "1.0"},
		{"docType": "PRIVACY", "title": "Gizlilik Politikası", "version": "1.0"},
		{"docType": "KVKK", "title": "KVKK Aydınlatma Metni", "version": "1.0"},
	}, "Yasal belgeler getirildi.")
}

// POST /api/v1/mobile/legal/acceptances
func (h *MobileHandler) AcceptLegalDocument(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, map[string]bool{"accepted": true}, "Yasal onay kaydedildi.")
}
