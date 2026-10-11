package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"pag-backend/internal/model"
)

type LedgerRepository struct {
	pool *pgxpool.Pool
}

func NewLedgerRepository(pool *pgxpool.Pool) *LedgerRepository {
	return &LedgerRepository{pool: pool}
}

func (r *LedgerRepository) InsertScoreLedger(ctx context.Context, tx pgx.Tx, item *model.ProfileScoreLedger) error {
	query := `
		INSERT INTO profile_score_ledger (id, user_id, source_type, source_id, score_delta, idempotency_key, metadata, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
		ON CONFLICT (idempotency_key) DO NOTHING
	`
	var err error
	if tx != nil {
		_, err = tx.Exec(ctx, query, item.ID, item.UserID, item.SourceType, item.SourceID, item.ScoreDelta, item.IdempotencyKey, item.Metadata)
	} else {
		_, err = r.pool.Exec(ctx, query, item.ID, item.UserID, item.SourceType, item.SourceID, item.ScoreDelta, item.IdempotencyKey, item.Metadata)
	}
	return err
}

func (r *LedgerRepository) InsertRewardLedger(ctx context.Context, tx pgx.Tx, item *model.RewardLedger) error {
	query := `
		INSERT INTO reward_ledger (id, user_id, survey_id, reward_type, amount, currency, voucher_id, status, idempotency_key, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
		ON CONFLICT (idempotency_key) DO NOTHING
	`
	var err error
	if tx != nil {
		_, err = tx.Exec(ctx, query, item.ID, item.UserID, item.SurveyID, item.RewardType, item.Amount, item.Currency, item.VoucherID, item.Status, item.IdempotencyKey)
	} else {
		_, err = r.pool.Exec(ctx, query, item.ID, item.UserID, item.SurveyID, item.RewardType, item.Amount, item.Currency, item.VoucherID, item.Status, item.IdempotencyKey)
	}
	return err
}

func (r *LedgerRepository) AssignVoucher(ctx context.Context, tx pgx.Tx, surveyID, userID string) (*model.Voucher, error) {
	// Atomically select and lock an available voucher
	selectQuery := `
		SELECT id, survey_id, organization_id, pool_name, code, amount, status, created_at
		FROM vouchers
		WHERE survey_id = $1 AND status = 'AVAILABLE'
		LIMIT 1
		FOR UPDATE SKIP LOCKED
	`
	var v model.Voucher
	var row pgx.Row
	if tx != nil {
		row = tx.QueryRow(ctx, selectQuery, surveyID)
	} else {
		row = r.pool.QueryRow(ctx, selectQuery, surveyID)
	}

	err := row.Scan(&v.ID, &v.SurveyID, &v.OrganizationID, &v.PoolName, &v.Code, &v.Amount, &v.Status, &v.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil // No vouchers left in pool
		}
		return nil, fmt.Errorf("failed to select voucher: %w", err)
	}

	// Update status to ASSIGNED
	updateQuery := `
		UPDATE vouchers SET
			status = 'ASSIGNED',
			assigned_user_id = $1,
			assigned_at = NOW()
		WHERE id = $2
	`
	if tx != nil {
		_, err = tx.Exec(ctx, updateQuery, userID, v.ID)
	} else {
		_, err = r.pool.Exec(ctx, updateQuery, userID, v.ID)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to assign voucher: %w", err)
	}

	now := time.Now()
	v.Status = "ASSIGNED"
	v.AssignedUserID = &userID
	v.AssignedAt = &now
	return &v, nil
}

func (r *LedgerRepository) GetUserWallet(ctx context.Context, userID string) ([]model.RewardLedger, error) {
	query := `
		SELECT id, user_id, survey_id, reward_type, amount, currency, voucher_id, status, idempotency_key, created_at
		FROM reward_ledger
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 50
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.RewardLedger
	for rows.Next() {
		var item model.RewardLedger
		if err := rows.Scan(&item.ID, &item.UserID, &item.SurveyID, &item.RewardType, &item.Amount, &item.Currency, &item.VoucherID, &item.Status, &item.IdempotencyKey, &item.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, item)
	}
	return list, nil
}

func (r *LedgerRepository) GetUserScoreHistory(ctx context.Context, userID string) ([]model.ProfileScoreLedger, error) {
	query := `
		SELECT id, user_id, source_type, source_id, score_delta, idempotency_key, metadata, created_at
		FROM profile_score_ledger
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 50
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.ProfileScoreLedger
	for rows.Next() {
		var item model.ProfileScoreLedger
		if err := rows.Scan(&item.ID, &item.UserID, &item.SourceType, &item.SourceID, &item.ScoreDelta, &item.IdempotencyKey, &item.Metadata, &item.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, item)
	}
	return list, nil
}

func (r *LedgerRepository) GetUserVouchers(ctx context.Context, userID string) ([]model.Voucher, error) {
	query := `
		SELECT id, survey_id, organization_id, pool_name, code, amount, status, assigned_user_id, assigned_at, created_at
		FROM vouchers
		WHERE assigned_user_id = $1
		ORDER BY assigned_at DESC
		LIMIT 50
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Voucher
	for rows.Next() {
		var item model.Voucher
		if err := rows.Scan(&item.ID, &item.SurveyID, &item.OrganizationID, &item.PoolName, &item.Code, &item.Amount, &item.Status, &item.AssignedUserID, &item.AssignedAt, &item.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, item)
	}
	return list, nil
}


func (r *LedgerRepository) CreateWithdrawalRequest(ctx context.Context, req *model.WithdrawalRequest) error {
	query := `
		INSERT INTO withdrawal_requests (id, user_id, amount, currency, iban, account_holder_name, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', NOW(), NOW())
	`
	_, err := r.pool.Exec(ctx, query, req.ID, req.UserID, req.Amount, req.Currency, req.IBAN, req.AccountHolderName)
	return err
}

func (r *LedgerRepository) ListWithdrawalRequests(ctx context.Context, status string) ([]model.WithdrawalRequest, error) {
	var query string
	var rows pgx.Rows
	var err error

	if status != "" {
		query = `
			SELECT id, user_id, amount, currency, iban, account_holder_name, status, reviewed_by, reviewed_at, created_at, updated_at
			FROM withdrawal_requests
			WHERE status = $1
			ORDER BY created_at DESC
		`
		rows, err = r.pool.Query(ctx, query, status)
	} else {
		query = `
			SELECT id, user_id, amount, currency, iban, account_holder_name, status, reviewed_by, reviewed_at, created_at, updated_at
			FROM withdrawal_requests
			ORDER BY created_at DESC
		`
		rows, err = r.pool.Query(ctx, query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.WithdrawalRequest
	for rows.Next() {
		var item model.WithdrawalRequest
		if err := rows.Scan(&item.ID, &item.UserID, &item.Amount, &item.Currency, &item.IBAN, &item.AccountHolderName, &item.Status, &item.ReviewedBy, &item.ReviewedAt, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, item)
	}
	return list, nil
}

func (r *LedgerRepository) Pool() *pgxpool.Pool {
	return r.pool
}

func (r *LedgerRepository) RecordConsent(ctx context.Context, id, userID, docType, version string, accepted bool) error {
	query := `
		INSERT INTO user_consents (id, user_id, doc_type, version, accepted, accepted_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		ON CONFLICT (user_id, doc_type) DO UPDATE SET
			version = EXCLUDED.version,
			accepted = EXCLUDED.accepted,
			accepted_at = NOW()
	`
	_, err := r.pool.Exec(ctx, query, id, userID, docType, version, accepted)
	return err
}
