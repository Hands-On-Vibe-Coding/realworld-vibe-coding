package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/model"
)

// ArticleRepository handles article database operations
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
	`

	now := time.Now()
	article.CreatedAt = now
	article.UpdatedAt = now
	article.FavoritesCount = 0

	result, err := r.db.Exec(query,
		article.Slug, article.Title, article.Description, article.Body,
		article.AuthorID, article.CreatedAt, article.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create article: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get article ID: %w", err)
	}

	article.ID = int(id)
	return nil
}

// GetBySlug retrieves an article by slug
func (r *ArticleRepository) GetBySlug(slug string) (*model.Article, error) {
	query := `
		SELECT id, slug, title, description, body, author_id, created_at, updated_at
		FROM articles 
		WHERE slug = ?
	`

	article := &model.Article{}
	err := r.db.QueryRow(query, slug).Scan(
		&article.ID, &article.Slug, &article.Title, &article.Description,
		&article.Body, &article.AuthorID, &article.CreatedAt, &article.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("article not found")
		}
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	// Set default favorites count to 0 for now
	article.FavoritesCount = 0

	return article, nil
}

// Update updates an existing article
func (r *ArticleRepository) Update(slug string, updates map[string]interface{}) (*model.Article, error) {
	if len(updates) == 0 {
		return r.GetBySlug(slug)
	}

	// Build dynamic update query
	setParts := make([]string, 0, len(updates))
	args := make([]interface{}, 0, len(updates)+2)

	for field, value := range updates {
		setParts = append(setParts, fmt.Sprintf("%s = ?", field))
		args = append(args, value)
	}

	// Always update the updated_at field
	setParts = append(setParts, "updated_at = ?")
	args = append(args, time.Now())

	// Add slug as the last parameter for WHERE clause
	args = append(args, slug)

	query := fmt.Sprintf(`
		UPDATE articles 
		SET %s
		WHERE slug = ?
	`, strings.Join(setParts, ", "))

	_, err := r.db.Exec(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to update article: %w", err)
	}

	return r.GetBySlug(slug)
}

// Delete deletes an article by slug
func (r *ArticleRepository) Delete(slug string) error {
	query := `DELETE FROM articles WHERE slug = ?`

	result, err := r.db.Exec(query, slug)
	if err != nil {
		return fmt.Errorf("failed to delete article: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("article not found")
	}

	return nil
}

// GetArticleTags retrieves tags for an article
func (r *ArticleRepository) GetArticleTags(articleID int) ([]string, error) {
	query := `
		SELECT t.name 
		FROM tags t
		INNER JOIN article_tags at ON t.id = at.tag_id
		WHERE at.article_id = ?
		ORDER BY t.name
	`

	rows, err := r.db.Query(query, articleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get article tags: %w", err)
	}
	defer rows.Close()

	var tags []string
	for rows.Next() {
		var tag string
		if err := rows.Scan(&tag); err != nil {
			return nil, fmt.Errorf("failed to scan tag: %w", err)
		}
		tags = append(tags, tag)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate tags: %w", err)
	}

	return tags, nil
}

// SetArticleTags sets tags for an article
func (r *ArticleRepository) SetArticleTags(articleID int, tagNames []string) error {
	// Start transaction
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Delete existing article tags
	_, err = tx.Exec("DELETE FROM article_tags WHERE article_id = ?", articleID)
	if err != nil {
		return fmt.Errorf("failed to delete existing tags: %w", err)
	}

	// Add new tags
	for _, tagName := range tagNames {
		// Get or create tag
		var tagID int
		err = tx.QueryRow("SELECT id FROM tags WHERE name = ?", tagName).Scan(&tagID)
		if err == sql.ErrNoRows {
			// Create new tag
			result, err := tx.Exec("INSERT INTO tags (name) VALUES (?)", tagName)
			if err != nil {
				return fmt.Errorf("failed to create tag %s: %w", tagName, err)
			}
			id, err := result.LastInsertId()
			if err != nil {
				return fmt.Errorf("failed to get tag ID: %w", err)
			}
			tagID = int(id)
		} else if err != nil {
			return fmt.Errorf("failed to get tag %s: %w", tagName, err)
		}

		// Link article to tag
		_, err = tx.Exec("INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)", articleID, tagID)
		if err != nil {
			return fmt.Errorf("failed to link article to tag %s: %w", tagName, err)
		}
	}

	return tx.Commit()
}

// CheckArticleExists checks if an article exists by slug
func (r *ArticleRepository) CheckArticleExists(slug string) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM articles WHERE slug = ?`
	err := r.db.QueryRow(query, slug).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check article existence: %w", err)
	}
	return count > 0, nil
}

