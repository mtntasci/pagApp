package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"pag-backend/internal/model"
)

type PortalUserRepository struct {
	pool *pgxpool.Pool
}

func NewPortalUserRepository(pool *pgxpool.Pool) *PortalUserRepository {
	return &PortalUserRepository{pool: pool}
}

func (r *PortalUserRepository) FindByFirebaseUID(ctx context.Context, firebaseUID string) (*model.PortalUser, error) {
	query := `
		SELECT id, firebase_uid, email, display_name, role, organization_id, is_active, created_at
		FROM portal_users
		WHERE firebase_uid = $1
		LIMIT 1
	`
	row := r.pool.QueryRow(ctx, query, firebaseUID)
	return scanPortalUser(row)
}

func (r *PortalUserRepository) FindByEmail(ctx context.Context, email string) (*model.PortalUser, error) {
	query := `
		SELECT id, firebase_uid, email, display_name, role, organization_id, is_active, created_at
		FROM portal_users
		WHERE LOWER(email) = LOWER($1)
		LIMIT 1
	`
	row := r.pool.QueryRow(ctx, query, email)
	return scanPortalUser(row)
}

func (r *PortalUserRepository) List(ctx context.Context, limit int) ([]model.PortalUser, error) {
	query := `
		SELECT id, firebase_uid, email, display_name, role, organization_id, is_active, created_at
		FROM portal_users
		ORDER BY created_at DESC
		LIMIT $1
	`
	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []model.PortalUser
	for rows.Next() {
		u, err := scanPortalUser(rows)
		if err != nil {
			return nil, err
		}
		if u != nil {
			users = append(users, *u)
		}
	}
	return users, nil
}

func (r *PortalUserRepository) Upsert(ctx context.Context, u *model.PortalUser) error {
	query := `
		INSERT INTO portal_users (id, firebase_uid, email, display_name, role, organization_id, is_active, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
		ON CONFLICT (email) DO UPDATE SET
			firebase_uid = EXCLUDED.firebase_uid,
			display_name = EXCLUDED.display_name,
			role = EXCLUDED.role,
			organization_id = EXCLUDED.organization_id,
			is_active = EXCLUDED.is_active
	`
	_, err := r.pool.Exec(ctx, query, u.ID, u.FirebaseUID, u.Email, u.DisplayName, u.Role, u.OrganizationID, u.IsActive)
	return err
}

func (r *PortalUserRepository) DeleteByEmailOrUID(ctx context.Context, email, uid string) error {
	var query string
	var arg string
	if email != "" {
		query = `DELETE FROM portal_users WHERE LOWER(email) = LOWER($1)`
		arg = email
	} else {
		query = `DELETE FROM portal_users WHERE firebase_uid = $1`
		arg = uid
	}
	_, err := r.pool.Exec(ctx, query, arg)
	return err
}

func scanPortalUser(row pgx.Row) (*model.PortalUser, error) {
	var u model.PortalUser
	err := row.Scan(
		&u.ID, &u.FirebaseUID, &u.Email, &u.DisplayName, &u.Role, &u.OrganizationID, &u.IsActive, &u.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan portal user: %w", err)
	}
	return &u, nil
}
