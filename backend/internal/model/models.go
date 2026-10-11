package model

import (
	"encoding/json"
	"time"
)

// User represents mobile end-user accounts
type User struct {
	ID             string     `json:"id"`
	FirebaseUID    string     `json:"firebaseUid"`
	Phone          *string    `json:"phone,omitempty"`
	Email          *string    `json:"email,omitempty"`
	DisplayName    string     `json:"displayName"`
	Gender         *string    `json:"gender,omitempty"`
	City           *string    `json:"city,omitempty"`
	District       *string    `json:"district,omitempty"`
	BirthDate      *time.Time `json:"birthDate,omitempty"`
	Age            int        `json:"age"`
	MaritalStatus  *string    `json:"maritalStatus,omitempty"`
	ChildrenStatus *string    `json:"childrenStatus,omitempty"`
	Hometown       *string    `json:"hometown,omitempty"`
	Education      *string    `json:"education,omitempty"`
	Occupation     *string    `json:"occupation,omitempty"`
	PhoneVerified  bool       `json:"phoneVerified"`
	KYCStatus      string     `json:"kycStatus"`
	ProfileScore   int        `json:"profileScore"`
	RewardBalance  string     `json:"rewardBalance"`
	IsBanned       bool       `json:"isBanned"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

// Device represents an active mobile device registration
type Device struct {
	ID           string     `json:"id"`
	UserID       string     `json:"userId"`
	FCMToken     string     `json:"fcmToken"`
	Platform     string     `json:"platform"`
	AppVersion   *string    `json:"appVersion,omitempty"`
	IsActive     bool       `json:"isActive"`
	LastActiveAt *time.Time `json:"lastActiveAt,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
}

// Organization represents tenant customers (e.g., Ford, McDonald's)
type Organization struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	LogoURL     *string   `json:"logoUrl,omitempty"`
	Description *string   `json:"description,omitempty"`
	IsActive    bool      `json:"isActive"`
	CreatedAt   time.Time `json:"createdAt"`
}

// PortalUser represents administrators and call center agents
type PortalUser struct {
	ID             string    `json:"id"`
	FirebaseUID    string    `json:"firebaseUid"`
	Email          string    `json:"email"`
	DisplayName    string    `json:"displayName"`
	Role           string    `json:"role"` // SUPER_ADMIN, ADMIN, ORG_ADMIN, CALL_AGENT, PAG_STAFF
	OrganizationID *string   `json:"organizationId,omitempty"`
	IsActive       bool      `json:"isActive"`
	CreatedAt      time.Time `json:"createdAt"`
}

