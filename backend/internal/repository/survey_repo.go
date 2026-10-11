package repository

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"pag-backend/internal/model"
)

type SurveyRepository struct {
	pool *pgxpool.Pool
}

func NewSurveyRepository(pool *pgxpool.Pool) *SurveyRepository {
	return &SurveyRepository{pool: pool}
}

func (r *SurveyRepository) FindByID(ctx context.Context, id string) (*model.Survey, error) {
	query := `
		SELECT id, title, description, owner_type, organization_id, survey_type,
		       category, status, is_highlighted, is_archived, profile_score_reward,
		       targeting_config, reward_definition, story_config, has_verification,
		       verification_config, verification_target_count, verification_org_quota,
		       start_at, end_at, created_at, updated_at
		FROM surveys
		WHERE id = $1
		LIMIT 1
	`
	row := r.pool.QueryRow(ctx, query, id)
	return scanSurvey(row)
}

func (r *SurveyRepository) GetCompletedSurveyIDs(ctx context.Context, userID string) ([]string, error) {
	query := `SELECT survey_id FROM survey_responses WHERE user_id = $1`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err == nil {
			ids = append(ids, id)
		}
	}
	return ids, nil
}

func (r *SurveyRepository) HasUserCompleted(ctx context.Context, surveyID, userID string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM survey_responses WHERE survey_id = $1 AND user_id = $2)`
	var exists bool
	err := r.pool.QueryRow(ctx, query, surveyID, userID).Scan(&exists)
	return exists, err
}

func (r *SurveyRepository) CountResponses(ctx context.Context, surveyID string) (int, error) {
	query := `SELECT COUNT(*) FROM survey_responses WHERE survey_id = $1`
	var count int
	err := r.pool.QueryRow(ctx, query, surveyID).Scan(&count)
	return count, err
}

func (r *SurveyRepository) ListActiveForUser(ctx context.Context, user *model.User) ([]model.Survey, error) {
	completedIDs, err := r.GetCompletedSurveyIDs(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	query := `
		SELECT id, title, description, owner_type, organization_id, survey_type,
		       category, status, is_highlighted, is_archived, profile_score_reward,
		       targeting_config, reward_definition, story_config, has_verification,
		       verification_config, verification_target_count, verification_org_quota,
		       start_at, end_at, created_at, updated_at
		FROM surveys
		WHERE is_archived = FALSE
		  AND status IN ('ACTIVE', 'APPROVED')
		  AND survey_type != 'PROFILE'
		  AND (start_at IS NULL OR start_at <= NOW())
		  AND (end_at IS NULL OR end_at >= NOW())
		ORDER BY is_highlighted DESC, created_at DESC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	completedMap := make(map[string]bool)
	for _, id := range completedIDs {
		completedMap[id] = true
	}

	var eligible []model.Survey
	for rows.Next() {
		s, err := scanSurvey(rows)
		if err != nil {
			return nil, err
		}
		if s == nil || completedMap[s.ID] {
			continue
		}

		if matchesTargeting(s.TargetingConfig, user) {
			eligible = append(eligible, *s)
		}
	}
	return eligible, nil
}

func (r *SurveyRepository) GetQuestionsForSurveys(ctx context.Context, surveyIDs []string) (map[string][]model.Question, error) {
	result := make(map[string][]model.Question)
	if len(surveyIDs) == 0 {
		return result, nil
	}

	query := `
		SELECT id, survey_id, question_order, text, question_type, options, is_required
		FROM questions
		WHERE survey_id = ANY($1)
		ORDER BY question_order ASC
	`
	rows, err := r.pool.Query(ctx, query, surveyIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var q model.Question
		var optionsRaw []byte
		if err := rows.Scan(&q.ID, &q.SurveyID, &q.QuestionOrder, &q.Text, &q.QuestionType, &optionsRaw, &q.IsRequired); err != nil {
			return nil, err
		}
		q.Options = optionsRaw
		result[q.SurveyID] = append(result[q.SurveyID], q)
	}
	return result, nil
}

