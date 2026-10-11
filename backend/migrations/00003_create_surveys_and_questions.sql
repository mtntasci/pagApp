-- +goose Up
-- ============================================================================
-- 5. SURVEY CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE,
    icon VARCHAR(64),
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 6. SURVEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS surveys (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_type VARCHAR(32) DEFAULT 'PAG' NOT NULL, -- 'PAG', 'ORGANIZATION'
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    survey_type VARCHAR(32) DEFAULT 'PAG' NOT NULL, -- 'PAG', 'ORGANIZATION', 'PROFILE', 'VERIFICATION'
    category VARCHAR(64) DEFAULT 'Genel' NOT NULL,
    status VARCHAR(32) DEFAULT 'DRAFT' NOT NULL, -- 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'COMPLETED', 'ARCHIVED'
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

-- ============================================================================
-- 7. QUESTIONS TABLE
-- ============================================================================
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

-- +goose Down
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS surveys;
DROP TABLE IF EXISTS survey_categories;
