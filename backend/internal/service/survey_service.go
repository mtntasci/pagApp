package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"pag-backend/internal/model"
	"pag-backend/internal/repository"
	"pag-backend/internal/websocket"
)

type SurveyService struct {
	pool       *pgxpool.Pool
	surveyRepo *repository.SurveyRepository
	userRepo   *repository.UserRepository
	ledgerRepo *repository.LedgerRepository
	hub        *websocket.Hub
}

func NewSurveyService(
	pool *pgxpool.Pool,
	surveyRepo *repository.SurveyRepository,
	userRepo *repository.UserRepository,
	ledgerRepo *repository.LedgerRepository,
	hub *websocket.Hub,
) *SurveyService {
	return &SurveyService{
		pool:       pool,
		surveyRepo: surveyRepo,
		userRepo:   userRepo,
		ledgerRepo: ledgerRepo,
		hub:        hub,
	}
}

type HomeFeedResponse struct {
	User    HomeUserSummary `json:"user"`
	Stories []StoryItem     `json:"stories"`
	Surveys []model.Survey  `json:"surveys"`
	Stats   HomeStats       `json:"stats"`
}

type HomeUserSummary struct {
	ID                       string   `json:"id"`
	DisplayName              string   `json:"displayName"`
	Phone                    *string  `json:"phone,omitempty"`
	City                     *string  `json:"city,omitempty"`
	ProfileScore             int      `json:"profileScore"`
	RewardBalance            string   `json:"rewardBalance"`
	KYCStatus                string   `json:"kycStatus"`
	CompletedSurveyIDs       []string `json:"completedSurveyIds"`
	CompletedProfileSurveyIDs []string `json:"completedProfileSurveyIds"`
}

type StoryItem struct {
	ID                 string  `json:"id"`
	StoryID            string  `json:"storyId"`
	SurveyID           string  `json:"surveyId"`
	Title              string  `json:"title"`
	Label              string  `json:"label"`
	ShortLabel         string  `json:"shortLabel"`
	Category           string  `json:"category"`
	ImageURL           *string `json:"imageUrl"`
	Position           int     `json:"position"`
	SortOrder          int     `json:"sortOrder"`
	ProfileScoreReward int     `json:"profileScoreReward"`
	IsCompleted        bool    `json:"isCompleted"`
}

type HomeStats struct {
	CompletedCount int `json:"completedCount"`
	AvailableCount int `json:"availableCount"`
}

