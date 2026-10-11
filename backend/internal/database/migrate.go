package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
	"pag-backend/migrations"
)

// AutoMigrate applies any pending Goose migrations automatically on server boot using embedded SQL files.
func AutoMigrate(databaseURL string) error {
	if databaseURL == "" {
		return fmt.Errorf("database URL is empty, skipping auto-migration")
	}

	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return fmt.Errorf("failed to open sql connection for migration: %w", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		return fmt.Errorf("failed to ping db for migration: %w", err)
	}

	goose.SetBaseFS(migrations.FS)
	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set goose dialect: %w", err)
	}

	log.Println("[MIGRATE] Checking and applying database migrations...")
	if err := goose.Up(db, "."); err != nil {
		return fmt.Errorf("auto-migration failed: %w", err)
	}

	currentVersion, _ := goose.GetDBVersion(db)
	log.Printf("[MIGRATE] Database auto-migration completed successfully! Current version: %d\n", currentVersion)
	return nil
}
