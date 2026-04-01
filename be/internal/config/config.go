package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBPort         string
	JWTSecret      string
	Port           string
	AllowedOrigins string
	IsProduction   bool

	// Application Config
	FrontendURL string
	AppVersion  string

	// Google OAuth
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string

	// SMTP Config
	SMTPHost     string
	SMTPPort     string
	SMTPEmail    string
	SMTPPassword string

	// Cloudinary Config
	CloudinaryURL string

	// WhatsApp Config
	FonnteToken string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, relying on system environment variables")
	}

	cfg := &Config{
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBUser:         getEnv("DB_USER", "postgres"),
		DBPassword:     getEnv("DB_PASSWORD", ""),
		DBName:         getEnv("DB_NAME", "koskosan_db"),
		DBPort:         getEnv("DB_PORT", "5432"),
		JWTSecret:      os.Getenv("JWT_SECRET"), // NO FALLBACK - must be set!
		Port:           getEnv("PORT", "8080"),
		AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:3000"),
		IsProduction:   getEnv("GIN_MODE", "debug") == "release",

		// Application Config
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
		AppVersion:  getEnv("APP_VERSION", "1.0.0"),

		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", ""),

		// SMTP Config
		SMTPHost:     getEnv("SMTP_HOST", ""),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPEmail:    getEnv("SMTP_EMAIL", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),

		// Cloudinary Config
		CloudinaryURL: getEnv("CLOUDINARY_URL", ""),

		// WhatsApp Config
		FonnteToken: getEnv("FONNTE_TOKEN", ""),
	}

	// Validate required environment variables
	if err := cfg.ValidateRequired(); err != nil {
		log.Fatalf("Configuration error: %v", err)
	}

	return cfg
}

// ValidateRequired checks that critical environment variables are set
func (c *Config) ValidateRequired() error {
	if c.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET environment variable is required")
	}
	if len(c.JWTSecret) < 32 {
		return fmt.Errorf("JWT_SECRET must be at least 32 characters long for security")
	}
	if c.DBPassword == "" {
		log.Println("WARNING: DB_PASSWORD is empty. This is insecure for production!")
	}
	return nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
