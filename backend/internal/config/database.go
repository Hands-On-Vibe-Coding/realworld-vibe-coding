package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	DB *sql.DB
}

// InitDB initializes the SQLite database connection
func InitDB() (*Database, error) {
	db, err := sql.Open("sqlite3", "./realworld.db?_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	database := &Database{DB: db}
	
	// Run migrations
	if err := database.runMigrations(); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("✅ Database initialized successfully")
	return database, nil
}

// runMigrations executes all SQL migration files in order
func (d *Database) runMigrations() error {
	migrationsDir := "./migrations"
	
	// Read all migration files
	files, err := filepath.Glob(filepath.Join(migrationsDir, "*.sql"))
	if err != nil {
		return fmt.Errorf("failed to read migration files: %w", err)
	}

	// Sort files to ensure they run in order
	sort.Strings(files)

	log.Printf("🔄 Running %d migrations...", len(files))

	for _, file := range files {
		if err := d.runMigrationFile(file); err != nil {
			return fmt.Errorf("failed to run migration %s: %w", file, err)
		}
		log.Printf("✅ Migration completed: %s", filepath.Base(file))
	}

	return nil
}

// runMigrationFile executes a single migration file
func (d *Database) runMigrationFile(filename string) error {
	content, err := os.ReadFile(filename)
	if err != nil {
		return fmt.Errorf("failed to read migration file: %w", err)
	}

	_, err = d.DB.Exec(string(content))
	if err != nil {
		return fmt.Errorf("failed to execute migration: %w", err)
	}

	return nil
}

// Close closes the database connection
func (d *Database) Close() error {
	if d.DB != nil {
		return d.DB.Close()
	}
	return nil
}