func (r *SurveyRepository) GetQuestions(ctx context.Context, surveyID string) ([]model.Question, error) {
	query := `
		SELECT id, survey_id, question_order, text, question_type, options, is_required
		FROM questions
		WHERE survey_id = $1
		ORDER BY question_order ASC
	`
	rows, err := r.pool.Query(ctx, query, surveyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []model.Question
	for rows.Next() {
		var q model.Question
		var optionsRaw []byte
		if err := rows.Scan(&q.ID, &q.SurveyID, &q.QuestionOrder, &q.Text, &q.QuestionType, &optionsRaw, &q.IsRequired); err != nil {
			return nil, err
		}
		q.Options = optionsRaw
		questions = append(questions, q)
	}
	return questions, nil
}

func (r *SurveyRepository) SubmitResponse(ctx context.Context, tx pgx.Tx, resp *model.SurveyResponse) error {
	query := `
		INSERT INTO survey_responses (id, survey_id, user_id, answers, is_verified, completed_at, created_at)
		VALUES ($1, $2, $3, $4, FALSE, $5, NOW())
	`
	var err error
	if tx != nil {
		_, err = tx.Exec(ctx, query, resp.ID, resp.SurveyID, resp.UserID, resp.Answers, resp.CompletedAt)
	} else {
		_, err = r.pool.Exec(ctx, query, resp.ID, resp.SurveyID, resp.UserID, resp.Answers, resp.CompletedAt)
	}
	return err
}

func (r *SurveyRepository) AdminList(ctx context.Context, limit, offset int) ([]model.Survey, int, error) {
	var total int
	countQuery := `SELECT COUNT(*) FROM surveys WHERE is_archived = FALSE`
	if err := r.pool.QueryRow(ctx, countQuery).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, title, description, owner_type, organization_id, survey_type,
		       category, status, is_highlighted, is_archived, profile_score_reward,
		       targeting_config, reward_definition, story_config, has_verification,
		       verification_config, verification_target_count, verification_org_quota,
		       start_at, end_at, created_at, updated_at
		FROM surveys
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var surveys []model.Survey
	for rows.Next() {
		s, err := scanSurvey(rows)
		if err != nil {
			return nil, 0, err
		}
		if s != nil {
			surveys = append(surveys, *s)
		}
	}
	return surveys, total, nil
}

func (r *SurveyRepository) AdminCreateOrUpdate(ctx context.Context, s *model.Survey, questions []model.Question) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	upsertSurvey := `
		INSERT INTO surveys (
			id, title, description, owner_type, organization_id, survey_type,
			category, status, is_highlighted, is_archived, profile_score_reward,
			targeting_config, reward_definition, story_config, has_verification,
			verification_config, verification_target_count, verification_org_quota,
			start_at, end_at, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW()
		)
		ON CONFLICT (id) DO UPDATE SET
			title = EXCLUDED.title,
			description = EXCLUDED.description,
			owner_type = EXCLUDED.owner_type,
			organization_id = EXCLUDED.organization_id,
			survey_type = EXCLUDED.survey_type,
			category = EXCLUDED.category,
			status = EXCLUDED.status,
			is_highlighted = EXCLUDED.is_highlighted,
			is_archived = EXCLUDED.is_archived,
			profile_score_reward = EXCLUDED.profile_score_reward,
			targeting_config = EXCLUDED.targeting_config,
			reward_definition = EXCLUDED.reward_definition,
			story_config = EXCLUDED.story_config,
			has_verification = EXCLUDED.has_verification,
			verification_config = EXCLUDED.verification_config,
			verification_target_count = EXCLUDED.verification_target_count,
			verification_org_quota = EXCLUDED.verification_org_quota,
			start_at = EXCLUDED.start_at,
			end_at = EXCLUDED.end_at,
			updated_at = NOW()
	`
	_, err = tx.Exec(ctx, upsertSurvey,
		s.ID, s.Title, s.Description, s.OwnerType, s.OrganizationID, s.SurveyType,
		s.Category, s.Status, s.IsHighlighted, s.IsArchived, s.ProfileScoreReward,
		s.TargetingConfig, s.RewardDefinition, s.StoryConfig, s.HasVerification,
		s.VerificationConfig, s.VerificationTargetCount, s.VerificationOrgQuota,
		s.StartAt, s.EndAt,
	)
	if err != nil {
		return fmt.Errorf("failed to upsert survey: %w", err)
	}

	if len(questions) > 0 {
		_, err = tx.Exec(ctx, `DELETE FROM questions WHERE survey_id = $1`, s.ID)
		if err != nil {
			return fmt.Errorf("failed to clean old questions: %w", err)
		}

		insertQ := `
			INSERT INTO questions (id, survey_id, question_order, text, question_type, options, is_required)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`
		for i, q := range questions {
			qID := q.ID
			if qID == "" {
				qID = fmt.Sprintf("q_%s_%d", s.ID, i+1)
			}
			order := q.QuestionOrder
			if order == 0 {
				order = i + 1
			}
			qType := q.QuestionType
			if qType == "" {
				qType = "SINGLE_SELECT"
			}
			_, err = tx.Exec(ctx, insertQ, qID, s.ID, order, q.Text, qType, q.Options, q.IsRequired)
			if err != nil {
				return fmt.Errorf("failed to insert question: %w", err)
			}
		}
	}

	return tx.Commit(ctx)
}

