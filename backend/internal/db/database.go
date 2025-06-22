package db

import (
	"database/sql"
	"fmt"
	"strings"

	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)

// Database wraps the database connection and provides helper methods
type Database struct {
	*sql.DB
	migrationManager *MigrationManager
}

// NewDatabase creates a new database connection
func NewDatabase(databaseURL string) (*Database, error) {
	var db *sql.DB
	var err error
	
	// Determine database type based on URL
	if strings.HasPrefix(databaseURL, "postgres://") || strings.HasPrefix(databaseURL, "postgresql://") {
		// PostgreSQL connection
		db, err = sql.Open("postgres", databaseURL)
	} else {
		// SQLite connection (default)
		db, err = sql.Open("sqlite3", databaseURL)
	}
	
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}

	// Enable foreign key constraints for SQLite
	if !strings.HasPrefix(databaseURL, "postgres") {
		if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
			return nil, fmt.Errorf("failed to enable foreign keys: %v", err)
		}
	}

	migrationManager := NewMigrationManager(db)

	return &Database{
		DB:               db,
		migrationManager: migrationManager,
	}, nil
}

// Migrate runs database migrations
func (d *Database) Migrate() error {
	// Use absolute path for migrations directory
	migrationsDir := "migrations"

	return d.migrationManager.RunMigrations(migrationsDir)
}

// Close closes the database connection
func (d *Database) Close() error {
	return d.DB.Close()
}
