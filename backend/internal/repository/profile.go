package repository

import (
	"database/sql"
	"fmt"

	"realworld-backend/internal/model"
)

type ProfileRepository struct {
	db *sql.DB
}

func NewProfileRepository(db *sql.DB) *ProfileRepository {
	return &ProfileRepository{db: db}
}

// GetProfileByUsername retrieves a user profile by username
func (r *ProfileRepository) GetProfileByUsername(username string, currentUserID *int) (*model.Profile, error) {
	query := `
		SELECT 
			u.username,
			u.bio,
			u.image,
			CASE WHEN f.follower_id IS NOT NULL THEN 1 ELSE 0 END as following
		FROM users u
		LEFT JOIN follows f ON f.followed_id = u.id AND f.follower_id = ?
		WHERE u.username = ?
	`
	
	var userIDParam interface{} = nil
	if currentUserID != nil {
		userIDParam = *currentUserID
	}
	
	var profile model.Profile
	var following int
	
	err := r.db.QueryRow(query, userIDParam, username).Scan(
		&profile.Username,
		&profile.Bio,
		&profile.Image,
		&following,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("profile not found")
		}
		return nil, fmt.Errorf("failed to get profile: %w", err)
	}
	
	profile.Following = following == 1
	return &profile, nil
}

// FollowUser creates a follow relationship between users
func (r *ProfileRepository) FollowUser(followerID int, username string) error {
	// First, get the user ID by username
	var followedID int
	err := r.db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&followedID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("user not found")
		}
		return fmt.Errorf("failed to find user: %w", err)
	}
	
	// Prevent self-following
	if followerID == followedID {
		return fmt.Errorf("cannot follow yourself")
	}
	
	// Insert follow relationship (ignore if already exists)
	_, err = r.db.Exec(`
		INSERT OR IGNORE INTO follows (follower_id, followed_id, created_at)
		VALUES (?, ?, datetime('now'))
	`, followerID, followedID)
	if err != nil {
		return fmt.Errorf("failed to follow user: %w", err)
	}
	
	return nil
}

// UnfollowUser removes a follow relationship between users
func (r *ProfileRepository) UnfollowUser(followerID int, username string) error {
	// First, get the user ID by username
	var followedID int
	err := r.db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&followedID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("user not found")
		}
		return fmt.Errorf("failed to find user: %w", err)
	}
	
	// Delete follow relationship
	result, err := r.db.Exec("DELETE FROM follows WHERE follower_id = ? AND followed_id = ?", followerID, followedID)
	if err != nil {
		return fmt.Errorf("failed to unfollow user: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not following this user")
	}
	
	return nil
}