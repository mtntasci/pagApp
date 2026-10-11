-- +goose Up
-- Add IBAN and TCKN columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS iban VARCHAR(34);
ALTER TABLE users ADD COLUMN IF NOT EXISTS tckn VARCHAR(11);

CREATE INDEX IF NOT EXISTS users_iban_idx ON users(iban);
CREATE INDEX IF NOT EXISTS users_tckn_idx ON users(tckn);

-- +goose Down
DROP INDEX IF EXISTS users_tckn_idx;
DROP INDEX IF EXISTS users_iban_idx;
ALTER TABLE users DROP COLUMN IF EXISTS tckn;
ALTER TABLE users DROP COLUMN IF EXISTS iban;
