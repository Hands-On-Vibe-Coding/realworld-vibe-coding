package config

import (
	"fmt"
	"os"
)

// Config holds the application configuration
type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	Environment string
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	cfg := &Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: buildDatabaseURL(),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key"),
		Environment: getEnv("ENVIRONMENT", "development"),
	}

	return cfg, nil
}

// buildDatabaseURL constructs database URL from individual components or uses DATABASE_URL directly
func buildDatabaseURL() string {
	// If DATABASE_URL is set directly, use it
	if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
		return dbURL
	}

	// Check if we have PostgreSQL connection parameters
	host := os.Getenv("DATABASE_HOST")
	port := os.Getenv("DATABASE_PORT")
	name := os.Getenv("DATABASE_NAME")
	user := os.Getenv("DATABASE_USER")
	password := os.Getenv("DATABASE_PASSWORD")

	// If we have all PostgreSQL parameters, build the URL
	if host != "" && port != "" && name != "" && user != "" && password != "" {
		return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=require", user, password, host, port, name)
	}

	// Default to SQLite for development
	return "realworld.db"
}

// getEnv gets an environment variable with a fallback value
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
