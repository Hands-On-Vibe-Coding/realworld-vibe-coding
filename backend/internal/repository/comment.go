package repository

import (
	"database/sql"
	"fmt"

	"realworld-backend/internal/model"
)

type CommentRepository struct {
	db *sql.DB
}

func NewCommentRepository(db *sql.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

// GetCommentsByArticleSlug retrieves all comments for an article with author info
func (r *CommentRepository) GetCommentsByArticleSlug(slug string, currentUserID *int) ([]model.Comment, error) {
	query := `
		SELECT 
			c.id, 
			c.body, 
			c.created_at, 
			c.updated_at,
			u.username,
			u.bio,
			u.image,
			CASE WHEN f.follower_id IS NOT NULL THEN 1 ELSE 0 END as following
		FROM comments c
		INNER JOIN articles a ON c.article_id = a.id
		INNER JOIN users u ON c.author_id = u.id
		LEFT JOIN follows f ON f.followed_id = u.id AND f.follower_id = ?
		WHERE a.slug = ?
		ORDER BY c.created_at ASC
	`
	
	var userIDParam interface{} = nil
	if currentUserID != nil {
		userIDParam = *currentUserID
	}
	
	rows, err := r.db.Query(query, userIDParam, slug)
	if err != nil {
		return nil, fmt.Errorf("failed to get comments: %w", err)
	}
	defer rows.Close()

	var comments []model.Comment
	for rows.Next() {
		var comment model.Comment
		var following int
		
		err := rows.Scan(
			&comment.ID,
			&comment.Body,
			&comment.CreatedAt,
			&comment.UpdatedAt,
			&comment.Author.Username,
			&comment.Author.Bio,
			&comment.Author.Image,
			&following,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan comment: %w", err)
		}
		
		comment.Author.Following = following == 1
		comments = append(comments, comment)
	}

	return comments, nil
}

// CreateComment creates a new comment on an article
func (r *CommentRepository) CreateComment(slug string, authorID int, body string) (*model.Comment, error) {
	// First, get the article ID
	var articleID int
	err := r.db.QueryRow("SELECT id FROM articles WHERE slug = ?", slug).Scan(&articleID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("article not found")
		}
		return nil, fmt.Errorf("failed to find article: %w", err)
	}

	// Insert the comment
	result, err := r.db.Exec(`
		INSERT INTO comments (body, author_id, article_id, created_at, updated_at)
		VALUES (?, ?, ?, datetime('now'), datetime('now'))
	`, body, authorID, articleID)
	if err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	commentID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get comment ID: %w", err)
	}

	// Get the created comment with author info
	query := `
		SELECT 
			c.id, 
			c.body, 
			c.created_at, 
			c.updated_at,
			u.username,
			u.bio,
			u.image
		FROM comments c
		INNER JOIN users u ON c.author_id = u.id
		WHERE c.id = ?
	`
	
	var comment model.Comment
	err = r.db.QueryRow(query, commentID).Scan(
		&comment.ID,
		&comment.Body,
		&comment.CreatedAt,
		&comment.UpdatedAt,
		&comment.Author.Username,
		&comment.Author.Bio,
		&comment.Author.Image,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get created comment: %w", err)
	}

	comment.Author.Following = false // Default to false for newly created comments
	return &comment, nil
}

// DeleteComment deletes a comment by ID (only if the user is the author)
func (r *CommentRepository) DeleteComment(commentID, userID int) error {
	result, err := r.db.Exec("DELETE FROM comments WHERE id = ? AND author_id = ?", commentID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("comment not found or unauthorized")
	}

	return nil
}