package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
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
	locationRepo  *repository.LocationRepo
}

func NewMobileHandler(
	surveyService *service.SurveyService,
	userRepo *repository.UserRepository,
	deviceRepo *repository.DeviceRepository,
	surveyRepo *repository.SurveyRepository,
	ledgerRepo *repository.LedgerRepository,
	locationRepo *repository.LocationRepo,
) *MobileHandler {
	return &MobileHandler{
		surveyService: surveyService,
		userRepo:      userRepo,
		deviceRepo:    deviceRepo,
		surveyRepo:    surveyRepo,
		ledgerRepo:    ledgerRepo,
		locationRepo:  locationRepo,
	}
}

// GET & POST /api/v1/mobile/bootstrap
func (h *MobileHandler) Bootstrap(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())

	// Read optional device info from POST body
	var devBody struct {
		DeviceID   string  `json:"deviceId"`
		Platform   string  `json:"platform"`
		AppVersion *string `json:"appVersion"`
	}
	if r.Method == http.MethodPost && r.Body != nil {
		_ = json.NewDecoder(r.Body).Decode(&devBody)
	}

	// Guest fallback if not authenticated yet
	if user == nil {
		writeSuccess(w, map[string]any{
			"userId":                    "guest",
			"id":                        "guest",
			"firebaseUid":               "",
			"displayName":               "Misafir Kullanıcı",
			"firstName":                 "Misafir",
			"lastName":                  "",
			"email":                     nil,
			"phone":                     nil,
			"status":                    "GUEST",
			"kycStatus":                 "NOT_STARTED",
			"iban":                      nil,
			"tckn":                      nil,
			"ibanVerified":              false,
			"profileScore":              0,
			"profileCompleted":          false,
			"phoneVerified":             false,
			"emailVerified":             false,
			"rewardBalance":             0,
			"rewardBalanceFloat":        0.0,
			"completedSurveyIds":        []string{},
			"completedProfileSurveyIds": []string{},
			"missingDocuments":          defaultLegalDocuments(),
			"missingDocumentIds":        []string{"TERMS", "KVKK_NOTICE", "REWARD_TERMS"},
			"communicationPreferences": map[string]bool{
				"pushMarketing":  true,
				"smsMarketing":   false,
				"emailMarketing": false,
				"phoneMarketing": false,
			},
			"user": map[string]any{
				"id":            "guest",
				"displayName":   "Misafir Kullanıcı",
				"profileScore":  0,
				"rewardBalance": "0.00",
			},
			"config": map[string]any{
				"minWithdrawalAmount": 100,
				"termsAccepted":       false,
				"kvkkAccepted":        false,
			},
		}, "Misafir oturumu hazırlandı.")
		return
	}

	if devBody.DeviceID != "" {
		_ = h.deviceRepo.Upsert(r.Context(), &model.Device{
			ID:         devBody.DeviceID,
			UserID:     user.ID,
			FCMToken:   devBody.DeviceID,
			Platform:   devBody.Platform,
			AppVersion: devBody.AppVersion,
			IsActive:   true,
		})
	}

	// Split DisplayName into firstName / lastName
	nameParts := strings.Fields(user.DisplayName)
	firstName := ""
	lastName := ""
	if len(nameParts) > 0 {
		firstName = nameParts[0]
		if len(nameParts) > 1 {
			lastName = strings.Join(nameParts[1:], " ")
		}
	}

	// Partition completed survey IDs
	completedIDs, _ := h.surveyRepo.GetCompletedSurveyIDs(r.Context(), user.ID)
	regularCompleted := make([]string, 0)
	profileCompleted := make([]string, 0)
	for _, id := range completedIDs {
		if strings.HasPrefix(id, "pq_") {
			profileCompleted = append(profileCompleted, id)
		} else {
			regularCompleted = append(regularCompleted, id)
		}
	}

	rewardFloat, _ := strconv.ParseFloat(user.RewardBalance, 64)
	rewardInt := int(rewardFloat)

	var birthDateStr *string
	if user.BirthDate != nil {
		formatted := user.BirthDate.Format("2006-01-02")
		birthDateStr = &formatted
	}

	writeSuccess(w, map[string]any{
		"userId":                    user.ID,
		"id":                        user.ID,
		"firebaseUid":               user.FirebaseUID,
		"displayName":               user.DisplayName,
		"firstName":                 firstName,
		"lastName":                  lastName,
		"email":                     user.Email,
		"phone":                     user.Phone,
		"photoUrl":                  nil,
		"status":                    "ACTIVE",
		"kycStatus":                 user.KYCStatus,
		"iban":                      user.IBAN,
		"tckn":                      user.TCKN,
		"ibanVerified":              user.IBAN != nil && *user.IBAN != "",
		"profileScore":              user.ProfileScore,
		"profileCompleted":          user.City != nil && *user.City != "",
		"phoneVerified":             user.PhoneVerified,
		"emailVerified":             user.Email != nil && *user.Email != "",
		"rewardBalance":             rewardInt,
		"rewardBalanceFloat":        rewardFloat,
		"activeDeviceId":            nil,
		"isUnderage":                false,
		"underageBlocked":           false,
		"city":                      user.City,
		"district":                  user.District,
		"gender":                    user.Gender,
		"birthDate":                 birthDateStr,
		"age":                       user.Age,
		"maritalStatus":             user.MaritalStatus,
		"childrenStatus":            user.ChildrenStatus,
		"hometown":                  user.Hometown,
		"education":                 user.Education,
		"occupation":                user.Occupation,
		"completedSurveyIds":        regularCompleted,
		"completedProfileSurveyIds": profileCompleted,
		"missingDocuments":          defaultLegalDocuments(),
		"missingDocumentIds":        []string{"TERMS", "KVKK_NOTICE", "REWARD_TERMS"},
		"communicationPreferences": map[string]bool{
			"pushMarketing":  true,
			"smsMarketing":   false,
			"emailMarketing": false,
			"phoneMarketing": false,
		},
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
			"iban":          user.IBAN,
			"tckn":          user.TCKN,
		},
		"config": map[string]any{
			"minWithdrawalAmount": 100,
			"termsAccepted":       true,
			"kvkkAccepted":        true,
		},
	}, "Bootstrap verileri başarıyla yüklendi.")
}