// SurveyCategory represents system survey categories
type SurveyCategory struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Icon      *string   `json:"icon,omitempty"`
	SortOrder int       `json:"sortOrder"`
	IsActive  bool      `json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
}

// Survey represents surveys and campaigns
type Survey struct {
	ID                      string          `json:"id"`
	Title                   string          `json:"title"`
	Description             *string         `json:"description,omitempty"`
	OwnerType               string          `json:"ownerType"` // PAG, ORGANIZATION
	OrganizationID          *string         `json:"organizationId,omitempty"`
	SurveyType              string          `json:"surveyType"` // PAG, ORGANIZATION, PROFILE, VERIFICATION
	Category                string          `json:"category"`
	Status                  string          `json:"status"` // DRAFT, PENDING_APPROVAL, APPROVED, ACTIVE, COMPLETED, ARCHIVED
	IsHighlighted           bool            `json:"isHighlighted"`
	IsArchived              bool            `json:"isArchived"`
	ProfileScoreReward      int             `json:"profileScoreReward"`
	TargetingConfig         json.RawMessage `json:"targetingConfig,omitempty"`
	RewardDefinition        json.RawMessage `json:"rewardDefinition,omitempty"`
	StoryConfig             json.RawMessage `json:"storyConfig,omitempty"`
	HasVerification         bool            `json:"hasVerification"`
	VerificationConfig      json.RawMessage `json:"verificationConfig,omitempty"`
	VerificationTargetCount int             `json:"verificationTargetCount"`
	VerificationOrgQuota    int             `json:"verificationOrgQuota"`
	StartAt                 *time.Time      `json:"startAt,omitempty"`
	EndAt                   *time.Time      `json:"endAt,omitempty"`
	CreatedAt               time.Time       `json:"createdAt"`
	UpdatedAt               time.Time       `json:"updatedAt"`

	// Enriched fields for mobile responses
	Questions     []Question `json:"questions,omitempty"`
	QuestionCount int        `json:"questionCount,omitempty"`
	RewardSummary *string    `json:"rewardSummary,omitempty"`
}

// Question represents a question in a survey
type Question struct {
	ID            string          `json:"questionId"`
	SurveyID      string          `json:"surveyId"`
	QuestionOrder int             `json:"order"`
	Text          string          `json:"text"`
	QuestionType  string          `json:"type"`
	Options       json.RawMessage `json:"options"`
	IsRequired    bool            `json:"isRequired"`
}

// SurveyResponse represents user answers to a survey
type SurveyResponse struct {
	ID          string          `json:"id"`
	SurveyID    string          `json:"surveyId"`
	UserID      string          `json:"userId"`
	Answers     json.RawMessage `json:"answers"`
	IsVerified  bool            `json:"isVerified"`
	VerifiedAt  *time.Time      `json:"verifiedAt,omitempty"`
	CompletedAt time.Time       `json:"completedAt"`
	CreatedAt   time.Time       `json:"createdAt"`
}

// ProfileScoreLedger represents auditable profile score events
type ProfileScoreLedger struct {
	ID             string          `json:"id"`
	UserID         string          `json:"userId"`
	SourceType     string          `json:"sourceType"`
	SourceID       *string         `json:"sourceId,omitempty"`
	ScoreDelta     int             `json:"scoreDelta"`
	IdempotencyKey *string         `json:"idempotencyKey,omitempty"`
	Metadata       json.RawMessage `json:"metadata,omitempty"`
	CreatedAt      time.Time       `json:"createdAt"`
}

// RewardLedger represents financial rewards
type RewardLedger struct {
	ID             string    `json:"id"`
	UserID         string    `json:"userId"`
	SurveyID       *string   `json:"surveyId,omitempty"`
	RewardType     string    `json:"rewardType"` // MONEY, VOUCHER
	Amount         string    `json:"amount"`
	Currency       string    `json:"currency"`
	VoucherID      *string   `json:"voucherId,omitempty"`
	Status         string    `json:"status"` // CREDITED, PENDING, CANCELLED
	IdempotencyKey *string   `json:"idempotencyKey,omitempty"`
	CreatedAt      time.Time `json:"createdAt"`
}

// Voucher represents gift codes
type Voucher struct {
	ID             string     `json:"id"`
	SurveyID       *string    `json:"surveyId,omitempty"`
	OrganizationID *string    `json:"organizationId,omitempty"`
	PoolName       string     `json:"poolName"`
	Code           string     `json:"code"`
	Amount         string     `json:"amount"`
	Status         string     `json:"status"` // AVAILABLE, RESERVED, ASSIGNED, REDEEMED, DISABLED
	AssignedUserID *string    `json:"assignedUserId,omitempty"`
	AssignedAt     *time.Time `json:"assignedAt,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
}

// VerificationCampaign represents quality verification parent campaign
type VerificationCampaign struct {
	ID                        string    `json:"id"`
	MasterSurveyID            string    `json:"masterSurveyId"`
	OrganizationID            *string   `json:"organizationId,omitempty"`
	Status                    string    `json:"status"` // ACTIVE, COMPLETED, CANCELLED
	RequestedCount            int       `json:"requestedCount"`
	CustomerSelectedCount     int       `json:"customerSelectedCount"`
	RandomSelectedCount       int       `json:"randomSelectedCount"`
	VerificationSurveyID      *string   `json:"verificationSurveyId,omitempty"`
	VerificationRewardSummary *string   `json:"verificationRewardSummary,omitempty"`
	CreatedAt                 time.Time `json:"createdAt"`
	UpdatedAt                 time.Time `json:"updatedAt"`
}