func (r *SurveyRepository) AdminUpdateStatus(ctx context.Context, surveyID string, status string) error {
	query := `UPDATE surveys SET status = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.pool.Exec(ctx, query, status, surveyID)
	return err
}

func (r *SurveyRepository) AdminDelete(ctx context.Context, surveyID string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM surveys WHERE id = $1`, surveyID)
	return err
}

func (r *SurveyRepository) AdminDeleteByType(ctx context.Context, surveyType string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM surveys WHERE survey_type = $1`, surveyType)
	return err
}

func (r *SurveyRepository) AdminDeleteNonProfile(ctx context.Context) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM surveys WHERE survey_type != 'PROFILE' AND NOT id LIKE 'pq_%'`)
	return err
}


func scanSurvey(row pgx.Row) (*model.Survey, error) {
	var s model.Survey
	var targeting, reward, story, verif []byte
	err := row.Scan(
		&s.ID, &s.Title, &s.Description, &s.OwnerType, &s.OrganizationID, &s.SurveyType,
		&s.Category, &s.Status, &s.IsHighlighted, &s.IsArchived, &s.ProfileScoreReward,
		&targeting, &reward, &story, &s.HasVerification,
		&verif, &s.VerificationTargetCount, &s.VerificationOrgQuota,
		&s.StartAt, &s.EndAt, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan survey: %w", err)
	}
	s.TargetingConfig = targeting
	s.RewardDefinition = reward
	s.StoryConfig = story
	s.VerificationConfig = verif
	return &s, nil
}

func matchesTargeting(targetingRaw json.RawMessage, user *model.User) bool {
	if len(targetingRaw) == 0 {
		return true
	}
	var targeting struct {
		Type           string   `json:"type"`
		Gender         string   `json:"gender"`
		MinAge         int      `json:"minAge"`
		MaxAge         int      `json:"maxAge"`
		Cities         []string `json:"cities"`
		ProfileFilters *struct {
			MinAge int      `json:"minAge"`
			MaxAge int      `json:"maxAge"`
			Cities []string `json:"cities"`
		} `json:"profileFilters"`
	}
	if err := json.Unmarshal(targetingRaw, &targeting); err != nil {
		return true
	}

	if targeting.Type == "ALL" || targeting.Type == "" {
		return true
	}

	if targeting.Gender != "" && targeting.Gender != "ALL" {
		if user.Gender != nil && !strings.EqualFold(*user.Gender, targeting.Gender) {
			return false
		}
	}

	minAge := targeting.MinAge
	maxAge := targeting.MaxAge
	if targeting.ProfileFilters != nil {
		if targeting.ProfileFilters.MinAge > 0 {
			minAge = targeting.ProfileFilters.MinAge
		}
		if targeting.ProfileFilters.MaxAge > 0 {
			maxAge = targeting.ProfileFilters.MaxAge
		}
	}

	if minAge > 0 && user.Age < minAge {
		return false
	}
	if maxAge > 0 && user.Age > maxAge {
		return false
	}

	cities := targeting.Cities
	if targeting.ProfileFilters != nil && len(targeting.ProfileFilters.Cities) > 0 {
		cities = targeting.ProfileFilters.Cities
	}
	if len(cities) > 0 && user.City != nil {
		matched := false
		for _, c := range cities {
			if strings.EqualFold(c, "ALL") || strings.EqualFold(c, *user.City) {
				matched = true
				break
			}
		}
		if !matched {
			return false
		}
	}

	return true
}

type ProfileQuestionOption struct {
	OptionID string `json:"optionId"`
	Label    string `json:"label"`
	Order    int    `json:"order"`
}

type UnansweredProfileQuestion struct {
	ID                 string                  `json:"id"`
	SurveyID           string                  `json:"surveyId"`
	QuestionText       string                  `json:"questionText"`
	CategoryID         string                  `json:"categoryId"`
	CategoryName       string                  `json:"categoryName"`
	TargetingGender    string                  `json:"targetingGender"`
	Options            []ProfileQuestionOption `json:"options"`
	ProfileScoreReward int                     `json:"profileScoreReward"`
	Status             string                  `json:"status"`
	ShowOnHome         bool                    `json:"showOnHome"`
}

