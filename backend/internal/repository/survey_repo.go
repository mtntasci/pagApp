package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

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
