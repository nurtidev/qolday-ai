package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL     string
	RedisURL        string
	JWTSecret       string
	AnthropicAPIKey string
	Port            string
	UploadDir       string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file, reading from environment")
	}
	return &Config{
		DatabaseURL:     getEnv("DATABASE_URL", "postgres://qoldau:qoldau_secret@localhost:5432/qoldau?sslmode=disable"),
		RedisURL:        getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:       getEnv("JWT_SECRET", "dev_secret_change_in_prod"),
		AnthropicAPIKey: getEnv("ANTHROPIC_API_KEY", ""),
		Port:            getEnv("PORT", "8080"),
		UploadDir:       getEnv("UPLOAD_DIR", "./uploads"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
