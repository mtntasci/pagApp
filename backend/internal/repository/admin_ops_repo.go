package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"pag-backend/internal/model"
)

type AdminOpsRepository struct {
	pool *pgxpool.Pool
}

func NewAdminOpsRepository(pool *pgxpool.Pool) *AdminOpsRepository {
	return &AdminOpsRepository{pool: pool}
}

// Metrics
type DashboardMetrics struct {
	TotalUsers          int `json:"totalUsers"`
	ActivePushUsers     int `json:"activePushUsers"`
	TotalSurveys        int `json:"totalSurveys"`
	ActiveSurveys       int `json:"activeSurveys"`
	CompletedResponses  int `json:"completedResponses"`
	TotalRewardsPaid    int `json:"totalRewardsPaid"`
	PendingApplications int `json:"pendingApplications"`
}

func (r *AdminOpsRepository) GetDashboardMetrics(ctx context.Context) (*DashboardMetrics, error) {
	m := &DashboardMetrics{}

	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM users`).Scan(&m.TotalUsers)
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM devices WHERE is_active = TRUE`).Scan(&m.ActivePushUsers)
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM surveys WHERE is_archived = FALSE`).Scan(&m.TotalSurveys)
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM surveys WHERE status = 'ACTIVE' AND is_archived = FALSE`).Scan(&m.ActiveSurveys)
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM survey_responses`).Scan(&m.CompletedResponses)
	_ = r.pool.QueryRow(ctx, `SELECT COALESCE(SUM(amount), 0) FROM reward_ledger WHERE status = 'CREDITED'`).Scan(&m.TotalRewardsPaid)
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM company_applications WHERE status = 'PENDING'`).Scan(&m.PendingApplications)

	if m.ActivePushUsers == 0 && m.TotalUsers > 0 {
		m.ActivePushUsers = m.TotalUsers
	}

	return m, nil
}

// Organizations
func (r *AdminOpsRepository) ListOrganizations(ctx context.Context) ([]model.Organization, error) {
	query := `SELECT id, name, slug, logo_url, description, is_active, created_at FROM organizations ORDER BY name ASC`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Organization
	for rows.Next() {
		var o model.Organization
		if err := rows.Scan(&o.ID, &o.Name, &o.Slug, &o.LogoURL, &o.Description, &o.IsActive, &o.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, o)
	}
	return list, nil
}

func (r *AdminOpsRepository) UpsertOrganization(ctx context.Context, o *model.Organization) error {
	query := `
		INSERT INTO organizations (id, name, slug, logo_url, description, is_active, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			slug = EXCLUDED.slug,
			logo_url = EXCLUDED.logo_url,
			description = EXCLUDED.description,
			is_active = EXCLUDED.is_active
	`
	_, err := r.pool.Exec(ctx, query, o.ID, o.Name, o.Slug, o.LogoURL, o.Description, o.IsActive)
	return err
}