func (s *SurveyService) GetHomeFeed(ctx context.Context, user *model.User) (*HomeFeedResponse, error) {
	eligibleSurveys, err := s.surveyRepo.ListActiveForUser(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to list surveys: %w", err)
	}

	completedIDs, err := s.surveyRepo.GetCompletedSurveyIDs(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get completed survey ids: %w", err)
	}

	var generalCompleted []string
	var profileCompleted []string
	for _, id := range completedIDs {
		if strings.HasPrefix(id, "pq_") {
			profileCompleted = append(profileCompleted, id)
		} else {
			generalCompleted = append(generalCompleted, id)
		}
	}

	// Fetch questions for all eligible surveys
	surveyIDs := make([]string, 0, len(eligibleSurveys))
	for _, surv := range eligibleSurveys {
		surveyIDs = append(surveyIDs, surv.ID)
	}
	questionsMap, _ := s.surveyRepo.GetQuestionsForSurveys(ctx, surveyIDs)

	var stories []StoryItem
	for i := range eligibleSurveys {
		surv := &eligibleSurveys[i]
		qs := questionsMap[surv.ID]
		surv.Questions = qs
		surv.QuestionCount = len(qs)

		// Reward summary
		if len(surv.RewardDefinition) > 0 {
			var rDef struct {
				TotalBudget     int    `json:"totalBudget"`
				VoucherPoolName string `json:"voucherPoolName"`
			}
			if err := json.Unmarshal(surv.RewardDefinition, &rDef); err == nil {
				if rDef.TotalBudget > 0 {
					summary := fmt.Sprintf("%d TL Havuz", rDef.TotalBudget)
					surv.RewardSummary = &summary
				} else if rDef.VoucherPoolName != "" {
					surv.RewardSummary = &rDef.VoucherPoolName
				}
			}
		}

		// Extract Stories
		if len(surv.StoryConfig) > 0 {
			var sc struct {
				ShowInStory   bool    `json:"showInStory"`
				IsStory       bool    `json:"isStory"`
				Label         string  `json:"label"`
				ShortLabel    string  `json:"shortLabel"`
				ImageCategory string  `json:"imageCategory"`
				ImageURL      *string `json:"imageUrl"`
				Position      int     `json:"position"`
			}
			if err := json.Unmarshal(surv.StoryConfig, &sc); err == nil {
				if sc.ShowInStory || sc.IsStory {
					label := sc.Label
					if label == "" {
						label = sc.ShortLabel
					}
					if label == "" {
						label = surv.Category
					}
					stories = append(stories, StoryItem{
						ID:                 surv.ID,
						StoryID:            surv.ID,
						SurveyID:           surv.ID,
						Title:              surv.Title,
						Label:              label,
						ShortLabel:         label,
						Category:           sc.ImageCategory,
						ImageURL:           sc.ImageURL,
						Position:           sc.Position,
						SortOrder:          sc.Position,
						ProfileScoreReward: surv.ProfileScoreReward,
						IsCompleted:        false,
					})
				}
			}
		}
	}

	return &HomeFeedResponse{
		User: HomeUserSummary{
			ID:                        user.ID,
			DisplayName:               user.DisplayName,
			Phone:                     user.Phone,
			City:                      user.City,
			ProfileScore:              user.ProfileScore,
			RewardBalance:             user.RewardBalance,
			KYCStatus:                 user.KYCStatus,
			CompletedSurveyIDs:        generalCompleted,
			CompletedProfileSurveyIDs: profileCompleted,
		},
		Stories: stories,
		Surveys: eligibleSurveys,
		Stats: HomeStats{
			CompletedCount: len(generalCompleted),
			AvailableCount: len(eligibleSurveys),
		},
	}, nil
}

type SubmitSurveyResult struct {
	Message      string       `json:"message"`
	EarnedScore  int          `json:"earnedScore"`
	EarnedReward any          `json:"earnedReward,omitempty"`
	ProfileScore int          `json:"profileScore"`
	RewardBalance string      `json:"rewardBalance"`
}

