-- +goose Up
-- ============================================================================
-- 3. ORGANIZATIONS TABLE (Tenants)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 4. PORTAL USERS TABLE (Super Admin, Admin, Org Admin, Call Center Agents)
-- ============================================================================
CREATE TABLE IF NOT EXISTS portal_users (
    id VARCHAR(64) PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) DEFAULT 'Yönetici' NOT NULL,
    role VARCHAR(32) DEFAULT 'ADMIN' NOT NULL, -- 'SUPER_ADMIN', 'ADMIN', 'ORG_ADMIN', 'CALL_AGENT', 'PAG_STAFF'
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS portal_users_firebase_uid_idx ON portal_users(firebase_uid);
CREATE UNIQUE INDEX IF NOT EXISTS portal_users_email_idx ON portal_users(email);
CREATE INDEX IF NOT EXISTS portal_users_org_id_idx ON portal_users(organization_id);

-- +goose Down
DROP TABLE IF EXISTS portal_users;
DROP TABLE IF EXISTS organizations;
