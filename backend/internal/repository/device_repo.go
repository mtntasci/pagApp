package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"pag-backend/internal/model"
)

type DeviceRepository struct {
	pool *pgxpool.Pool
}

func NewDeviceRepository(pool *pgxpool.Pool) *DeviceRepository {
	return &DeviceRepository{pool: pool}
}

func (r *DeviceRepository) Upsert(ctx context.Context, d *model.Device) error {
	query := `
		INSERT INTO devices (id, user_id, fcm_token, platform, app_version, is_active, last_active_at, created_at)
		VALUES ($1, $2, $3, $4, $5, TRUE, NOW(), NOW())
		ON CONFLICT (fcm_token) DO UPDATE SET
			user_id = EXCLUDED.user_id,
			platform = EXCLUDED.platform,
			app_version = EXCLUDED.app_version,
			is_active = TRUE,
			last_active_at = NOW()
	`
	_, err := r.pool.Exec(ctx, query, d.ID, d.UserID, d.FCMToken, d.Platform, d.AppVersion)
	return err
}

func (r *DeviceRepository) DeactivateToken(ctx context.Context, fcmToken string) error {
	query := `UPDATE devices SET is_active = FALSE WHERE fcm_token = $1`
	_, err := r.pool.Exec(ctx, query, fcmToken)
	return err
}

func (r *DeviceRepository) GetActiveDevicesByUser(ctx context.Context, userID string) ([]model.Device, error) {
	query := `
		SELECT id, user_id, fcm_token, platform, app_version, is_active, last_active_at, created_at
		FROM devices
		WHERE user_id = $1 AND is_active = TRUE
		ORDER BY last_active_at DESC NULLS LAST
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []model.Device
	for rows.Next() {
		var d model.Device
		var lastActive *time.Time
		if err := rows.Scan(&d.ID, &d.UserID, &d.FCMToken, &d.Platform, &d.AppVersion, &d.IsActive, &lastActive, &d.CreatedAt); err != nil {
			return nil, err
		}
		d.LastActiveAt = lastActive
		devices = append(devices, d)
	}
	return devices, nil
}
