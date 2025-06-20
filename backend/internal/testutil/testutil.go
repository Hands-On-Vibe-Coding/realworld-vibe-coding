package testutil

import (
	"database/sql"
	"os"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

// TestDB creates a test database for testing
func TestDB(t *testing.T) *sql.DB {
	// Create a temporary test database
	dbPath := ":memory:" // Use in-memory database for tests

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	// Run migrations
	if err := runTestMigrations(db); err != nil {
		t.Fatalf("Failed to run test migrations: %v", err)
	}

	return db
}

// runTestMigrations runs database migrations for tests
func runTestMigrations(db *sql.DB) error {
	migrations := []string{
		// Users table
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email VARCHAR(255) UNIQUE NOT NULL,
			username VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			bio TEXT,
			image VARCHAR(255),
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		
		// Articles table
		`CREATE TABLE IF NOT EXISTS articles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			slug VARCHAR(255) UNIQUE NOT NULL,
			title VARCHAR(255) NOT NULL,
			description TEXT NOT NULL,
			body TEXT NOT NULL,
			author_id INTEGER NOT NULL,
			favorites_count INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (author_id) REFERENCES users(id)
		)`,
		
		// Tags table
		`CREATE TABLE IF NOT EXISTS tags (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name VARCHAR(100) UNIQUE NOT NULL
		)`,
		
		// Article tags junction table
		`CREATE TABLE IF NOT EXISTS article_tags (
			article_id INTEGER,
			tag_id INTEGER,
			PRIMARY KEY (article_id, tag_id),
			FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
			FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
		)`,
		
		// Follows table
		`CREATE TABLE IF NOT EXISTS follows (
			follower_id INTEGER,
			following_id INTEGER,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (follower_id, following_id),
			FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
		)`,
		
		// Favorites table
		`CREATE TABLE IF NOT EXISTS favorites (
			user_id INTEGER,
			article_id INTEGER,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (user_id, article_id),
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
		)`,
		
		// Comments table
		`CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			body TEXT NOT NULL,
			author_id INTEGER NOT NULL,
			article_id INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
		)`,
	}

	for _, migration := range migrations {
		if _, err := db.Exec(migration); err != nil {
			return err
		}
	}

	return nil
}

// CleanupDB cleans up test database
func CleanupDB(db *sql.DB) {
	if db != nil {
		db.Close()
	}
}

// SetTestEnv sets test environment variables
func SetTestEnv() {
	os.Setenv("JWT_SECRET", "test-secret-key")
	os.Setenv("DB_PATH", ":memory:")
}

// ResetTestEnv resets environment variables
func ResetTestEnv() {
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("DB_PATH")
}