// GetArticles retrieves articles with filtering and pagination
func (r *ArticleRepository) GetArticles(limit, offset int, tag, author, favorited string) ([]model.Article, int, error) {
	// Build the base query
	baseQuery := `
		FROM articles a
		LEFT JOIN article_tags at ON a.id = at.article_id
		LEFT JOIN tags t ON at.tag_id = t.id
		LEFT JOIN users u ON a.author_id = u.id
		LEFT JOIN favorites f ON a.id = f.article_id
	`

	// Build WHERE conditions
	conditions := []string{}
	args := []interface{}{}

	if tag != "" {
		conditions = append(conditions, "t.name = ?")
		args = append(args, tag)
	}

	if author != "" {
		conditions = append(conditions, "u.username = ?")
		args = append(args, author)
	}

	if favorited != "" {
		conditions = append(conditions, "f.user_id = (SELECT id FROM users WHERE username = ?)")
		args = append(args, favorited)
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Get total count
	countQuery := "SELECT COUNT(DISTINCT a.id) " + baseQuery + " " + whereClause
	var totalCount int
	err := r.db.QueryRow(countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get articles count: %w", err)
	}

	// Get articles
	articlesQuery := `
		SELECT DISTINCT a.id, a.slug, a.title, a.description, a.body, a.author_id, a.created_at, a.updated_at, 
		       COALESCE((SELECT COUNT(*) FROM favorites f WHERE f.article_id = a.id), 0) as favorites_count
	` + baseQuery + " " + whereClause + `
		ORDER BY a.created_at DESC
		LIMIT ? OFFSET ?
	`

	args = append(args, limit, offset)
	rows, err := r.db.Query(articlesQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get articles: %w", err)
	}
	defer rows.Close()

	var articles []model.Article
	for rows.Next() {
		var article model.Article
		err := rows.Scan(
			&article.ID, &article.Slug, &article.Title, &article.Description,
			&article.Body, &article.AuthorID, &article.CreatedAt, &article.UpdatedAt,
			&article.FavoritesCount,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan article: %w", err)
		}
		articles = append(articles, article)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("failed to iterate articles: %w", err)
	}

	return articles, totalCount, nil
}

// GetFeedArticles retrieves articles from followed users for personalized feed
func (r *ArticleRepository) GetFeedArticles(limit, offset, userID int) ([]model.Article, int, error) {
	// Build the base query for feed (articles from followed users)
	baseQuery := `
		FROM articles a
		INNER JOIN follows f ON a.author_id = f.followed_id
		WHERE f.follower_id = ?
	`

	args := []interface{}{userID}

	// Get total count
	countQuery := "SELECT COUNT(a.id) " + baseQuery
	var totalCount int
	err := r.db.QueryRow(countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get feed count: %w", err)
	}

	// Get articles
	articlesQuery := `
		SELECT a.id, a.slug, a.title, a.description, a.body, a.author_id, a.created_at, a.updated_at, 
		       COALESCE((SELECT COUNT(*) FROM favorites f WHERE f.article_id = a.id), 0) as favorites_count
	` + baseQuery + `
		ORDER BY a.created_at DESC
		LIMIT ? OFFSET ?
	`

	args = append(args, limit, offset)
	rows, err := r.db.Query(articlesQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get feed articles: %w", err)
	}
	defer rows.Close()

	var articles []model.Article
	for rows.Next() {
		var article model.Article
		err := rows.Scan(
			&article.ID, &article.Slug, &article.Title, &article.Description,
			&article.Body, &article.AuthorID, &article.CreatedAt, &article.UpdatedAt,
			&article.FavoritesCount,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan feed article: %w", err)
		}
		articles = append(articles, article)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("failed to iterate feed articles: %w", err)
	}

	return articles, totalCount, nil
}

// FavoriteArticle adds an article to user's favorites
func (r *ArticleRepository) FavoriteArticle(userID, articleID int) error {
	query := `INSERT INTO favorites (user_id, article_id) VALUES (?, ?)`

	_, err := r.db.Exec(query, userID, articleID)
	if err != nil {
		return fmt.Errorf("failed to favorite article: %w", err)
	}

	return nil
}

// UnfavoriteArticle removes an article from user's favorites
func (r *ArticleRepository) UnfavoriteArticle(userID, articleID int) error {
	query := `DELETE FROM favorites WHERE user_id = ? AND article_id = ?`

	result, err := r.db.Exec(query, userID, articleID)
	if err != nil {
		return fmt.Errorf("failed to unfavorite article: %w", err)
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
func (r *ArticleRepository) IsFavorited(userID, articleID int) (bool, error) {
	query := `SELECT COUNT(*) FROM favorites WHERE user_id = ? AND article_id = ?`

	var count int
	err := r.db.QueryRow(query, userID, articleID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check favorite status: %w", err)
	}

	return count > 0, nil
}

// GetFavoritesCount returns the number of favorites for an article
func (r *ArticleRepository) GetFavoritesCount(articleID int) (int, error) {
	query := `SELECT COUNT(*) FROM favorites WHERE article_id = ?`

	var count int
	err := r.db.QueryRow(query, articleID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get favorites count: %w", err)
	}

	return count, nil
}
