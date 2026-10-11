package fcm

import (
	"context"
	"fmt"
	"log"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"github.com/jackc/pgx/v5/pgxpool"
	"pag-backend/internal/config"
	"pag-backend/internal/repository"
)

type Dispatcher struct {
	msgClient  *messaging.Client
	pool       *pgxpool.Pool
	deviceRepo *repository.DeviceRepository
	cfg        *config.Config
}

func NewDispatcher(cfg *config.Config, app *firebase.App, pool *pgxpool.Pool, deviceRepo *repository.DeviceRepository) (*Dispatcher, error) {
	var msgClient *messaging.Client
	if app != nil {
		var err error
		msgClient, err = app.Messaging(context.Background())
		if err != nil {
			log.Printf("[FCM WARNING] Failed to initialize FCM Messaging client: %v (push notifications will be simulated)", err)
		}
	}

	return &Dispatcher{
		msgClient:  msgClient,
		pool:       pool,
		deviceRepo: deviceRepo,
		cfg:        cfg,
	}, nil
}

func (d *Dispatcher) SendToToken(ctx context.Context, token, title, body string, data map[string]string) error {
	if d.msgClient == nil {
		log.Printf("[FCM SIMULATE] Push to token: %s, Title: %s, Body: %s", token, title, body)
		return nil
	}

	msg := &messaging.Message{
		Token: token,
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Data: data,
	}

	_, err := d.msgClient.Send(ctx, msg)
	if err != nil {
		if messaging.IsUnregistered(err) || messaging.IsInvalidArgument(err) {
			_ = d.deviceRepo.DeactivateToken(ctx, token)
		}
		return fmt.Errorf("FCM send error: %w", err)
	}
	return nil
}

func (d *Dispatcher) StartCampaignWorker(ctx context.Context, campaignID string) error {
	go func() {
		bgCtx := context.Background()
		log.Printf("[FCM WORKER] Starting campaign execution for ID: %s", campaignID)

		// 1. Fetch Campaign
		var title, body string
		var batchSize, interval int
		err := d.pool.QueryRow(bgCtx, `
			SELECT title, body, batch_size, batch_interval_seconds
			FROM push_campaigns
			WHERE id = $1
		`, campaignID).Scan(&title, &body, &batchSize, &interval)
		if err != nil {
			log.Printf("[FCM WORKER] Campaign not found: %v", err)
			return
		}

		if batchSize <= 0 {
			batchSize = d.cfg.PushBatchSize
		}
		if interval <= 0 {
			interval = d.cfg.PushBatchIntervalSeconds
		}

		// Update to RUNNING
		_, _ = d.pool.Exec(bgCtx, `UPDATE push_campaigns SET status = 'RUNNING', started_at = NOW() WHERE id = $1`, campaignID)

		// 2. Fetch pending recipients ordered by rank
		rows, err := d.pool.Query(bgCtx, `
			SELECT id, user_id, fcm_token
			FROM campaign_recipients
			WHERE campaign_id = $1 AND status = 'PENDING'
			ORDER BY rank_order ASC
		`, campaignID)
		if err != nil {
			log.Printf("[FCM WORKER] Error reading recipients: %v", err)
			return
		}
		defer rows.Close()

		type Recipient struct {
			ID       string
			UserID   string
			FCMToken string
		}

		var recipients []Recipient
		for rows.Next() {
			var r Recipient
			if err := rows.Scan(&r.ID, &r.UserID, &r.FCMToken); err == nil {
				recipients = append(recipients, r)
			}
		}

		total := len(recipients)
		log.Printf("[FCM WORKER] Total ranked recipients in snapshot: %d", total)

		// 3. Batch Dispatch
		sentCount := 0
		for i := 0; i < total; i += batchSize {
			end := i + batchSize
			if end > total {
				end = total
			}

			batch := recipients[i:end]
			log.Printf("[FCM WORKER] Sending batch [%d to %d] of %d...", i+1, end, total)

			for _, rec := range batch {
				sendErr := d.SendToToken(bgCtx, rec.FCMToken, title, body, map[string]string{
					"campaignId": campaignID,
				})

				if sendErr != nil {
					_, _ = d.pool.Exec(bgCtx, `
						UPDATE campaign_recipients SET status = 'FAILED', error_message = $1, sent_at = NOW() WHERE id = $2
					`, sendErr.Error(), rec.ID)
				} else {
					sentCount++
					_, _ = d.pool.Exec(bgCtx, `
						UPDATE campaign_recipients SET status = 'SENT', sent_at = NOW() WHERE id = $1
					`, rec.ID)
				}
			}

			// Update campaign progress
			_, _ = d.pool.Exec(bgCtx, `UPDATE push_campaigns SET sent_recipients = $1 WHERE id = $2`, sentCount, campaignID)

			if end < total {
				time.Sleep(time.Duration(interval) * time.Second)
			}
		}

		// Update to COMPLETED
		_, _ = d.pool.Exec(bgCtx, `
			UPDATE push_campaigns SET status = 'COMPLETED', completed_at = NOW(), sent_recipients = $1 WHERE id = $2
		`, sentCount, campaignID)
		log.Printf("[FCM WORKER] Campaign %s finished successfully. Sent: %d", campaignID, sentCount)
	}()

	return nil
}
