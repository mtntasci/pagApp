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

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func (r *UserRepository) FindByFirebaseUID(ctx context.Context, firebaseUID string) (*model.User, error) {
	query := `
		SELECT id, firebase_uid, phone, email, display_name, gender, city, district,
		       birth_date, age, marital_status, children_status, hometown, education,
		       occupation, phone_verified, kyc_status, profile_score, reward_balance,
		       is_banned, created_at, updated_at
		FROM users
		WHERE firebase_uid = $1
		LIMIT 1
	`
	row := r.pool.QueryRow(ctx, query, firebaseUID)
	return scanUser(row)
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*model.User, error) {
	query := `
		SELECT id, firebase_uid, phone, email, display_name, gender, city, district,
		       birth_date, age, marital_status, children_status, hometown, education,
		       occupation, phone_verified, kyc_status, profile_score, reward_balance,
		       is_banned, created_at, updated_at
		FROM users
		WHERE id = $1
		LIMIT 1
	`
	row := r.pool.QueryRow(ctx, query, id)
	return scanUser(row)
}

func (r *UserRepository) Create(ctx context.Context, u *model.User) error {
	query := `
		INSERT INTO users (
			id, firebase_uid, phone, email, display_name, gender, city, district,
			birth_date, age, marital_status, children_status, hometown, education,
			occupation, phone_verified, kyc_status, profile_score, reward_balance,
			is_banned, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8,
			$9, $10, $11, $12, $13, $14,
			$15, $16, $17, $18, $19,
			$20, $21, $22
		)
	`
	now := time.Now()
	u.CreatedAt = now
	u.UpdatedAt = now
	_, err := r.pool.Exec(ctx, query,
		u.ID, u.FirebaseUID, u.Phone, u.Email, u.DisplayName, u.Gender, u.City, u.District,
		u.BirthDate, u.Age, u.MaritalStatus, u.ChildrenStatus, u.Hometown, u.Education,
		u.Occupation, u.PhoneVerified, u.KYCStatus, u.ProfileScore, u.RewardBalance,
		u.IsBanned, u.CreatedAt, u.UpdatedAt,
	)
	return err
}

func (r *UserRepository) UpdateProfile(ctx context.Context, u *model.User) error {
	query := `
		UPDATE users SET
			display_name = COALESCE($1, display_name),
			gender = COALESCE($2, gender),
			city = COALESCE($3, city),
			district = COALESCE($4, district),
			birth_date = COALESCE($5, birth_date),
			age = COALESCE($6, age),
			marital_status = COALESCE($7, marital_status),
			children_status = COALESCE($8, children_status),
			hometown = COALESCE($9, hometown),
			education = COALESCE($10, education),
			occupation = COALESCE($11, occupation),
			updated_at = NOW()
		WHERE id = $12
	`
	_, err := r.pool.Exec(ctx, query,
		u.DisplayName, u.Gender, u.City, u.District, u.BirthDate,
		u.Age, u.MaritalStatus, u.ChildrenStatus, u.Hometown,
		u.Education, u.Occupation, u.ID,
	)
	return err
}

func (r *UserRepository) VerifyPhone(ctx context.Context, userID, phone string) error {
	query := `
		UPDATE users SET
			phone = $1,
			phone_verified = TRUE,
			updated_at = NOW()
		WHERE id = $2
	`
	_, err := r.pool.Exec(ctx, query, phone, userID)
	return err
}

func (r *UserRepository) UpdateScore(ctx context.Context, tx pgx.Tx, userID string, delta int) error {
	query := `
		UPDATE users SET
			profile_score = profile_score + $1,
			updated_at = NOW()
		WHERE id = $2
	`
	var err error
	if tx != nil {
		_, err = tx.Exec(ctx, query, delta, userID)
	} else {
		_, err = r.pool.Exec(ctx, query, delta, userID)
	}
	return err
}

func (r *UserRepository) UpdateRewardBalance(ctx context.Context, tx pgx.Tx, userID string, deltaAmount float64) error {
	query := `
		UPDATE users SET
			reward_balance = reward_balance + $1,
			updated_at = NOW()
		WHERE id = $2
	`
	var err error
	if tx != nil {
		_, err = tx.Exec(ctx, query, deltaAmount, userID)
	} else {
		_, err = r.pool.Exec(ctx, query, deltaAmount, userID)
	}
	return err
}

func scanUser(row pgx.Row) (*model.User, error) {
	var u model.User
	err := row.Scan(
		&u.ID, &u.FirebaseUID, &u.Phone, &u.Email, &u.DisplayName, &u.Gender, &u.City, &u.District,
		&u.BirthDate, &u.Age, &u.MaritalStatus, &u.ChildrenStatus, &u.Hometown, &u.Education,
		&u.Occupation, &u.PhoneVerified, &u.KYCStatus, &u.ProfileScore, &u.RewardBalance,
		&u.IsBanned, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan user: %w", err)
	}
	return &u, nil
}
