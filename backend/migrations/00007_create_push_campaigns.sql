-- +goose Up
-- ============================================================================
-- 16. PUSH CAMPAIGNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS push_campaigns (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    survey_id VARCHAR(64) REFERENCES surveys(id) ON DELETE SET NULL,
    target_audience JSONB,
    status VARCHAR(32) DEFAULT 'DRAFT' NOT NULL, -- 'DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'
    batch_size INTEGER DEFAULT 500 NOT NULL,
    batch_interval_seconds INTEGER DEFAULT 60 NOT NULL,
    total_recipients INTEGER DEFAULT 0 NOT NULL,
    sent_recipients INTEGER DEFAULT 0 NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS push_campaigns_status_idx ON push_campaigns(status);

-- ============================================================================
-- 17. CAMPAIGN RECIPIENTS (Ranking Snapshot & Idempotency)
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id VARCHAR(64) PRIMARY KEY,
    campaign_id VARCHAR(64) NOT NULL REFERENCES push_campaigns(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL,
    device_id VARCHAR(64),
    rank_order INTEGER NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'SENT', 'FAILED', 'SKIPPED'
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT campaign_recipients_unique_campaign_user UNIQUE(campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS campaign_recipients_campaign_idx ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_recipients_status_idx ON campaign_recipients(status);

-- ============================================================================
-- 18. COMPANY APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_applications (
    id VARCHAR(64) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    city VARCHAR(100),
    notes TEXT,
    status VARCHAR(32) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'CONTACTED', 'APPROVED', 'REJECTED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- +goose Down
DROP TABLE IF EXISTS company_applications;
DROP TABLE IF EXISTS campaign_recipients;
DROP TABLE IF EXISTS push_campaigns;
