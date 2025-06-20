package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"realworld-backend/internal/model"
)

// ArticleRepository handles article data operations
type ArticleRepository struct {
	db *sql.DB
}

// NewArticleRepository creates a new article repository
func NewArticleRepository(db *sql.DB) *ArticleRepository {
	return &ArticleRepository{db: db}
}

// Create creates a new article
func (r *ArticleRepository) Create(article *model.Article) error {
	query := `
		INSERT INTO articles (slug, title, description, body, author_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		RETURNING id
	`
	
	now := time.Now()
	article.CreatedAt = now
	article.UpdatedAt = now
	
	err := r.db.QueryRow(
		query,
		article.Slug,
		article.Title,
		article.Description,
		article.Body,
		article.AuthorID,
		article.CreatedAt,
		article.UpdatedAt,
	).Scan(&article.ID)
	
	if err != nil {
		return fmt.Errorf("failed to create article: %w", err)
	}
	
	return nil
}

// GetBySlug retrieves an article by slug
func (r *ArticleRepository) GetBySlug(slug string) (*model.Article, error) {
	query := `
		SELECT id, slug, title, description, body, author_id, created_at, updated_at
		FROM articles WHERE slug = ?
	`
	
	article := &model.Article{}
	err := r.db.QueryRow(query, slug).Scan(
		&article.ID,
		&article.Slug,
		&article.Title,
		&article.Description,
		&article.Body,
		&article.AuthorID,
		&article.CreatedAt,
		&article.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("article not found")
		}
		return nil, fmt.Errorf("failed to get article by slug: %w", err)
	}
	
	return article, nil
}

// GetByID retrieves an article by ID
func (r *ArticleRepository) GetByID(id int) (*model.Article, error) {
	query := `
		SELECT id, slug, title, description, body, author_id, created_at, updated_at
		FROM articles WHERE id = ?
	`
	
	article := &model.Article{}
	err := r.db.QueryRow(query, id).Scan(
		&article.ID,
		&article.Slug,
		&article.Title,
		&article.Description,
		&article.Body,
		&article.AuthorID,
		&article.CreatedAt,
		&article.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("article not found")
		}
		return nil, fmt.Errorf("failed to get article by ID: %w", err)
	}
	
	return article, nil
}

// Update updates an article
func (r *ArticleRepository) Update(article *model.Article) error {
	query := `
		UPDATE articles 
		SET slug = ?, title = ?, description = ?, body = ?, updated_at = ?
		WHERE id = ?
	`
	
	article.UpdatedAt = time.Now()
	
	result, err := r.db.Exec(
		query,
		article.Slug,
		article.Title,
		article.Description,
		article.Body,
		article.UpdatedAt,
		article.ID,
	)
	
	if err != nil {
		return fmt.Errorf("failed to update article: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("article not found")
	}
	
	return nil
}

// Delete deletes an article
func (r *ArticleRepository) Delete(id int) error {
	query := `DELETE FROM articles WHERE id = ?`
	
	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete article: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("article not found")
	}
	
	return nil
}

// List retrieves articles with filtering and pagination
func (r *ArticleRepository) List(filter model.ArticleFilter) ([]model.Article, int, error) {
	// Build WHERE clause
	var conditions []string
	var args []interface{}
	
	if filter.Tag != "" {
		conditions = append(conditions, `
			EXISTS (
				SELECT 1 FROM article_tags at 
				JOIN tags t ON at.tag_id = t.id 
				WHERE at.article_id = a.id AND t.name = ?
			)
		`)
		args = append(args, filter.Tag)
	}
	
	if filter.Author != "" {
		conditions = append(conditions, `
			EXISTS (
				SELECT 1 FROM users u 
				WHERE u.id = a.author_id AND u.username = ?
			)
		`)
		args = append(args, filter.Author)
	}
	
	if filter.Favorited != "" {
		conditions = append(conditions, `
			EXISTS (
				SELECT 1 FROM favorites f 
				JOIN users u ON f.user_id = u.id 
				WHERE f.article_id = a.id AND u.username = ?
			)
		`)
		args = append(args, filter.Favorited)
	}
	
	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}
	
	// Count total articles
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*) FROM articles a %s
	`, whereClause)
	
	var total int
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count articles: %w", err)
	}
	
	// Get articles with pagination
	listQuery := fmt.Sprintf(`
		SELECT id, slug, title, description, body, author_id, created_at, updated_at
		FROM articles a
		%s
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`, whereClause)
	
	// Add pagination args
	paginationArgs := append(args, filter.Limit, filter.Offset)
	
	rows, err := r.db.Query(listQuery, paginationArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list articles: %w", err)
	}
	defer rows.Close()
	
	var articles []model.Article
	for rows.Next() {
		var article model.Article
		err := rows.Scan(
			&article.ID,
			&article.Slug,
			&article.Title,
			&article.Description,
			&article.Body,
			&article.AuthorID,
			&article.CreatedAt,
			&article.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan article: %w", err)
		}
		articles = append(articles, article)
	}
	
	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("failed to iterate articles: %w", err)
	}
	
	return articles, total, nil
}

// GetFeed retrieves articles from followed users
func (r *ArticleRepository) GetFeed(userID int, filter model.FeedFilter) ([]model.Article, int, error) {
	// Count total feed articles
	countQuery := `
		SELECT COUNT(*) FROM articles a
		WHERE a.author_id IN (
			SELECT f.followed_id FROM follows f WHERE f.follower_id = ?
		)
	`
	
	var total int
	err := r.db.QueryRow(countQuery, userID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count feed articles: %w", err)
	}
	
	// Get feed articles with pagination
	listQuery := `
		SELECT id, slug, title, description, body, author_id, created_at, updated_at
		FROM articles a
		WHERE a.author_id IN (
			SELECT f.followed_id FROM follows f WHERE f.follower_id = ?
		)
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`
	
	rows, err := r.db.Query(listQuery, userID, filter.Limit, filter.Offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get feed articles: %w", err)
	}
	defer rows.Close()
	
	var articles []model.Article
	for rows.Next() {
		var article model.Article
		err := rows.Scan(
			&article.ID,
			&article.Slug,
			&article.Title,
			&article.Description,
			&article.Body,
			&article.AuthorID,
			&article.CreatedAt,
			&article.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan feed article: %w", err)
		}
		articles = append(articles, article)
	}
	
	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("failed to iterate feed articles: %w", err)
	}
	
	return articles, total, nil
}

// SlugExists checks if a slug already exists
func (r *ArticleRepository) SlugExists(slug string) (bool, error) {
	query := `SELECT COUNT(*) FROM articles WHERE slug = ?`
	
	var count int
	err := r.db.QueryRow(query, slug).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check slug existence: %w", err)
	}
	
	return count > 0, nil
}