package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/model"
)

type CommentRepository struct {
	db *sql.DB
}

func NewCommentRepository(db *sql.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) Create(comment *model.Comment) error {
	query := `
		INSERT INTO comments (body, author_id, article_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?)
	`

	now := time.Now()
	comment.CreatedAt = now
	comment.UpdatedAt = now

	result, err := r.db.Exec(query,
		comment.Body, comment.AuthorID, comment.ArticleID,
		comment.CreatedAt, comment.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create comment: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get comment ID: %w", err)
	}

	comment.ID = int(id)
	return nil
}

func (r *CommentRepository) GetByArticleSlug(slug string) ([]*model.Comment, error) {
	query := `
		SELECT c.id, c.body, c.author_id, c.article_id, c.created_at, c.updated_at,
			   u.username, u.email, u.bio, u.image
		FROM comments c
		JOIN articles a ON c.article_id = a.id
		JOIN users u ON c.author_id = u.id
		WHERE a.slug = ?
		ORDER BY c.created_at DESC
	`

	rows, err := r.db.Query(query, slug)
	if err != nil {
		return nil, fmt.Errorf("failed to query comments: %w", err)
	}
	defer rows.Close()

	var comments []*model.Comment
	for rows.Next() {
		comment := &model.Comment{
			Author: &model.ProfileResponse{},
		}

		var email string // Temporary variable for email
		err := rows.Scan(
			&comment.ID, &comment.Body, &comment.AuthorID, &comment.ArticleID,
			&comment.CreatedAt, &comment.UpdatedAt,
			&comment.Author.Username, &email, &comment.Author.Bio, &comment.Author.Image,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan comment: %w", err)
		}

		comments = append(comments, comment)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate comments: %w", err)
	}

	return comments, nil
}

func (r *CommentRepository) GetByID(id int) (*model.Comment, error) {
	query := `
		SELECT c.id, c.body, c.author_id, c.article_id, c.created_at, c.updated_at,
			   u.username, u.email, u.bio, u.image
		FROM comments c
		JOIN users u ON c.author_id = u.id
		WHERE c.id = ?
	`

	comment := &model.Comment{
		Author: &model.ProfileResponse{},
	}

	var email string // Temporary variable for email
	err := r.db.QueryRow(query, id).Scan(
		&comment.ID, &comment.Body, &comment.AuthorID, &comment.ArticleID,
		&comment.CreatedAt, &comment.UpdatedAt,
		&comment.Author.Username, &email, &comment.Author.Bio, &comment.Author.Image,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("comment not found")
		}
		return nil, fmt.Errorf("failed to get comment: %w", err)
	}

	return comment, nil
}

func (r *CommentRepository) Delete(id int) error {
	query := `DELETE FROM comments WHERE id = ?`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("comment not found")
	}

	return nil
}

func (r *CommentRepository) GetArticleIDBySlug(slug string) (int, error) {
	query := `SELECT id FROM articles WHERE slug = ?`

	var articleID int
	err := r.db.QueryRow(query, slug).Scan(&articleID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("article not found")
		}
		return 0, fmt.Errorf("failed to get article ID: %w", err)
	}

	return articleID, nil
}
