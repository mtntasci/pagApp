-- +goose Up
-- ============================================================================
-- 8. SURVEY RESPONSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_responses (
    id VARCHAR(64) PRIMARY KEY,
    survey_id VARCHAR(64) NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT survey_responses_unique_user_survey UNIQUE(survey_id, user_id)
);

CREATE INDEX IF NOT EXISTS survey_responses_survey_id_idx ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS survey_responses_user_id_idx ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS survey_responses_completed_at_idx ON survey_responses(completed_at);

-- ============================================================================
-- 9. PROFILE SCORE LEDGER TABLE (Auditable Scoring Ledger)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profile_score_ledger (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(64) NOT NULL, -- 'SURVEY_COMPLETED', 'PROFILE_SURVEY', 'PHONE_VERIFIED', 'KYC_VERIFIED'
    source_id VARCHAR(64),
    score_delta INTEGER NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS profile_score_ledger_user_id_idx ON profile_score_ledger(user_id);
CREATE INDEX IF NOT EXISTS profile_score_ledger_created_at_idx ON profile_score_ledger(created_at);

-- ============================================================================
-- 10. REWARD LEDGER TABLE (Financial Ledger)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reward_ledger (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    survey_id VARCHAR(64) REFERENCES surveys(id) ON DELETE SET NULL,
    reward_type VARCHAR(32) NOT NULL, -- 'MONEY', 'VOUCHER'
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'TL' NOT NULL,
    voucher_id VARCHAR(64),
    status VARCHAR(32) DEFAULT 'CREDITED' NOT NULL, -- 'CREDITED', 'PENDING', 'CANCELLED'
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS reward_ledger_user_id_idx ON reward_ledger(user_id);
CREATE INDEX IF NOT EXISTS reward_ledger_survey_id_idx ON reward_ledger(survey_id);

-- ============================================================================
-- 11. VOUCHERS TABLE (Gift Codes Pool)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vouchers (
    id VARCHAR(64) PRIMARY KEY,
    survey_id VARCHAR(64) REFERENCES surveys(id) ON DELETE SET NULL,
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    pool_name VARCHAR(255) NOT NULL,
    code VARCHAR(128) NOT NULL,
    amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(32) DEFAULT 'AVAILABLE' NOT NULL, -- 'AVAILABLE', 'RESERVED', 'ASSIGNED', 'REDEEMED', 'DISABLED'
    assigned_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS vouchers_survey_id_idx ON vouchers(survey_id);
CREATE INDEX IF NOT EXISTS vouchers_status_idx ON vouchers(status);
CREATE INDEX IF NOT EXISTS vouchers_assigned_user_idx ON vouchers(assigned_user_id);

-- +goose Down
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS reward_ledger;
DROP TABLE IF EXISTS profile_score_ledger;
DROP TABLE IF EXISTS survey_responses;