// GET /api/v1/mobile/profile-questions
func (h *MobileHandler) GetProfileQuestions(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	resp, err := h.surveyRepo.ListProfileQuestionsForUser(r.Context(), user.ID)
	if err != nil {
		writeError(w, "Profil soruları alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, resp, "Profil soruları başarıyla getirildi.")
}

// POST /api/v1/mobile/profile-questions
func (h *MobileHandler) SubmitProfileQuestions(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	var body struct {
		Answers    []repository.ProfileAnswerInput `json:"answers"`
		QuestionID *string                         `json:"questionId"`
		OptionID   *string                         `json:"optionId"`
		SurveyID   *string                         `json:"surveyId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, "Geçersiz istek gövdesi: "+err.Error(), http.StatusBadRequest)
		return
	}

	var answersList []repository.ProfileAnswerInput
	if len(body.Answers) > 0 {
		answersList = body.Answers
	} else if body.QuestionID != nil && body.OptionID != nil {
		answersList = append(answersList, repository.ProfileAnswerInput{
			QuestionID: *body.QuestionID,
			OptionID:   *body.OptionID,
			SurveyID:   body.SurveyID,
		})
	}

	if len(answersList) == 0 {
		writeError(w, "En az bir cevap girilmelidir.", http.StatusBadRequest)
		return
	}

	scoreAwarded, err := h.surveyRepo.SubmitProfileAnswers(r.Context(), user.ID, answersList)
	if err != nil {
		writeError(w, "Cevaplar kaydedilemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, map[string]any{
		"success":           true,
		"batchScoreAwarded": scoreAwarded,
	}, "Cevaplar başarıyla kaydedildi.")
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

	var birthDateStr *string
	if user.BirthDate != nil {
		formatted := user.BirthDate.Format("2006-01-02")
		birthDateStr = &formatted
	}

	nameParts := strings.Fields(user.DisplayName)
	firstName := ""
	lastName := ""
	if len(nameParts) > 0 {
		firstName = nameParts[0]
		if len(nameParts) > 1 {
			lastName = strings.Join(nameParts[1:], " ")
		}
	}

	writeSuccess(w, map[string]any{
		"id":             user.ID,
		"userId":         user.ID,
		"firebaseUid":    user.FirebaseUID,
		"displayName":    user.DisplayName,
		"firstName":      firstName,
		"lastName":       lastName,
		"phone":          user.Phone,
		"email":          user.Email,
		"gender":         user.Gender,
		"city":           user.City,
		"district":       user.District,
		"birthDate":      birthDateStr,
		"age":            user.Age,
		"maritalStatus":  user.MaritalStatus,
		"childrenStatus": user.ChildrenStatus,
		"hometown":       user.Hometown,
		"education":      user.Education,
		"occupation":     user.Occupation,
		"iban":           user.IBAN,
		"tckn":           user.TCKN,
		"kycStatus":      user.KYCStatus,
		"profileScore":   user.ProfileScore,
		"rewardBalance":  user.RewardBalance,
		"phoneVerified":  user.PhoneVerified,
	}, "Profil bilgileri getirildi.")
}

// PUT /api/v1/mobile/profile
func (h *MobileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		writeError(w, "Yetkilendirme başarısız", http.StatusUnauthorized)
		return
	}

	var input struct {
		DisplayName    *string `json:"displayName"`
		FirstName      *string `json:"firstName"`
		LastName       *string `json:"lastName"`
		Gender         *string `json:"gender"`
		City           *string `json:"city"`
		District       *string `json:"district"`
		BirthDate      *string `json:"birthDate"`
		Age            *int    `json:"age"`
		MaritalStatus  *string `json:"maritalStatus"`
		ChildrenStatus *string `json:"childrenStatus"`
		Hometown       *string `json:"hometown"`
		Education      *string `json:"education"`
		Occupation     *string `json:"occupation"`
		IBAN           *string `json:"iban"`
		TCKN           *string `json:"tckn"`
		KYCStatus      *string `json:"kycStatus"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, "Geçersiz istek gövdesi: "+err.Error(), http.StatusBadRequest)
		return
	}

	dName := user.DisplayName
	if input.DisplayName != nil && *input.DisplayName != "" {
		dName = *input.DisplayName
	} else if input.FirstName != nil || input.LastName != nil {
		fn := ""
		if input.FirstName != nil {
			fn = *input.FirstName
		}
		ln := ""
		if input.LastName != nil {
			ln = *input.LastName
		}
		combined := strings.TrimSpace(fn + " " + ln)
		if combined != "" {
			dName = combined
		}
	}

	u := &model.User{
		ID:             user.ID,
		DisplayName:    dName,
		Gender:         input.Gender,
		City:           input.City,
		District:       input.District,
		MaritalStatus:  input.MaritalStatus,
		ChildrenStatus: input.ChildrenStatus,
		Hometown:       input.Hometown,
		Education:      input.Education,
		Occupation:     input.Occupation,
		IBAN:           input.IBAN,
		TCKN:           input.TCKN,
	}

	if input.KYCStatus != nil && *input.KYCStatus != "" {
		u.KYCStatus = *input.KYCStatus
	}
	if input.Age != nil && *input.Age > 0 {
		u.Age = *input.Age
	}

	if input.BirthDate != nil && *input.BirthDate != "" {
		parsedTime, err := parseFlexibleDate(*input.BirthDate)
		if err == nil {
			u.BirthDate = &parsedTime
			if u.Age == 0 {
				u.Age = time.Now().Year() - parsedTime.Year()
			}
		}
	}

	if err := h.userRepo.UpdateProfile(r.Context(), u); err != nil {
		writeError(w, "Profil güncellenemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	updated, _ := h.userRepo.FindByID(r.Context(), user.ID)
	if updated == nil {
		updated = user
	}
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
	if history == nil {
		history = []model.RewardLedger{}
	}

	scoreHistory, _ := h.ledgerRepo.GetUserScoreHistory(r.Context(), user.ID)
	if scoreHistory == nil {
		scoreHistory = []model.ProfileScoreLedger{}
	}

	vouchers, _ := h.ledgerRepo.GetUserVouchers(r.Context(), user.ID)
	if vouchers == nil {
		vouchers = []model.Voucher{}
	}

	writeSuccess(w, map[string]any{
		"rewardBalance": user.RewardBalance,
		"profileScore":  user.ProfileScore,
		"rewardHistory": history,
		"scoreHistory":  scoreHistory,
		"vouchers":      vouchers,
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
	writeSuccess(w, defaultLegalDocuments(), "Yasal belgeler getirildi.")
}

// POST /api/v1/mobile/legal/acceptances
func (h *MobileHandler) AcceptLegalDocument(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	var body struct {
		DocumentID string `json:"documentId"`
		DocType    string `json:"docType"`
		Version    string `json:"version"`
		Accepted   *bool  `json:"accepted"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)

	docType := body.DocType
	if docType == "" {
		docType = body.DocumentID
	}
	if docType == "" {
		docType = "TERMS"
	}
	version := body.Version
	if version == "" {
		version = "1.0"
	}
	accepted := true
	if body.Accepted != nil {
		accepted = *body.Accepted
	}

	if user != nil {
		cid := fmt.Sprintf("uc_%d_%s", time.Now().Unix(), randString(5))
		_ = h.ledgerRepo.RecordConsent(r.Context(), cid, user.ID, docType, version, accepted)
	}

	writeSuccess(w, map[string]bool{"accepted": true}, "Yasal onay kaydedildi.")
}

func defaultLegalDocuments() []map[string]any {
	return []map[string]any{
		{
			"documentId":           "TERMS",
			"type":                 "TERMS",
			"version":              "1.0",
			"title":                "Kullanım Koşulları ve Üyelik Sözleşmesi",
			"url":                  "https://www.pagapp.com.tr/terms",
			"contentHash":          "PAG_TERMS_V1.0",
			"isRequired":           true,
			"isActive":             true,
			"requiresReacceptance": false,
		},
		{
			"documentId":           "KVKK_NOTICE",
			"type":                 "KVKK_NOTICE",
			"version":              "1.0",
			"title":                "Kullanıcı Gizliliği ve KVKK Aydınlatma Metni",
			"url":                  "https://www.pagapp.com.tr/user-privacy",
			"contentHash":          "PAG_KVKK_NOTICE_V1.0",
			"isRequired":           true,
			"isActive":             true,
			"requiresReacceptance": false,
		},
		{
			"documentId":           "REWARD_TERMS",
			"type":                 "REWARD_TERMS",
			"version":              "1.0",
			"title":                "Ödül ve Kampanya Katılım Koşulları",
			"url":                  "https://www.pagapp.com.tr/reward-terms",
			"contentHash":          "PAG_REWARD_TERMS_V1.0",
			"isRequired":           true,
			"isActive":             true,
			"requiresReacceptance": false,
		},
	}
}

func parseFlexibleDate(s string) (time.Time, error) {
	s = strings.TrimSpace(s)
	formats := []string{
		"2006-01-02",
		time.RFC3339,
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02T15:04:05",
		"02.01.2006",
		"02/01/2006",
	}
	for _, f := range formats {
		if t, err := time.Parse(f, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("cannot parse date: %s", s)
}

// GET /api/v1/mobile/locations
func (h *MobileHandler) GetLocations(w http.ResponseWriter, r *http.Request) {
	if h.locationRepo == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(model.APIResponse{
			Success: false,
			Error:   "Location repository not configured",
		})
		return
	}

	locations, err := h.locationRepo.GetLocations(r.Context())
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(model.APIResponse{
			Success: false,
			Error:   "Konum verileri yüklenemedi: " + err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(model.APIResponse{
		Success: true,
		Data: map[string]any{
			"cities": locations,
		},
	})
}