// Categories
func (r *AdminOpsRepository) ListCategories(ctx context.Context) ([]model.SurveyCategory, error) {
	query := `SELECT id, name, icon, sort_order, is_active, created_at FROM survey_categories WHERE is_active = TRUE ORDER BY sort_order ASC`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.SurveyCategory
	for rows.Next() {
		var c model.SurveyCategory
		if err := rows.Scan(&c.ID, &c.Name, &c.Icon, &c.SortOrder, &c.IsActive, &c.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func (r *AdminOpsRepository) UpsertCategory(ctx context.Context, c *model.SurveyCategory) error {
	query := `
		INSERT INTO survey_categories (id, name, icon, sort_order, is_active, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			icon = EXCLUDED.icon,
			sort_order = EXCLUDED.sort_order,
			is_active = EXCLUDED.is_active
	`
	_, err := r.pool.Exec(ctx, query, c.ID, c.Name, c.Icon, c.SortOrder, c.IsActive)
	return err
}

// Applications
func (r *AdminOpsRepository) ListApplications(ctx context.Context) ([]model.CompanyApplication, error) {
	query := `SELECT id, company_name, contact_person, email, phone, city, notes, status, created_at FROM company_applications ORDER BY created_at DESC`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.CompanyApplication
	for rows.Next() {
		var a model.CompanyApplication
		if err := rows.Scan(&a.ID, &a.CompanyName, &a.ContactPerson, &a.Email, &a.Phone, &a.City, &a.Notes, &a.Status, &a.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, a)
	}
	return list, nil
}

func (r *AdminOpsRepository) CreateApplication(ctx context.Context, a *model.CompanyApplication) error {
	query := `
		INSERT INTO company_applications (id, company_name, contact_person, email, phone, city, notes, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', NOW())
	`
	_, err := r.pool.Exec(ctx, query, a.ID, a.CompanyName, a.ContactPerson, a.Email, a.Phone, a.City, a.Notes)
	return err
}

// Verification Campaigns & Assignments
func (r *AdminOpsRepository) ListVerificationCampaigns(ctx context.Context, status string) ([]model.VerificationCampaign, error) {
	query := `
		SELECT id, master_survey_id, organization_id, status, requested_count,
		       customer_selected_count, random_selected_count, verification_survey_id,
		       verification_reward_summary, created_at, updated_at
		FROM verification_campaigns
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.VerificationCampaign
	for rows.Next() {
		var c model.VerificationCampaign
		if err := rows.Scan(&c.ID, &c.MasterSurveyID, &c.OrganizationID, &c.Status, &c.RequestedCount, &c.CustomerSelectedCount, &c.RandomSelectedCount, &c.VerificationSurveyID, &c.VerificationRewardSummary, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func (r *AdminOpsRepository) CreateVerificationCampaign(ctx context.Context, c *model.VerificationCampaign, respondentIDs []string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	insertCamp := `
		INSERT INTO verification_campaigns (id, master_survey_id, organization_id, status, requested_count, customer_selected_count, random_selected_count, verification_survey_id, verification_reward_summary, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
	`
	_, err = tx.Exec(ctx, insertCamp, c.ID, c.MasterSurveyID, c.OrganizationID, c.Status, c.RequestedCount, c.CustomerSelectedCount, c.RandomSelectedCount, c.VerificationSurveyID, c.VerificationRewardSummary)
	if err != nil {
		return err
	}

	insertAssign := `
		INSERT INTO verification_assignments (id, campaign_id, master_survey_id, respondent_user_id, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, 'PENDING', NOW(), NOW())
	`
	for i, rID := range respondentIDs {
		assignID := fmt.Sprintf("vas_%s_%d", c.ID, i+1)
		_, err = tx.Exec(ctx, insertAssign, assignID, c.ID, c.MasterSurveyID, rID)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *AdminOpsRepository) ListVerificationAssignments(ctx context.Context, campaignID, agentID, status string) ([]model.VerificationAssignment, error) {
	query := `
		SELECT a.id, a.campaign_id, a.master_survey_id, a.respondent_user_id,
		       a.call_agent_user_id, a.status, a.call_result, a.verification_answers,
		       a.customer_selected, a.notes, a.called_at, a.completed_at, a.created_at, a.updated_at,
		       u.phone, u.display_name, pu.display_name
		FROM verification_assignments a
		JOIN users u ON a.respondent_user_id = u.id
		LEFT JOIN portal_users pu ON a.call_agent_user_id = pu.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if campaignID != "" {
		query += fmt.Sprintf(" AND a.campaign_id = $%d", argIdx)
		args = append(args, campaignID)
		argIdx++
	}
	if agentID != "" {
		query += fmt.Sprintf(" AND a.call_agent_user_id = $%d", argIdx)
		args = append(args, agentID)
		argIdx++
	}
	if status != "" {
		query += fmt.Sprintf(" AND a.status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}
	query += " ORDER BY a.created_at ASC"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.VerificationAssignment
	for rows.Next() {
		var a model.VerificationAssignment
		var answersRaw []byte
		var agentName *string
		if err := rows.Scan(
			&a.ID, &a.CampaignID, &a.MasterSurveyID, &a.RespondentUserID,
			&a.CallAgentUserID, &a.Status, &a.CallResult, &answersRaw,
			&a.CustomerSelected, &a.Notes, &a.CalledAt, &a.CompletedAt, &a.CreatedAt, &a.UpdatedAt,
			&a.RespondentPhone, &a.RespondentName, &agentName,
		); err != nil {
			return nil, err
		}
		a.VerificationAnswers = answersRaw
		a.AgentName = agentName
		list = append(list, a)
	}
	return list, nil
}

func (r *AdminOpsRepository) SubmitCallResult(ctx context.Context, assignmentID, agentID, callResult, notes string, answers json.RawMessage) error {
	now := time.Now()
	query := `
		UPDATE verification_assignments SET
			status = 'COMPLETED',
			call_agent_user_id = COALESCE($1, call_agent_user_id),
			call_result = $2,
			notes = $3,
			verification_answers = $4,
			called_at = COALESCE(called_at, $5),
			completed_at = $5,
			updated_at = $5
		WHERE id = $6
	`
	_, err := r.pool.Exec(ctx, query, agentID, callResult, notes, answers, now, assignmentID)
	return err
}

func (r *AdminOpsRepository) ListRespondents(ctx context.Context, surveyID, city, gender string, minAge, maxAge int) ([]model.User, error) {
	query := `
		SELECT u.id, u.firebase_uid, u.phone, u.email, u.display_name, u.gender, u.city, u.district,
		       u.birth_date, u.age, u.marital_status, u.children_status, u.hometown, u.education,
		       u.occupation, u.phone_verified, u.kyc_status, u.profile_score, u.reward_balance,
		       u.is_banned, u.created_at, u.updated_at
		FROM users u
		JOIN survey_responses sr ON u.id = sr.user_id
		WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if surveyID != "" {
		query += fmt.Sprintf(" AND sr.survey_id = $%d", argIdx)
		args = append(args, surveyID)
		argIdx++
	}
	if city != "" && city != "ALL" {
		query += fmt.Sprintf(" AND LOWER(u.city) LIKE LOWER($%d)", argIdx)
		args = append(args, "%"+city+"%")
		argIdx++
	}
	if gender != "" && gender != "ALL" {
		query += fmt.Sprintf(" AND LOWER(u.gender) = LOWER($%d)", argIdx)
		args = append(args, gender)
		argIdx++
	}
	if minAge > 0 {
		query += fmt.Sprintf(" AND u.age >= $%d", argIdx)
		args = append(args, minAge)
		argIdx++
	}
	if maxAge > 0 {
		query += fmt.Sprintf(" AND u.age <= $%d", argIdx)
		args = append(args, maxAge)
		argIdx++
	}

	query += " ORDER BY sr.completed_at ASC LIMIT 200"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.User
	for rows.Next() {
		u, err := scanUser(rows)
		if err != nil {
			return nil, err
		}
		if u != nil {
			list = append(list, *u)
		}
	}
	return list, nil
}
