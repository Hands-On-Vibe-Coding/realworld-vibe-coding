package repository

import (
	"database/sql"
	"fmt"

	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/model"
)

// UserRepository handles user data operations
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(id int) (*model.User, error) {
	query := `
		SELECT id, email, username, password_hash, bio, image, created_at, updated_at
		FROM users WHERE id = ?
	`

	var user model.User
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

	return &user, nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(email string) (*model.User, error) {
	query := `
		SELECT id, email, username, password_hash, bio, image, created_at, updated_at
		FROM users WHERE email = ?
	`

	var user model.User
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

	return &user, nil
}

// GetByUsername retrieves a user by username
func (r *UserRepository) GetByUsername(username string) (*model.User, error) {
	query := `
		SELECT id, email, username, password_hash, bio, image, created_at, updated_at
		FROM users WHERE username = ?
	`

	var user model.User
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

	return &user, nil
}

// Create creates a new user
func (r *UserRepository) Create(user *model.User) error {
	query := `
		INSERT INTO users (email, username, password_hash, bio, image)
		VALUES (?, ?, ?, ?, ?)
	`

	result, err := r.db.Exec(query, user.Email, user.Username, user.PasswordHash, user.Bio, user.Image)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get last insert ID: %w", err)
	}

	user.ID = int(id)
	return nil
}

// Update updates an existing user
func (r *UserRepository) Update(user *model.User) error {
	query := `
		UPDATE users 
		SET email = ?, username = ?, password_hash = ?, bio = ?, image = ?
		WHERE id = ?
	`

	_, err := r.db.Exec(query, user.Email, user.Username, user.PasswordHash, user.Bio, user.Image, user.ID)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
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

// FollowUser creates a follow relationship
func (r *UserRepository) FollowUser(followerID, followedID int) error {
	query := `INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)`
	
	_, err := r.db.Exec(query, followerID, followedID)
	if err != nil {
		return fmt.Errorf("failed to follow user: %w", err)
	}
	
	return nil
}

// UnfollowUser removes a follow relationship
func (r *UserRepository) UnfollowUser(followerID, followedID int) error {
	query := `DELETE FROM follows WHERE follower_id = ? AND followed_id = ?`
	
	result, err := r.db.Exec(query, followerID, followedID)
	if err != nil {
		return fmt.Errorf("failed to unfollow user: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("follow relationship not found")
	}
	
	return nil
}

// IsFollowing checks if a user is following another user
func (r *UserRepository) IsFollowing(followerID, followedID int) (bool, error) {
	query := `SELECT COUNT(*) FROM follows WHERE follower_id = ? AND followed_id = ?`
	
	var count int
	err := r.db.QueryRow(query, followerID, followedID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check follow status: %w", err)
	}
	
	return count > 0, nil
}

// GetProfileByUsername gets a user profile by username with follow status
func (r *UserRepository) GetProfileByUsername(username string, currentUserID *int) (*model.ProfileResponse, error) {
	user, err := r.GetByUsername(username)
	if err != nil {
		return nil, err
	}
	
	profile := &model.ProfileResponse{
		Username: user.Username,
		Bio:      user.Bio,
		Image:    user.Image,
		Following: false,
	}
	
	// Check if current user is following this user
	if currentUserID != nil && *currentUserID > 0 {
		isFollowing, err := r.IsFollowing(*currentUserID, user.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to check follow status: %w", err)
		}
		profile.Following = isFollowing
	}
	
	return profile, nil
}
