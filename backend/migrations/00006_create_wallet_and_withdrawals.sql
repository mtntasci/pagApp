-- +goose Up
-- ============================================================================
-- 14. WITHDRAWAL REQUESTS TABLE (Cash Out / IBAN Payouts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'TL' NOT NULL,
    iban VARCHAR(34) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'APPROVED', 'TRANSFERRED', 'REJECTED'
    reviewed_by VARCHAR(64) REFERENCES portal_users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS withdrawal_requests_user_id_idx ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS withdrawal_requests_status_idx ON withdrawal_requests(status);

-- ============================================================================
-- 15. LEGAL DOCUMENTS AND USER CONSENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS legal_documents (
    id VARCHAR(64) PRIMARY KEY,
    doc_type VARCHAR(64) NOT NULL, -- 'TERMS', 'PRIVACY', 'KVKK', 'EXPLICIT_CONSENT', 'COMMUNICATION'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(32) DEFAULT '1.0' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_consents (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doc_type VARCHAR(64) NOT NULL,
    version VARCHAR(32) NOT NULL,
    accepted BOOLEAN DEFAULT TRUE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT user_consents_unique_user_doc UNIQUE(user_id, doc_type)
);

CREATE INDEX IF NOT EXISTS user_consents_user_id_idx ON user_consents(user_id);

-- +goose Down
DROP TABLE IF EXISTS user_consents;
DROP TABLE IF EXISTS legal_documents;
DROP TABLE IF EXISTS withdrawal_requests;
