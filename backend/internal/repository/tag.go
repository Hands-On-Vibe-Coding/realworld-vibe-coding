package repository

import (
	"database/sql"
	"fmt"
)

// TagRepository handles tag database operations
type TagRepository struct {
	db *sql.DB
}

// NewTagRepository creates a new tag repository
func NewTagRepository(db *sql.DB) *TagRepository {
	return &TagRepository{db: db}
}

// GetPopularTags retrieves popular tags ordered by usage count
func (r *TagRepository) GetPopularTags(limit int) ([]string, error) {
	query := `
		SELECT t.name
		FROM tags t
		INNER JOIN article_tags at ON t.id = at.tag_id
		GROUP BY t.id, t.name
		ORDER BY COUNT(at.article_id) DESC, t.name ASC
		LIMIT ?
	`

	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query popular tags: %w", err)
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

// GetAllTags retrieves all unique tags alphabetically
func (r *TagRepository) GetAllTags() ([]string, error) {
	query := `
		SELECT DISTINCT name
		FROM tags
		ORDER BY name ASC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query all tags: %w", err)
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

// CreateTagsForArticle creates tags and associates them with an article
func (r *TagRepository) CreateTagsForArticle(articleID int, tagNames []string) error {
	if len(tagNames) == 0 {
		return nil
	}

	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, tagName := range tagNames {
		// Get or create tag
		tagID, err := r.getOrCreateTag(tx, tagName)
		if err != nil {
			return fmt.Errorf("failed to get or create tag %s: %w", tagName, err)
		}

		// Link article to tag (ignore if already exists)
		_, err = tx.Exec(
			"INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)",
			articleID, tagID,
		)
		if err != nil {
			return fmt.Errorf("failed to link article to tag %s: %w", tagName, err)
		}
	}

	return tx.Commit()
}

// UpdateTagsForArticle updates tags for an article (replaces existing tags)
func (r *TagRepository) UpdateTagsForArticle(articleID int, tagNames []string) error {
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
		tagID, err := r.getOrCreateTag(tx, tagName)
		if err != nil {
			return fmt.Errorf("failed to get or create tag %s: %w", tagName, err)
		}

		// Link article to tag
		_, err = tx.Exec(
			"INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)",
			articleID, tagID,
		)
		if err != nil {
			return fmt.Errorf("failed to link article to tag %s: %w", tagName, err)
		}
	}

	return tx.Commit()
}

// GetTagsForArticle retrieves all tags for a specific article
func (r *TagRepository) GetTagsForArticle(articleID int) ([]string, error) {
	query := `
		SELECT t.name 
		FROM tags t
		INNER JOIN article_tags at ON t.id = at.tag_id
		WHERE at.article_id = ?
		ORDER BY t.name ASC
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

// GetArticleCountByTag gets the number of articles for a specific tag
func (r *TagRepository) GetArticleCountByTag(tagName string) (int, error) {
	query := `
		SELECT COUNT(at.article_id)
		FROM tags t
		INNER JOIN article_tags at ON t.id = at.tag_id
		WHERE t.name = ?
	`

	var count int
	err := r.db.QueryRow(query, tagName).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get article count for tag: %w", err)
	}

	return count, nil
}

// DeleteUnusedTags removes tags that are not associated with any articles
func (r *TagRepository) DeleteUnusedTags() error {
	query := `
		DELETE FROM tags 
		WHERE id NOT IN (
			SELECT DISTINCT tag_id FROM article_tags
		)
	`

	_, err := r.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to delete unused tags: %w", err)
	}

	return nil
}

// TagExists checks if a tag exists by name
func (r *TagRepository) TagExists(tagName string) (bool, error) {
	query := `SELECT COUNT(*) FROM tags WHERE name = ?`

	var count int
	err := r.db.QueryRow(query, tagName).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check tag existence: %w", err)
	}

	return count > 0, nil
}

// getOrCreateTag gets an existing tag ID or creates a new tag
func (r *TagRepository) getOrCreateTag(tx *sql.Tx, tagName string) (int, error) {
	// Try to get existing tag
	var tagID int
	err := tx.QueryRow("SELECT id FROM tags WHERE name = ?", tagName).Scan(&tagID)
	if err == nil {
		return tagID, nil
	}

	if err != sql.ErrNoRows {
		return 0, fmt.Errorf("failed to query tag: %w", err)
	}

	// Create new tag
	result, err := tx.Exec("INSERT INTO tags (name) VALUES (?)", tagName)
	if err != nil {
		return 0, fmt.Errorf("failed to create tag: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to get tag ID: %w", err)
	}

	return int(id), nil
}
