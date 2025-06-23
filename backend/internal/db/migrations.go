package db

import (
	"database/sql"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// Migration represents a database migration
type Migration struct {
	ID       int
	Filename string
	Content  string
}

// MigrationManager handles database migrations
type MigrationManager struct {
	db *sql.DB
}

// NewMigrationManager creates a new migration manager
func NewMigrationManager(db *sql.DB) *MigrationManager {
	return &MigrationManager{db: db}
}

// CreateMigrationsTable creates the migrations table to track applied migrations
func (m *MigrationManager) CreateMigrationsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS migrations (
		id INTEGER PRIMARY KEY,
		filename VARCHAR(255) NOT NULL,
		applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := m.db.Exec(query)
	return err
}

// GetAppliedMigrations returns a list of applied migration filenames
func (m *MigrationManager) GetAppliedMigrations() ([]string, error) {
	query := "SELECT filename FROM migrations ORDER BY id ASC"
	rows, err := m.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var migrations []string
	for rows.Next() {
		var filename string
		if err := rows.Scan(&filename); err != nil {
			return nil, err
		}
		migrations = append(migrations, filename)
	}
	return migrations, nil
}

// LoadMigrations loads all migration files from the migrations directory
func (m *MigrationManager) LoadMigrations(migrationsDir string) ([]Migration, error) {
	var migrations []Migration

	err := filepath.WalkDir(migrationsDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() || !strings.HasSuffix(path, ".sql") {
			return nil
		}

		filename := filepath.Base(path)

		// Extract migration ID from filename (e.g., "001_create_users_table.sql" -> 1)
		parts := strings.Split(filename, "_")
		if len(parts) < 2 {
			return fmt.Errorf("invalid migration filename format: %s", filename)
		}

		var id int
		if _, err := fmt.Sscanf(parts[0], "%d", &id); err != nil {
			return fmt.Errorf("invalid migration ID in filename: %s", filename)
		}

		// Read migration content
		content, err := readFile(path)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %v", filename, err)
		}

		migrations = append(migrations, Migration{
			ID:       id,
			Filename: filename,
			Content:  string(content),
		})

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Sort migrations by ID
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].ID < migrations[j].ID
	})

	return migrations, nil
}

// ApplyMigration applies a single migration
func (m *MigrationManager) ApplyMigration(migration Migration) error {
	tx, err := m.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Execute migration SQL
	if _, err := tx.Exec(migration.Content); err != nil {
		return fmt.Errorf("failed to execute migration %s: %v", migration.Filename, err)
	}

	// Record migration as applied
	if _, err := tx.Exec("INSERT INTO migrations (id, filename) VALUES (?, ?)", migration.ID, migration.Filename); err != nil {
		return fmt.Errorf("failed to record migration %s: %v", migration.Filename, err)
	}

	return tx.Commit()
}

// RunMigrations runs all pending migrations
func (m *MigrationManager) RunMigrations(migrationsDir string) error {
	// Create migrations table if it doesn't exist
	if err := m.CreateMigrationsTable(); err != nil {
		return fmt.Errorf("failed to create migrations table: %v", err)
	}

	// Get applied migrations
	appliedMigrations, err := m.GetAppliedMigrations()
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %v", err)
	}

	// Load all migrations
	allMigrations, err := m.LoadMigrations(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to load migrations: %v", err)
	}

	// Create a map of applied migrations for quick lookup
	appliedMap := make(map[string]bool)
	for _, filename := range appliedMigrations {
		appliedMap[filename] = true
	}

	// Apply pending migrations
	for _, migration := range allMigrations {
		if !appliedMap[migration.Filename] {
			fmt.Printf("Applying migration: %s\n", migration.Filename)
			if err := m.ApplyMigration(migration); err != nil {
				return fmt.Errorf("failed to apply migration %s: %v", migration.Filename, err)
			}
			fmt.Printf("Successfully applied migration: %s\n", migration.Filename)
		}
	}

	return nil
}

// readFile reads a file and returns its content
func readFile(filename string) ([]byte, error) {
	return os.ReadFile(filename)
}
