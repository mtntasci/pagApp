package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	// Server
	Port           string
	ServerEnv      string
	AllowedOrigins []string

	// PostgreSQL
	DBHost                   string
	DBPort                   string
	DBUser                   string
	DBPassword               string
	DBName                   string
	DBSSLMode                string
	DBMaxConns              int32
	DBMinConns              int32
	DBMaxConnLifetimeMinutes int
	DBMaxConnIdleTimeMinutes int
	DatabaseURL              string

	// Cloudflare R2 / S3
	StorageDriver     string
	R2AccountID       string
	R2AccessKeyID     string
	R2SecretAccessKey string
	R2BucketName      string
	R2Region          string
	R2Endpoint        string
	R2PublicDomain    string
	R2UploadPrefix    string

	// Firebase
	FirebaseProjectID       string
	FirebaseCredentialsFile string
	FirebaseCredentialsJSON string
	FirebaseMessagingSenderID string
	FirebaseWebAPIKey       string
	FirebaseAppID           string

	// Push Policy
	PushBatchSize            int
	PushBatchIntervalSeconds int
	InitialPhoneScore        int

	// WebSocket
	WSPingIntervalSeconds int
	WSPongTimeoutSeconds  int
	WSMaxMessageSize      int64
}

func LoadConfig() (*Config, error) {
	// Try loading .env if exists, ignore error in production container
	_ = godotenv.Load()

	cfg := &Config{
		Port:           getEnv("PORT", "3000"),
		ServerEnv:      getEnv("SERVER_ENV", "production"),
		AllowedOrigins: splitTrim(getEnv("ALLOWED_ORIGINS", "https://api.pagapp.com.tr,https://admin.pagapp.com.tr,https://customer.pagapp.com.tr,https://www.pagapp.com.tr,https://pagapp.com.tr,https://app.pagapp.com.tr,http://localhost:3000")),

		DBHost:                   getEnv("DB_HOST", "127.0.0.1"),
		DBPort:                   getEnv("DB_PORT", "5432"),
		DBUser:                   getEnv("DB_USER", "pag_user"),
		DBPassword:               getEnv("DB_PASSWORD", ""),
		DBName:                   getEnv("DB_NAME", "pag_prod"),
		DBSSLMode:                getEnv("DB_SSLMODE", "disable"),
		DBMaxConns:              int32(getEnvInt("DB_MAX_CONNS", 50)),
		DBMinConns:              int32(getEnvInt("DB_MIN_CONNS", 10)),
		DBMaxConnLifetimeMinutes: getEnvInt("DB_MAX_CONN_LIFETIME_MINUTES", 60),
		DBMaxConnIdleTimeMinutes: getEnvInt("DB_MAX_CONN_IDLE_TIME_MINUTES", 15),
		DatabaseURL:              getEnv("DATABASE_URL", ""),

		StorageDriver:     getEnv("STORAGE_DRIVER", "r2"),
		R2AccountID:       getEnv("R2_ACCOUNT_ID", ""),
		R2AccessKeyID:     getEnv("R2_ACCESS_KEY_ID", ""),
		R2SecretAccessKey: getEnv("R2_SECRET_ACCESS_KEY", ""),
		R2BucketName:      getEnv("R2_BUCKET_NAME", "netadisyon"),
		R2Region:          getEnv("R2_REGION", "auto"),
		R2Endpoint:        getEnv("R2_ENDPOINT", ""),
		R2PublicDomain:    getEnv("R2_PUBLIC_DOMAIN", "https://cdn.netadisyon.com.tr"),
		R2UploadPrefix:    getEnv("R2_UPLOAD_PREFIX", "pag"),

		FirebaseProjectID:       getEnv("FIREBASE_PROJECT_ID", "pagwebapp"),
		FirebaseCredentialsFile: getEnv("FIREBASE_CREDENTIALS_FILE", "./serviceAccountKey.json"),
		FirebaseCredentialsJSON: getEnv("FIREBASE_CREDENTIALS_JSON", ""),
		FirebaseMessagingSenderID: getEnv("FIREBASE_MESSAGING_SENDER_ID", "1011540629150"),
		FirebaseWebAPIKey:       getEnv("FIREBASE_WEB_API_KEY", "AIzaSyBNTV8DGRFKNXMne_q4TTH2-HmMNijmlaE"),
		FirebaseAppID:           getEnv("FIREBASE_APP_ID", "1:1011540629150:web:34838483b562d9deb5cd8f"),

		PushBatchSize:            getEnvInt("PUSH_BATCH_SIZE", 500),
		PushBatchIntervalSeconds: getEnvInt("PUSH_BATCH_INTERVAL_SECONDS", 60),
		InitialPhoneScore:        getEnvInt("INITIAL_PHONE_SCORE", 200),

		WSPingIntervalSeconds: getEnvInt("WS_PING_INTERVAL_SECONDS", 30),
		WSPongTimeoutSeconds:  getEnvInt("WS_PONG_TIMEOUT_SECONDS", 60),
		WSMaxMessageSize:      int64(getEnvInt("WS_MAX_MESSAGE_SIZE", 4096)),
	}

	if cfg.DatabaseURL == "" {
		cfg.DatabaseURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
			cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName, cfg.DBSSLMode)
	}

	if cfg.R2Endpoint == "" && cfg.R2AccountID != "" {
		cfg.R2Endpoint = fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.R2AccountID)
	}

	return cfg, nil
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && strings.TrimSpace(val) != "" {
		return strings.TrimSpace(val)
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if val, ok := os.LookupEnv(key); ok && strings.TrimSpace(val) != "" {
		if i, err := strconv.Atoi(strings.TrimSpace(val)); err == nil {
			return i
		}
	}
	return defaultVal
}

func splitTrim(s string) []string {
	parts := strings.Split(s, ",")
	res := make([]string, 0, len(parts))
	for _, p := range parts {
		trimmed := strings.TrimSpace(p)
		if trimmed != "" {
			res = append(res, trimmed)
		}
	}
	return res
}