func (s *SurveyService) SubmitSurvey(ctx context.Context, user *model.User, surveyID string, answers json.RawMessage) (*SubmitSurveyResult, error) {
	// 1. Check survey exists
	survey, err := s.surveyRepo.FindByID(ctx, surveyID)
	if err != nil || survey == nil {
		return nil, fmt.Errorf("anket bulunamadı")
	}

	// 2. Check duplicate submission
	alreadyCompleted, err := s.surveyRepo.HasUserCompleted(ctx, surveyID, user.ID)
	if err != nil {
		return nil, fmt.Errorf("katılım durumu kontrol edilemedi: %w", err)
	}
	if alreadyCompleted {
		return nil, fmt.Errorf("bu anketi daha önce tamamladınız")
	}

	// 3. Atomik Transaction
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("transaction başlatılamadı: %w", err)
	}
	defer tx.Rollback(ctx)

	completedAt := time.Now()
	responseID := fmt.Sprintf("resp_%d_%s", completedAt.Unix(), randStr(5))

	// Insert response
	err = s.surveyRepo.SubmitResponse(ctx, tx, &model.SurveyResponse{
		ID:          responseID,
		SurveyID:    surveyID,
		UserID:      user.ID,
		Answers:     answers,
		IsVerified:  false,
		CompletedAt: completedAt,
	})
	if err != nil {
		return nil, fmt.Errorf("cevaplar kaydedilemedi: %w", err)
	}

	// Calculate and record Profile Score
	scoreReward := survey.ProfileScoreReward
	if scoreReward <= 0 {
		scoreReward = 50
	}
	idempScore := fmt.Sprintf("score_%s_%s", surveyID, user.ID)
	metaBytes, _ := json.Marshal(map[string]string{"surveyTitle": survey.Title})

	err = s.ledgerRepo.InsertScoreLedger(ctx, tx, &model.ProfileScoreLedger{
		ID:             fmt.Sprintf("psl_%d_%s", completedAt.Unix(), randStr(5)),
		UserID:         user.ID,
		SourceType:     "SURVEY_COMPLETED",
		SourceID:       &surveyID,
		ScoreDelta:     scoreReward,
		IdempotencyKey: &idempScore,
		Metadata:       metaBytes,
	})
	if err != nil {
		return nil, fmt.Errorf("puan defteri güncellenemedi: %w", err)
	}

	// Update user score
	err = s.userRepo.UpdateScore(ctx, tx, user.ID, scoreReward)
	if err != nil {
		return nil, fmt.Errorf("kullanıcı puanı güncellenemedi: %w", err)
	}

	var earnedReward any

	// 4. Calculate Ranked Financial Reward / Voucher
	if len(survey.RewardDefinition) > 0 {
		var rDef struct {
			RewardType  string `json:"rewardType"` // MONEY, VOUCHER
			RankedRules []struct {
				Rank   any `json:"rank"`
				Amount any `json:"amount"`
			} `json:"rankedRules"`
			VoucherPoolName string `json:"voucherPoolName"`
		}
		_ = json.Unmarshal(survey.RewardDefinition, &rDef)

		if rDef.RewardType == "MONEY" {
			currentCount, _ := s.surveyRepo.CountResponses(ctx, surveyID)
			userRank := currentCount // 1-indexed

			prizeAmount := 0.0
			for _, rule := range rDef.RankedRules {
				var ruleRank int
				switch v := rule.Rank.(type) {
				case float64:
					ruleRank = int(v)
				case string:
					ruleRank, _ = strconv.Atoi(v)
				}

				if ruleRank == userRank {
					switch a := rule.Amount.(type) {
					case float64:
						prizeAmount = a
					case string:
						prizeAmount, _ = strconv.ParseFloat(a, 64)
					}
					break
				}
			}

			if prizeAmount > 0 {
				rewardLedgerID := fmt.Sprintf("rw_%d_%s", completedAt.Unix(), randStr(5))
				idempReward := fmt.Sprintf("reward_%s_%s", surveyID, user.ID)
				_ = s.ledgerRepo.InsertRewardLedger(ctx, tx, &model.RewardLedger{
					ID:             rewardLedgerID,
					UserID:         user.ID,
					SurveyID:       &surveyID,
					RewardType:     "MONEY",
					Amount:         fmt.Sprintf("%.2f", prizeAmount),
					Currency:       "TL",
					Status:         "CREDITED",
					IdempotencyKey: &idempReward,
				})

				_ = s.userRepo.UpdateRewardBalance(ctx, tx, user.ID, prizeAmount)

				earnedReward = map[string]any{
					"type":     "MONEY",
					"amount":   prizeAmount,
					"currency": "TL",
					"rank":     userRank,
				}
			}
		} else if rDef.RewardType == "VOUCHER" {
			voucher, _ := s.ledgerRepo.AssignVoucher(ctx, tx, surveyID, user.ID)
			if voucher != nil {
				earnedReward = map[string]any{
					"type":     "VOUCHER",
					"poolName": voucher.PoolName,
					"code":     voucher.Code,
					"amount":   voucher.Amount,
				}
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("işlem tamamlanırken hata: %w", err)
	}

	// Refresh user state for return
	updatedUser, _ := s.userRepo.FindByID(ctx, user.ID)
	if updatedUser == nil {
		updatedUser = user
	}

	// 5. Broadcast Realtime WebSocket Events
	if s.hub != nil {
		// Broadcast to survey room
		s.hub.BroadcastToRoom("survey:"+surveyID, "SURVEY_RESPONSE_SUBMITTED", map[string]any{
			"surveyId": surveyID,
		})
		// Broadcast to user room
		s.hub.BroadcastToUser(user.ID, "USER_SCORE_UPDATED", map[string]any{
			"newScore": updatedUser.ProfileScore,
			"delta":    scoreReward,
		})
		// Broadcast to admin dashboard
		s.hub.BroadcastToRoom("admin:metrics", "METRICS_UPDATED", nil)
	}

	return &SubmitSurveyResult{
		Message:       "Anket başarıyla tamamlandı! Tebrikler.",
		EarnedScore:   scoreReward,
		EarnedReward:  earnedReward,
		ProfileScore:  updatedUser.ProfileScore,
		RewardBalance: updatedUser.RewardBalance,
	}, nil
}

func randStr(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}
