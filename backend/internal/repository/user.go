package repository

import (
	"database/sql"
	"fmt"
	"time"

	"realworld-backend/internal/model"
)

// UserRepository handles user data operations
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user in the database
func (r *UserRepository) Create(user *model.User) error {
	query := `
		INSERT INTO users (email, username, password_hash, bio, image, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		RETURNING id
	`
	
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now
	
	err := r.db.QueryRow(
		query,
		user.Email,
		user.Username,
		user.PasswordHash,
		user.Bio,
		user.Image,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID)
	
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	
	return nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(email string) (*model.User, error) {
	query := `
		SELECT id, email, username, password_hash, bio, image, created_at, updated_at
		FROM users WHERE email = ?
	`
	
	user := &model.User{}
	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Username,
		&user.PasswordHash,
		&user.Bio,
		&user.Image,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}
	
	return user, nil
}

// GetByUsername retrieves a user by username
func (r *UserRepository) GetByUsername(username string) (*model.User, error) {
	query := `
		SELECT id, email, username, password_hash, bio, image, created_at, updated_at
		FROM users WHERE username = ?
	`
	
	user := &model.User{}
	err := r.db.QueryRow(query, username).Scan(
		&user.ID,
		&user.Email,
		&user.Username,
		&user.PasswordHash,
		&user.Bio,
		&user.Image,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user by username: %w", err)
	}
	
	return user, nil
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(id int) (*model.User, error) {
	query := `
		SELECT id, email, username, password_hash, bio, image, created_at, updated_at
		FROM users WHERE id = ?
	`
	
	user := &model.User{}
	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Email,
		&user.Username,
		&user.PasswordHash,
		&user.Bio,
		&user.Image,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}
	
	return user, nil
}

// Update updates a user's information
func (r *UserRepository) Update(user *model.User) error {
	query := `
		UPDATE users 
		SET email = ?, username = ?, password_hash = ?, bio = ?, image = ?, updated_at = ?
		WHERE id = ?
	`
	
	user.UpdatedAt = time.Now()
	
	result, err := r.db.Exec(
		query,
		user.Email,
		user.Username,
		user.PasswordHash,
		user.Bio,
		user.Image,
		user.UpdatedAt,
		user.ID,
	)
	
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}
	
	return nil
}

// EmailExists checks if an email is already taken
func (r *UserRepository) EmailExists(email string) (bool, error) {
	query := `SELECT COUNT(*) FROM users WHERE email = ?`
	
	var count int
	err := r.db.QueryRow(query, email).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check email existence: %w", err)
	}
	
	return count > 0, nil
}

// UsernameExists checks if a username is already taken
func (r *UserRepository) UsernameExists(username string) (bool, error) {
	query := `SELECT COUNT(*) FROM users WHERE username = ?`
	
	var count int
	err := r.db.QueryRow(query, username).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check username existence: %w", err)
	}
	
	return count > 0, nil
}