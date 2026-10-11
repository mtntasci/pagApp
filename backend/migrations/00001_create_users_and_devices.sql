-- +goose Up
-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
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
    phone_verified BOOLEAN DEFAULT FALSE NOT NULL,
    kyc_status VARCHAR(32) DEFAULT 'NOT_STARTED' NOT NULL,
    profile_score INTEGER DEFAULT 0 NOT NULL,
    reward_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS users_firebase_uid_idx ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS users_city_idx ON users(city);
CREATE INDEX IF NOT EXISTS users_age_idx ON users(age);
CREATE INDEX IF NOT EXISTS users_gender_idx ON users(gender);
CREATE INDEX IF NOT EXISTS users_profile_score_idx ON users(profile_score);
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);

-- ============================================================================
-- 2. DEVICES TABLE
-- ============================================================================
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
CREATE UNIQUE INDEX IF NOT EXISTS devices_fcm_token_idx ON devices(fcm_token);

-- +goose Down
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS users;
