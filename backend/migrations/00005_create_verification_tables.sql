-- +goose Up
-- ============================================================================
-- 12. VERIFICATION CAMPAIGNS TABLE (Quality Control Campaigns)
-- ============================================================================
CREATE TABLE IF NOT EXISTS verification_campaigns (
    id VARCHAR(64) PRIMARY KEY,
    master_survey_id VARCHAR(64) NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL, -- 'ACTIVE', 'COMPLETED', 'CANCELLED'
    requested_count INTEGER NOT NULL,
    customer_selected_count INTEGER DEFAULT 0 NOT NULL,
    random_selected_count INTEGER DEFAULT 0 NOT NULL,
    verification_survey_id VARCHAR(64),
    verification_reward_summary VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS verification_campaigns_master_survey_idx ON verification_campaigns(master_survey_id);
CREATE INDEX IF NOT EXISTS verification_campaigns_status_idx ON verification_campaigns(status);
CREATE INDEX IF NOT EXISTS verification_campaigns_org_id_idx ON verification_campaigns(organization_id);

-- ============================================================================
-- 13. VERIFICATION ASSIGNMENTS TABLE (Call Center Queue)
-- ============================================================================
CREATE TABLE IF NOT EXISTS verification_assignments (
    id VARCHAR(64) PRIMARY KEY,
    campaign_id VARCHAR(64) NOT NULL REFERENCES verification_campaigns(id) ON DELETE CASCADE,
    master_survey_id VARCHAR(64) NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    call_agent_user_id VARCHAR(64) REFERENCES portal_users(id) ON DELETE SET NULL,
    status VARCHAR(32) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'IN_PROGRESS', 'CALLED', 'COMPLETED', 'FAILED'
    call_result VARCHAR(64), -- 'ACCEPTED', 'DECLINED', 'NO_ANSWER', 'WRONG_PERSON', 'CALL_BACK_LATER'
    verification_answers JSONB,
    customer_selected BOOLEAN DEFAULT FALSE NOT NULL,
    notes TEXT,
    called_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS verification_assignments_campaign_idx ON verification_assignments(campaign_id);
CREATE INDEX IF NOT EXISTS verification_assignments_master_survey_idx ON verification_assignments(master_survey_id);
CREATE INDEX IF NOT EXISTS verification_assignments_respondent_user_idx ON verification_assignments(respondent_user_id);
CREATE INDEX IF NOT EXISTS verification_assignments_call_agent_idx ON verification_assignments(call_agent_user_id);
CREATE INDEX IF NOT EXISTS verification_assignments_status_idx ON verification_assignments(status);

-- +goose Down
DROP TABLE IF EXISTS verification_assignments;
DROP TABLE IF EXISTS verification_campaigns;