// VerificationAssignment represents a call assignment for quality verification
type VerificationAssignment struct {
	ID                  string          `json:"id"`
	CampaignID          string          `json:"campaignId"`
	MasterSurveyID      string          `json:"masterSurveyId"`
	RespondentUserID    string          `json:"respondentUserId"`
	CallAgentUserID     *string         `json:"callAgentUserId,omitempty"`
	Status              string          `json:"status"` // PENDING, IN_PROGRESS, CALLED, COMPLETED, FAILED
	CallResult          *string         `json:"callResult,omitempty"`
	VerificationAnswers json.RawMessage `json:"verificationAnswers,omitempty"`
	CustomerSelected    bool            `json:"customerSelected"`
	Notes               *string         `json:"notes,omitempty"`
	CalledAt            *time.Time      `json:"calledAt,omitempty"`
	CompletedAt         *time.Time      `json:"completedAt,omitempty"`
	CreatedAt           time.Time       `json:"createdAt"`
	UpdatedAt           time.Time       `json:"updatedAt"`

	// Enriched fields
	RespondentPhone *string `json:"respondentPhone,omitempty"`
	RespondentName  *string `json:"respondentName,omitempty"`
	AgentName       *string `json:"agentName,omitempty"`
}

// WithdrawalRequest represents cash out requests
type WithdrawalRequest struct {
	ID                string     `json:"id"`
	UserID            string     `json:"userId"`
	Amount            string     `json:"amount"`
	Currency          string     `json:"currency"`
	IBAN              string     `json:"iban"`
	AccountHolderName string     `json:"accountHolderName"`
	Status            string     `json:"status"` // PENDING, APPROVED, TRANSFERRED, REJECTED
	ReviewedBy        *string    `json:"reviewedBy,omitempty"`
	ReviewedAt        *time.Time `json:"reviewedAt,omitempty"`
	CreatedAt         time.Time  `json:"createdAt"`
	UpdatedAt         time.Time  `json:"updatedAt"`
}

// PushCampaign represents a scheduled push campaign
type PushCampaign struct {
	ID                   string          `json:"id"`
	Title                string          `json:"title"`
	Body                 string          `json:"body"`
	SurveyID             *string         `json:"surveyId,omitempty"`
	TargetAudience       json.RawMessage `json:"targetAudience,omitempty"`
	Status               string          `json:"status"`
	BatchSize            int             `json:"batchSize"`
	BatchIntervalSeconds int             `json:"batchIntervalSeconds"`
	TotalRecipients      int             `json:"totalRecipients"`
	SentRecipients       int             `json:"sentRecipients"`
	ScheduledAt          *time.Time      `json:"scheduledAt,omitempty"`
	StartedAt            *time.Time      `json:"startedAt,omitempty"`
	CompletedAt          *time.Time      `json:"completedAt,omitempty"`
	CreatedAt            time.Time       `json:"createdAt"`
}

// CompanyApplication represents prospective partner company inquiries
type CompanyApplication struct {
	ID            string    `json:"id"`
	CompanyName   string    `json:"companyName"`
	ContactPerson string    `json:"contactPerson"`
	Email         string    `json:"email"`
	Phone         string    `json:"phone"`
	City          *string   `json:"city,omitempty"`
	Notes         *string   `json:"notes,omitempty"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"createdAt"`
}

// LegalDocument represents system legal policies
type LegalDocument struct {
	ID        string    `json:"id"`
	DocType   string    `json:"docType"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Version   string    `json:"version"`
	IsActive  bool      `json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
}

// UserConsent represents accepted consents
type UserConsent struct {
	ID         string    `json:"id"`
	UserID     string    `json:"userId"`
	DocType    string    `json:"docType"`
	Version    string    `json:"version"`
	Accepted   bool      `json:"accepted"`
	AcceptedAt time.Time `json:"acceptedAt"`
}

// APIResponse standardizes all REST JSON outputs
type APIResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
	Meta    any    `json:"meta,omitempty"`
}
