package db

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

// Database wraps the database connection and provides helper methods
type Database struct {
	*sql.DB
	migrationManager *MigrationManager
}

// NewDatabase creates a new database connection
func NewDatabase(databaseURL string) (*Database, error) {
	db, err := sql.Open("sqlite3", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}

	// Enable foreign key constraints
	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		return nil, fmt.Errorf("failed to enable foreign keys: %v", err)
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