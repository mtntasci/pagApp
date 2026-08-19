-- ============================================================================
-- PAG PostgreSQL Database Schema (Neon)
-- ============================================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    phone VARCHAR(32) UNIQUE,
    email VARCHAR(255),
    display_name VARCHAR(255) DEFAULT 'Kullanıcı',
    gender VARCHAR(16),
    city VARCHAR(100),
    district VARCHAR(100),
    birth_date DATE,
    age INTEGER DEFAULT 25,
    marital_status VARCHAR(32),
    children_status VARCHAR(32),
    hometown VARCHAR(100),
    education VARCHAR(64),
    occupation VARCHAR(100),
    kyc_status VARCHAR(32) DEFAULT 'NOT_STARTED' NOT NULL,
    profile_score INTEGER DEFAULT 0 NOT NULL,
    reward_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS users_city_idx ON users(city);
CREATE INDEX IF NOT EXISTS users_age_idx ON users(age);
CREATE INDEX IF NOT EXISTS users_gender_idx ON users(gender);
CREATE INDEX IF NOT EXISTS users_profile_score_idx ON users(profile_score);

-- 2. DEVICES
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL UNIQUE,
    platform VARCHAR(16) DEFAULT 'android' NOT NULL,
    app_version VARCHAR(32),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS devices_user_id_idx ON devices(user_id);

-- 3. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. PORTAL USERS
CREATE TABLE IF NOT EXISTS portal_users (
    id VARCHAR(64) PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) DEFAULT 'Yönetici' NOT NULL,
    role VARCHAR(32) DEFAULT 'ADMIN' NOT NULL,
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS portal_users_org_id_idx ON portal_users(organization_id);

-- 5. SURVEYS
CREATE TABLE IF NOT EXISTS surveys (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_type VARCHAR(32) DEFAULT 'PAG' NOT NULL,
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    survey_type VARCHAR(32) DEFAULT 'PAG' NOT NULL,
    category VARCHAR(64) DEFAULT 'Genel' NOT NULL,
    status VARCHAR(32) DEFAULT 'DRAFT' NOT NULL,
    is_highlighted BOOLEAN DEFAULT FALSE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    profile_score_reward INTEGER DEFAULT 50 NOT NULL,
    targeting_config JSONB,
    reward_definition JSONB,
    story_config JSONB,
    has_verification BOOLEAN DEFAULT FALSE NOT NULL,
    verification_config JSONB,
    verification_target_count INTEGER DEFAULT 0 NOT NULL,
    verification_org_quota INTEGER DEFAULT 0 NOT NULL,
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS surveys_status_idx ON surveys(status);
CREATE INDEX IF NOT EXISTS surveys_org_id_idx ON surveys(organization_id);
CREATE INDEX IF NOT EXISTS surveys_has_verification_idx ON surveys(has_verification);
CREATE INDEX IF NOT EXISTS surveys_is_highlighted_idx ON surveys(is_highlighted);
CREATE INDEX IF NOT EXISTS surveys_is_archived_idx ON surveys(is_archived);

-- 6. QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(64) PRIMARY KEY,
    survey_id VARCHAR(64) NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    text TEXT NOT NULL,
    question_type VARCHAR(32) DEFAULT 'SINGLE_SELECT' NOT NULL,
    options JSONB NOT NULL,
    is_required BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS questions_survey_id_idx ON questions(survey_id);

-- 7. SURVEY RESPONSES
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

-- 8. PROFILE SCORE LEDGER
CREATE TABLE IF NOT EXISTS profile_score_ledger (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(64) NOT NULL,
    source_id VARCHAR(64),
    score_delta INTEGER NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS profile_score_ledger_user_id_idx ON profile_score_ledger(user_id);
CREATE INDEX IF NOT EXISTS profile_score_ledger_created_at_idx ON profile_score_ledger(created_at);

-- 9. REWARD LEDGER
CREATE TABLE IF NOT EXISTS reward_ledger (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    survey_id VARCHAR(64) REFERENCES surveys(id) ON DELETE SET NULL,
    reward_type VARCHAR(32) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'TL' NOT NULL,
    voucher_id VARCHAR(64),
    status VARCHAR(32) DEFAULT 'CREDITED' NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS reward_ledger_user_id_idx ON reward_ledger(user_id);
CREATE INDEX IF NOT EXISTS reward_ledger_survey_id_idx ON reward_ledger(survey_id);

-- 10. VOUCHERS
CREATE TABLE IF NOT EXISTS vouchers (
    id VARCHAR(64) PRIMARY KEY,
    survey_id VARCHAR(64) REFERENCES surveys(id) ON DELETE SET NULL,
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    pool_name VARCHAR(255) NOT NULL,
    code VARCHAR(128) NOT NULL,
    amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(32) DEFAULT 'AVAILABLE' NOT NULL,
    assigned_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS vouchers_survey_id_idx ON vouchers(survey_id);
CREATE INDEX IF NOT EXISTS vouchers_status_idx ON vouchers(status);
CREATE INDEX IF NOT EXISTS vouchers_assigned_user_idx ON vouchers(assigned_user_id);

-- 11. VERIFICATION CAMPAIGNS
CREATE TABLE IF NOT EXISTS verification_campaigns (
    id VARCHAR(64) PRIMARY KEY,
    master_survey_id VARCHAR(64) NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
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

-- 12. VERIFICATION ASSIGNMENTS
CREATE TABLE IF NOT EXISTS verification_assignments (
    id VARCHAR(64) PRIMARY KEY,
    campaign_id VARCHAR(64) NOT NULL REFERENCES verification_campaigns(id) ON DELETE CASCADE,
    master_survey_id VARCHAR(64) NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    call_agent_user_id VARCHAR(64) REFERENCES portal_users(id) ON DELETE SET NULL,
    status VARCHAR(32) DEFAULT 'PENDING' NOT NULL,
    call_result VARCHAR(64),
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

-- 13. WITHDRAWAL REQUESTS
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'TL' NOT NULL,
    iban VARCHAR(34) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' NOT NULL,
    reviewed_by VARCHAR(64) REFERENCES portal_users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS withdrawal_requests_user_id_idx ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS withdrawal_requests_status_idx ON withdrawal_requests(status);
