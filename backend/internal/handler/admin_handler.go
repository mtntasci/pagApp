package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"pag-backend/internal/model"
	"pag-backend/internal/repository"
	"pag-backend/internal/storage"
)

type AdminHandler struct {
	adminOpsRepo   *repository.AdminOpsRepository
	surveyRepo     *repository.SurveyRepository
	portalUserRepo *repository.PortalUserRepository
	storage        storage.Storage
}

func NewAdminHandler(
	adminOpsRepo *repository.AdminOpsRepository,
	surveyRepo *repository.SurveyRepository,
	portalUserRepo *repository.PortalUserRepository,
	storage storage.Storage,
) *AdminHandler {
	return &AdminHandler{
		adminOpsRepo:   adminOpsRepo,
		surveyRepo:     surveyRepo,
		portalUserRepo: portalUserRepo,
		storage:        storage,
	}
}

// GET /api/v1/admin/dashboard/metrics
func (h *AdminHandler) GetMetrics(w http.ResponseWriter, r *http.Request) {
	metrics, err := h.adminOpsRepo.GetDashboardMetrics(r.Context())
	if err != nil {
		writeError(w, "Metrikler alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, metrics, "Metrikler getirildi.")
}

// GET /api/v1/admin/surveys
func (h *AdminHandler) ListSurveys(w http.ResponseWriter, r *http.Request) {
	limit := 100
	offset := 0
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}
	if o := r.URL.Query().Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	surveys, total, err := h.surveyRepo.AdminList(r.Context(), limit, offset)
	if err != nil {
		writeError(w, "Anketler alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}

	filterType := r.URL.Query().Get("type")
	if filterType == "" {
		filterType = r.URL.Query().Get("surveyType")
	}
	if filterType == "PROFILE" {
		filtered := make([]model.Survey, 0)
		for _, s := range surveys {
			if s.SurveyType == "PROFILE" || strings.HasPrefix(s.ID, "pq_") {
				filtered = append(filtered, s)
			}
		}
		surveys = filtered
	} else if filterType == "CAMPAIGN" || filterType == "GENERAL" {
		filtered := make([]model.Survey, 0)
		for _, s := range surveys {
			if s.SurveyType != "PROFILE" && !strings.HasPrefix(s.ID, "pq_") {
				filtered = append(filtered, s)
			}
		}
		surveys = filtered
	}

	// Fetch questions for each survey
	surveyIDs := make([]string, 0, len(surveys))
	for _, s := range surveys {
		surveyIDs = append(surveyIDs, s.ID)
	}
	qMap, _ := h.surveyRepo.GetQuestionsForSurveys(r.Context(), surveyIDs)
	for i := range surveys {
		surveys[i].Questions = qMap[surveys[i].ID]
		surveys[i].QuestionCount = len(surveys[i].Questions)
	}

	writeSuccessWithMeta(w, map[string]any{
		"surveys": surveys,
		"total":   len(surveys),
	}, "Anketler getirildi.", map[string]any{"total": total})
}

// POST /api/v1/admin/surveys
func (h *AdminHandler) CreateOrUpdateSurvey(w http.ResponseWriter, r *http.Request) {
	var body struct {
		model.Survey
		SurveyID  string           `json:"surveyId"`
		Questions []model.Question `json:"questions"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, "Geçersiz istek verisi: "+err.Error(), http.StatusBadRequest)
		return
	}

	if body.ID == "" && body.SurveyID != "" {
		body.ID = body.SurveyID
	}
	if body.ID == "" {
		body.ID = fmt.Sprintf("srv_%d_%s", time.Now().Unix(), randString(5))
	}
	if body.Status == "" {
		body.Status = "ACTIVE"
	}
	if body.OwnerType == "" {
		body.OwnerType = "PAG"
	}

	if err := h.surveyRepo.AdminCreateOrUpdate(r.Context(), &body.Survey, body.Questions); err != nil {
		writeError(w, "Anket kaydedilemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, body.Survey, "Anket başarıyla kaydedildi.")
}

// DELETE /api/v1/admin/surveys
func (h *AdminHandler) DeleteSurvey(w http.ResponseWriter, r *http.Request) {
	surveyID := r.URL.Query().Get("id")
	if surveyID == "" {
		surveyID = r.URL.Query().Get("surveyId")
	}
	surveyType := r.URL.Query().Get("type")
	if surveyType == "" {
		surveyType = r.URL.Query().Get("surveyType")
	}

	if surveyType == "PROFILE" {
		_ = h.surveyRepo.AdminDeleteByType(r.Context(), "PROFILE")
		writeSuccess(w, nil, "Tüm profil anketleri başarıyla silindi.")
		return
	}
	if surveyType == "GENERAL" || surveyType == "CAMPAIGN" {
		_ = h.surveyRepo.AdminDeleteNonProfile(r.Context())
		writeSuccess(w, nil, "Tüm genel anketler başarıyla silindi.")
		return
	}

	if surveyID == "" {
		writeError(w, "Silinecek anket kimliği (id) zorunludur.", http.StatusBadRequest)
		return
	}

	if err := h.surveyRepo.AdminDelete(r.Context(), surveyID); err != nil {
		writeError(w, "Anket silinemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, map[string]string{"surveyId": surveyID}, "Anket başarıyla silindi.")
}

// GET /api/v1/admin/users
func (h *AdminHandler) ListPortalUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.portalUserRepo.List(r.Context(), 100)
	if err != nil {
		writeError(w, "Kullanıcılar alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, map[string]any{"users": users}, "Portal kullanıcıları listelendi.")
}

// POST /api/v1/admin/users
func (h *AdminHandler) CreatePortalUser(w http.ResponseWriter, r *http.Request) {
	var body model.PortalUser
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Email == "" {
		writeError(w, "E-posta adresi zorunludur.", http.StatusBadRequest)
		return
	}

	if body.ID == "" {
		body.ID = fmt.Sprintf("pusr_%d_%s", time.Now().Unix(), randString(5))
	}
	if body.FirebaseUID == "" {
		body.FirebaseUID = fmt.Sprintf("puid_%d_%s", time.Now().Unix(), randString(5))
	}
	body.IsActive = true

	if err := h.portalUserRepo.Upsert(r.Context(), &body); err != nil {
		writeError(w, "Kullanıcı kaydedilemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, body, "Portal kullanıcısı kaydedildi.")
}

// DELETE /api/v1/admin/users
func (h *AdminHandler) DeletePortalUser(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	uid := r.URL.Query().Get("uid")
	if email == "" && uid == "" {
		writeError(w, "Silinecek email veya uid belirtilmelidir.", http.StatusBadRequest)
		return
	}

	if err := h.portalUserRepo.DeleteByEmailOrUID(r.Context(), email, uid); err != nil {
		writeError(w, "Kullanıcı silinemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, nil, "Kullanıcı başarıyla silindi.")
}

// GET /api/v1/admin/organizations
func (h *AdminHandler) ListOrganizations(w http.ResponseWriter, r *http.Request) {
	list, err := h.adminOpsRepo.ListOrganizations(r.Context())
	if err != nil {
		writeError(w, "Kurumlar alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, map[string]any{"organizations": list}, "Kurumlar listelendi.")
}

// POST /api/v1/admin/organizations
func (h *AdminHandler) CreateOrganization(w http.ResponseWriter, r *http.Request) {
	var body model.Organization
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		writeError(w, "Kurum adı zorunludur.", http.StatusBadRequest)
		return
	}
	if body.ID == "" {
		body.ID = fmt.Sprintf("org_%d_%s", time.Now().Unix(), randString(5))
	}
	if body.Slug == "" {
		body.Slug = strings.ToLower(strings.ReplaceAll(body.Name, " ", "-"))
	}
	body.IsActive = true

	if err := h.adminOpsRepo.UpsertOrganization(r.Context(), &body); err != nil {
		writeError(w, "Kurum kaydedilemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, body, "Kurum kaydedildi.")
}

// GET /api/v1/admin/categories
func (h *AdminHandler) ListCategories(w http.ResponseWriter, r *http.Request) {
	list, err := h.adminOpsRepo.ListCategories(r.Context())
	if err != nil {
		writeError(w, "Kategoriler alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, map[string]any{"categories": list}, "Kategoriler listelendi.")
}

// POST /api/v1/admin/categories
func (h *AdminHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	bodyBytes, _ := io.ReadAll(r.Body)

	var raw map[string]json.RawMessage
	_ = json.Unmarshal(bodyBytes, &raw)

	// Check if bulk categories update: { "categories": [...] }
	if catRaw, ok := raw["categories"]; ok {
		var catList []struct {
			ID        string `json:"id"`
			Name      string `json:"name"`
			Icon      string `json:"icon"`
			SortOrder int    `json:"sortOrder"`
			IsVisible *bool  `json:"isVisible"`
			IsActive  *bool  `json:"isActive"`
		}
		if err := json.Unmarshal(catRaw, &catList); err == nil && len(catList) > 0 {
			for idx, c := range catList {
				order := c.SortOrder
				if order == 0 {
					order = idx + 1
				}
				active := true
				if c.IsVisible != nil {
					active = *c.IsVisible
				} else if c.IsActive != nil {
					active = *c.IsActive
				}
				catID := c.ID
				if catID == "" {
					catID = fmt.Sprintf("cat_%d_%s", time.Now().Unix(), randString(4))
				}
				var iconPtr *string
				if c.Icon != "" {
					iconPtr = &c.Icon
				}
				_ = h.adminOpsRepo.UpsertCategory(r.Context(), &model.SurveyCategory{
					ID:        catID,
					Name:      c.Name,
					Icon:      iconPtr,
					SortOrder: order,
					IsActive:  active,
				})
			}
			writeSuccess(w, map[string]string{"message": "Kategoriler güncellendi."}, "Kategoriler güncellendi.")
			return
		}
	}

	var body model.SurveyCategory
	if err := json.Unmarshal(bodyBytes, &body); err != nil || body.Name == "" {
		writeError(w, "Kategori adı zorunludur.", http.StatusBadRequest)
		return
	}
	if body.ID == "" {
		body.ID = fmt.Sprintf("cat_%d_%s", time.Now().Unix(), randString(5))
	}
	body.IsActive = true

	if err := h.adminOpsRepo.UpsertCategory(r.Context(), &body); err != nil {
		writeError(w, "Kategori kaydedilemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, body, "Kategori kaydedildi.")
}

// GET /api/v1/admin/applications
func (h *AdminHandler) ListApplications(w http.ResponseWriter, r *http.Request) {
	list, err := h.adminOpsRepo.ListApplications(r.Context())
	if err != nil {
		writeError(w, "Başvurular alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if list == nil {
		list = []model.CompanyApplication{}
	}
	writeSuccess(w, map[string]any{"applications": list}, "Başvurular listelendi.")
}

// POST /api/v1/admin/applications
func (h *AdminHandler) CreateApplication(w http.ResponseWriter, r *http.Request) {
	var body model.CompanyApplication
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.CompanyName == "" || body.Phone == "" {
		writeError(w, "Şirket adı ve telefon numarası zorunludur.", http.StatusBadRequest)
		return
	}
	if body.ID == "" {
		body.ID = fmt.Sprintf("app_%d_%s", time.Now().Unix(), randString(5))
	}

	if err := h.adminOpsRepo.CreateApplication(r.Context(), &body); err != nil {
		writeError(w, "Başvuru kaydedilemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, body, "Başvuru başarıyla alındı.")
}

// GET /api/v1/admin/verification/campaigns
func (h *AdminHandler) ListVerificationCampaigns(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	list, err := h.adminOpsRepo.ListVerificationCampaigns(r.Context(), status)
	if err != nil {
		writeError(w, "Doğrulama kampanyaları alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, list, "Doğrulama kampanyaları listelendi.")
}

// POST /api/v1/admin/verification/campaigns
func (h *AdminHandler) CreateVerificationCampaign(w http.ResponseWriter, r *http.Request) {
	var body struct {
		model.VerificationCampaign
		RespondentIDs []string `json:"respondentIds"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.MasterSurveyID == "" {
		writeError(w, "masterSurveyId zorunludur.", http.StatusBadRequest)
		return
	}
	if body.ID == "" {
		body.ID = fmt.Sprintf("vcamp_%d_%s", time.Now().Unix(), randString(5))
	}
	body.Status = "ACTIVE"
	body.RequestedCount = len(body.RespondentIDs)

	if err := h.adminOpsRepo.CreateVerificationCampaign(r.Context(), &body.VerificationCampaign, body.RespondentIDs); err != nil {
		writeError(w, "Doğrulama kampanyası oluşturulamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, body.VerificationCampaign, "Doğrulama kampanyası başarıyla oluşturuldu.")
}

// GET /api/v1/admin/verification/assignments
func (h *AdminHandler) ListVerificationAssignments(w http.ResponseWriter, r *http.Request) {
	campaignID := r.URL.Query().Get("campaignId")
	agentID := r.URL.Query().Get("agentId")
	status := r.URL.Query().Get("status")

	list, err := h.adminOpsRepo.ListVerificationAssignments(r.Context(), campaignID, agentID, status)
	if err != nil {
		writeError(w, "Arama kuyruğu alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, list, "Arama kuyruğu getirildi.")
}

// POST /api/v1/admin/verification/calls/result
func (h *AdminHandler) SubmitCallResult(w http.ResponseWriter, r *http.Request) {
	var body struct {
		AssignmentID string          `json:"assignmentId"`
		AgentID      string          `json:"agentId"`
		CallResult   string          `json:"callResult"`
		Notes        string          `json:"notes"`
		Answers      json.RawMessage `json:"answers"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.AssignmentID == "" || body.CallResult == "" {
		writeError(w, "assignmentId ve callResult zorunludur.", http.StatusBadRequest)
		return
	}

	if err := h.adminOpsRepo.SubmitCallResult(r.Context(), body.AssignmentID, body.AgentID, body.CallResult, body.Notes, body.Answers); err != nil {
		writeError(w, "Arama sonucu kaydedilemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, nil, "Arama sonucu başarıyla kaydedildi.")
}

// GET /api/v1/admin/verification/respondents
func (h *AdminHandler) ListRespondents(w http.ResponseWriter, r *http.Request) {
	surveyID := r.URL.Query().Get("surveyId")
	city := r.URL.Query().Get("city")
	gender := r.URL.Query().Get("gender")
	minAge, _ := strconv.Atoi(r.URL.Query().Get("minAge"))
	maxAge, _ := strconv.Atoi(r.URL.Query().Get("maxAge"))

	list, err := h.adminOpsRepo.ListRespondents(r.Context(), surveyID, city, gender, minAge, maxAge)
	if err != nil {
		writeError(w, "Katılımcılar alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, list, "Katılımcılar listelendi.")
}

// POST /api/v1/admin/media/upload (Cloudflare R2 Media Upload)
func (h *AdminHandler) UploadMedia(w http.ResponseWriter, r *http.Request) {
	// Parse 20MB max multipart form
	if err := r.ParseMultipartForm(20 << 20); err != nil {
		writeError(w, "Dosya boyutu çok büyük (azami 20MB)", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, "Geçersiz dosya yüklemesi: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" && ext != ".gif" {
		writeError(w, "Desteklenmeyen dosya formatı. Yalnızca görsel yüklenebilir.", http.StatusBadRequest)
		return
	}

	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "image/jpeg"
	}

	folder := r.FormValue("folder")
	if folder == "" {
		folder = "surveys"
	}

	key := fmt.Sprintf("%s/%d_%s%s", folder, time.Now().Unix(), randString(6), ext)
	publicURL, err := h.storage.Upload(r.Context(), key, file, contentType)
	if err != nil {
		writeError(w, "R2 depolama yükleme hatası: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, map[string]string{
		"url": publicURL,
		"key": key,
	}, "Görsel Cloudflare R2'ye başarıyla yüklendi.")
}

// GET /api/v1/admin/stories
func (h *AdminHandler) ListStories(w http.ResponseWriter, r *http.Request) {
	resp, err := h.adminOpsRepo.ListStories(r.Context())
	if err != nil {
		writeError(w, "Story listesi alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeSuccess(w, resp, "Story listesi getirildi.")
}

// POST /api/v1/admin/stories
func (h *AdminHandler) SaveStory(w http.ResponseWriter, r *http.Request) {
	var body struct {
		SurveyID      string  `json:"surveyId"`
		Label         string  `json:"label"`
		ShortLabel    string  `json:"shortLabel"`
		StoryLabel    string  `json:"storyLabel"`
		Title         string  `json:"title"`
		ImageCategory string  `json:"imageCategory"`
		ImageURL      *string `json:"imageUrl"`
		Position      *int    `json:"position"`
		SortOrder     *int    `json:"sortOrder"`
		IsActive      *bool   `json:"isActive"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, "Geçersiz istek gövdesi: "+err.Error(), http.StatusBadRequest)
		return
	}

	if body.SurveyID == "" {
		writeError(w, "Survey ID zorunludur.", http.StatusBadRequest)
		return
	}

	lbl := body.ShortLabel
	if lbl == "" {
		lbl = body.Label
	}
	if lbl == "" {
		lbl = body.StoryLabel
	}
	if lbl == "" {
		lbl = body.Title
	}
	if lbl == "" {
		lbl = "Anket"
	}

	pos := 999
	if body.SortOrder != nil {
		pos = *body.SortOrder
	} else if body.Position != nil {
		pos = *body.Position
	}

	active := true
	if body.IsActive != nil {
		active = *body.IsActive
	}

	storyCfg := map[string]interface{}{
		"showInStory":   active,
		"label":         lbl,
		"shortLabel":    lbl,
		"storyLabel":    lbl,
		"imageCategory": body.ImageCategory,
		"position":      pos,
		"sortOrder":     pos,
		"isActive":      active,
	}
	if body.ImageURL != nil {
		storyCfg["imageUrl"] = *body.ImageURL
	}

	if err := h.adminOpsRepo.SaveStory(r.Context(), body.SurveyID, storyCfg); err != nil {
		writeError(w, "Story kaydedilemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeSuccess(w, map[string]interface{}{
		"success":     true,
		"storyConfig": storyCfg,
	}, "Story başarıyla kaydedildi.")
}