type AnsweredProfileQuestion struct {
	QuestionID          string                  `json:"questionId"`
	SurveyID            string                  `json:"surveyId"`
	QuestionText        string                  `json:"questionText"`
	CategoryID          string                  `json:"categoryId"`
	CategoryName        string                  `json:"categoryName"`
	Options             []ProfileQuestionOption `json:"options"`
	SelectedOptionID    string                  `json:"selectedOptionId"`
	SelectedOptionLabel string                  `json:"selectedOptionLabel"`
	UpdatedAt           string                  `json:"updatedAt"`
}

type ProfileQuestionsResponse struct {
	UnansweredQuestions []UnansweredProfileQuestion `json:"unansweredQuestions"`
	AnsweredQuestions   []AnsweredProfileQuestion   `json:"answeredQuestions"`
	AvailableScoreX     int                         `json:"availableScoreX"`
	TotalCount          int                         `json:"totalCount"`
	AnsweredCount       int                         `json:"answeredCount"`
}

type ProfileAnswerInput struct {
	QuestionID string  `json:"questionId"`
	OptionID   string  `json:"optionId"`
	SurveyID   *string `json:"surveyId,omitempty"`
}

func (r *SurveyRepository) ListProfileQuestionsForUser(ctx context.Context, userID string) (*ProfileQuestionsResponse, error) {
	// 1. Fetch active PROFILE surveys
	querySurveys := `
		SELECT id, title, category, profile_score_reward, status
		FROM surveys
		WHERE survey_type = 'PROFILE' AND is_archived = FALSE
		ORDER BY created_at ASC
	`
	rows, err := r.pool.Query(ctx, querySurveys)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	type srvMeta struct {
		id       string
		title    string
		category string
		reward   int
		status   string
	}
	var surveysList []srvMeta
	var surveyIDs []string
	for rows.Next() {
		var s srvMeta
		if err := rows.Scan(&s.id, &s.title, &s.category, &s.reward, &s.status); err == nil {
			surveysList = append(surveysList, s)
			surveyIDs = append(surveyIDs, s.id)
		}
	}

	resp := &ProfileQuestionsResponse{
		UnansweredQuestions: make([]UnansweredProfileQuestion, 0),
		AnsweredQuestions:   make([]AnsweredProfileQuestion, 0),
		AvailableScoreX:     0,
		TotalCount:          len(surveysList),
		AnsweredCount:       0,
	}

	if len(surveysList) == 0 {
		return resp, nil
	}

	// 2. Fetch questions for these surveys
	questionsBySurvey, err := r.GetQuestionsForSurveys(ctx, surveyIDs)
	if err != nil {
		return nil, err
	}

	// 3. Fetch user responses for these surveys
	userResponses := make(map[string]struct {
		answers   []byte
		updatedAt time.Time
	})
	respRows, err := r.pool.Query(ctx, `SELECT survey_id, answers, completed_at FROM survey_responses WHERE user_id = $1`, userID)
	if err == nil {
		defer respRows.Close()
		for respRows.Next() {
			var sID string
			var rawAns []byte
			var compAt time.Time
			if err := respRows.Scan(&sID, &rawAns, &compAt); err == nil {
				userResponses[sID] = struct {
					answers   []byte
					updatedAt time.Time
				}{answers: rawAns, updatedAt: compAt}
			}
		}
	}

	// 4. Partition into answered & unanswered
	for _, srv := range surveysList {
		qs := questionsBySurvey[srv.id]
		if len(qs) == 0 {
			continue
		}
		q := qs[0] // 1 question per profile survey

		// Parse options
		var rawOpts []map[string]interface{}
		_ = json.Unmarshal(q.Options, &rawOpts)
		var options []ProfileQuestionOption
		for i, ro := range rawOpts {
			optID, _ := ro["optionId"].(string)
			if optID == "" {
				optID, _ = ro["id"].(string)
			}
			if optID == "" {
				optID = fmt.Sprintf("opt_%d", i+1)
			}

			lbl, _ := ro["label"].(string)
			if lbl == "" {
				lbl, _ = ro["text"].(string)
			}

			order := i + 1
			if o, ok := ro["order"].(float64); ok {
				order = int(o)
			}

			options = append(options, ProfileQuestionOption{
				OptionID: optID,
				Label:    lbl,
				Order:    order,
			})
		}

		userResp, answered := userResponses[srv.id]
		if answered {
			var ansMap map[string]interface{}
			_ = json.Unmarshal(userResp.answers, &ansMap)

			selectedOptID := ""
			if val, ok := ansMap["selectedOptionId"].(string); ok {
				selectedOptID = val
			} else if val, ok := ansMap[q.ID].(string); ok {
				selectedOptID = val
			} else if val, ok := ansMap[srv.id].(string); ok {
				selectedOptID = val
			}

			selectedOptLabel := selectedOptID
			for _, opt := range options {
				if opt.OptionID == selectedOptID {
					selectedOptLabel = opt.Label
					break
				}
			}

			resp.AnsweredQuestions = append(resp.AnsweredQuestions, AnsweredProfileQuestion{
				QuestionID:          q.ID,
				SurveyID:            srv.id,
				QuestionText:        q.Text,
				CategoryID:          srv.category,
				CategoryName:        srv.category,
				Options:             options,
				SelectedOptionID:    selectedOptID,
				SelectedOptionLabel: selectedOptLabel,
				UpdatedAt:           userResp.updatedAt.Format(time.RFC3339),
			})
		} else {
			reward := srv.reward
			if reward <= 0 {
				reward = 10
			}
			resp.AvailableScoreX += reward
			resp.UnansweredQuestions = append(resp.UnansweredQuestions, UnansweredProfileQuestion{
				ID:                 q.ID,
				SurveyID:           srv.id,
				QuestionText:       q.Text,
				CategoryID:         srv.category,
				CategoryName:       srv.category,
				TargetingGender:    "ALL",
				Options:            options,
				ProfileScoreReward: reward,
				Status:             srv.status,
				ShowOnHome:         false,
			})
		}
	}

	resp.AnsweredCount = len(resp.AnsweredQuestions)
	return resp, nil
}

