package repository

import (
	"database/sql"
	"fmt"
	"time"
)

// FavoriteRepository handles favorite data operations
type FavoriteRepository struct {
	db *sql.DB
}

// NewFavoriteRepository creates a new favorite repository
func NewFavoriteRepository(db *sql.DB) *FavoriteRepository {
	return &FavoriteRepository{db: db}
}

// Add adds an article to user's favorites
func (r *FavoriteRepository) Add(userID, articleID int) error {
	query := `INSERT OR IGNORE INTO favorites (user_id, article_id, created_at) VALUES (?, ?, ?)`
	
	_, err := r.db.Exec(query, userID, articleID, time.Now())
	if err != nil {
		return fmt.Errorf("failed to add favorite: %w", err)
	}
	
	return nil
}

// Remove removes an article from user's favorites
func (r *FavoriteRepository) Remove(userID, articleID int) error {
	query := `DELETE FROM favorites WHERE user_id = ? AND article_id = ?`
	
	result, err := r.db.Exec(query, userID, articleID)
	if err != nil {
		return fmt.Errorf("failed to remove favorite: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("favorite not found")
	}
	
	return nil
}

// IsFavorited checks if an article is favorited by a user
func (r *FavoriteRepository) IsFavorited(userID, articleID int) (bool, error) {
	query := `SELECT COUNT(*) FROM favorites WHERE user_id = ? AND article_id = ?`
	
	var count int
	err := r.db.QueryRow(query, userID, articleID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check if favorited: %w", err)
	}
	
	return count > 0, nil
}

// GetFavoritesCount gets the number of favorites for an article
func (r *FavoriteRepository) GetFavoritesCount(articleID int) (int, error) {
	query := `SELECT COUNT(*) FROM favorites WHERE article_id = ?`
	
	var count int
	err := r.db.QueryRow(query, articleID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get favorites count: %w", err)
	}
	
	return count, nil
}

// GetUserFavorites gets all articles favorited by a user
func (r *FavoriteRepository) GetUserFavorites(userID int) ([]int, error) {
	query := `SELECT article_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC`
	
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user favorites: %w", err)
	}
	defer rows.Close()
	
	var articleIDs []int
	for rows.Next() {
		var articleID int
		err := rows.Scan(&articleID)
		if err != nil {
			return nil, fmt.Errorf("failed to scan favorite: %w", err)
		}
		articleIDs = append(articleIDs, articleID)
	}
	
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate favorites: %w", err)
	}
	
	return articleIDs, nil
}