func (r *SurveyRepository) SubmitProfileAnswers(ctx context.Context, userID string, answers []ProfileAnswerInput) (int, error) {
	if len(answers) == 0 {
		return 0, nil
	}

	totalScoreAwarded := 0

	for _, ans := range answers {
		surveyID := ""
		if ans.SurveyID != nil && *ans.SurveyID != "" {
			surveyID = *ans.SurveyID
		} else {
			_ = r.pool.QueryRow(ctx, `SELECT survey_id FROM questions WHERE id = $1`, ans.QuestionID).Scan(&surveyID)
		}
		if surveyID == "" {
			continue
		}

		// Check if user already completed this survey
		var existingID string
		_ = r.pool.QueryRow(ctx, `SELECT id FROM survey_responses WHERE survey_id = $1 AND user_id = $2`, surveyID, userID).Scan(&existingID)

		payloadBytes, _ := json.Marshal(map[string]interface{}{
			ans.QuestionID:     ans.OptionID,
			"selectedOptionId": ans.OptionID,
			"updatedAt":        time.Now().Format(time.RFC3339),
		})

		if existingID != "" {
			// Update without awarding score (Rule 11)
			_, _ = r.pool.Exec(ctx, `UPDATE survey_responses SET answers = $1, completed_at = NOW() WHERE id = $2`, payloadBytes, existingID)
		} else {
			// Insert and award score
			respID := fmt.Sprintf("resp_%d_%s", time.Now().Unix(), randString(5))
			_, err := r.pool.Exec(ctx, `
				INSERT INTO survey_responses (id, survey_id, user_id, answers, is_verified, completed_at, created_at)
				VALUES ($1, $2, $3, $4, FALSE, NOW(), NOW())
			`, respID, surveyID, userID, payloadBytes)
			if err != nil {
				continue
			}

			reward := 10
			_ = r.pool.QueryRow(ctx, `SELECT profile_score_reward FROM surveys WHERE id = $1`, surveyID).Scan(&reward)
			if reward <= 0 {
				reward = 10
			}

			ledgerID := fmt.Sprintf("psl_%d_%s", time.Now().Unix(), randString(5))
			idemp := fmt.Sprintf("ps_%s_%s", userID, surveyID)
			_, _ = r.pool.Exec(ctx, `
				INSERT INTO profile_score_ledger (id, user_id, source_type, source_id, score_delta, idempotency_key, created_at)
				VALUES ($1, $2, 'PROFILE_SURVEY_COMPLETED', $3, $4, $5, NOW())
				ON CONFLICT (idempotency_key) DO NOTHING
			`, ledgerID, userID, surveyID, reward, idemp)

			_, _ = r.pool.Exec(ctx, `UPDATE users SET profile_score = profile_score + $1, updated_at = NOW() WHERE id = $2`, reward, userID)
			totalScoreAwarded += reward
		}
	}

	return totalScoreAwarded, nil
}

func randString(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)[:n]
}

