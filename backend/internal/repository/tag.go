package repository

import (
	"database/sql"
	"fmt"

	"realworld-backend/internal/model"
)

// TagRepository handles tag data operations
type TagRepository struct {
	db *sql.DB
}

// NewTagRepository creates a new tag repository
func NewTagRepository(db *sql.DB) *TagRepository {
	return &TagRepository{db: db}
}

// GetOrCreate gets an existing tag or creates a new one
func (r *TagRepository) GetOrCreate(name string) (*model.Tag, error) {
	// Try to get existing tag
	tag, err := r.GetByName(name)
	if err == nil {
		return tag, nil
	}
	
	// Create new tag if not found
	tag = &model.Tag{Name: name}
	err = r.Create(tag)
	if err != nil {
		return nil, fmt.Errorf("failed to create tag: %w", err)
	}
	
	return tag, nil
}

// Create creates a new tag
func (r *TagRepository) Create(tag *model.Tag) error {
	query := `INSERT INTO tags (name) VALUES (?) RETURNING id`
	
	err := r.db.QueryRow(query, tag.Name).Scan(&tag.ID)
	if err != nil {
		return fmt.Errorf("failed to create tag: %w", err)
	}
	
	return nil
}

// GetByName retrieves a tag by name
func (r *TagRepository) GetByName(name string) (*model.Tag, error) {
	query := `SELECT id, name FROM tags WHERE name = ?`
	
	tag := &model.Tag{}
	err := r.db.QueryRow(query, name).Scan(&tag.ID, &tag.Name)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("tag not found")
		}
		return nil, fmt.Errorf("failed to get tag by name: %w", err)
	}
	
	return tag, nil
}

// GetAll retrieves all tags
func (r *TagRepository) GetAll() ([]string, error) {
	query := `SELECT name FROM tags ORDER BY name`
	
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get all tags: %w", err)
	}
	defer rows.Close()
	
	var tags []string
	for rows.Next() {
		var name string
		err := rows.Scan(&name)
		if err != nil {
			return nil, fmt.Errorf("failed to scan tag: %w", err)
		}
		tags = append(tags, name)
	}
	
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate tags: %w", err)
	}
	
	return tags, nil
}

// GetByArticleID retrieves all tags for a specific article
func (r *TagRepository) GetByArticleID(articleID int) ([]string, error) {
	query := `
		SELECT t.name 
		FROM tags t
		JOIN article_tags at ON t.id = at.tag_id
		WHERE at.article_id = ?
		ORDER BY t.name
	`
	
	rows, err := r.db.Query(query, articleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tags for article: %w", err)
	}
	defer rows.Close()
	
	var tags []string
	for rows.Next() {
		var name string
		err := rows.Scan(&name)
		if err != nil {
			return nil, fmt.Errorf("failed to scan tag: %w", err)
		}
		tags = append(tags, name)
	}
	
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate tags: %w", err)
	}
	
	return tags, nil
}

// AddToArticle associates a tag with an article
func (r *TagRepository) AddToArticle(articleID, tagID int) error {
	query := `INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`
	
	_, err := r.db.Exec(query, articleID, tagID)
	if err != nil {
		return fmt.Errorf("failed to add tag to article: %w", err)
	}
	
	return nil
}

// RemoveFromArticle removes a tag association from an article
func (r *TagRepository) RemoveFromArticle(articleID, tagID int) error {
	query := `DELETE FROM article_tags WHERE article_id = ? AND tag_id = ?`
	
	_, err := r.db.Exec(query, articleID, tagID)
	if err != nil {
		return fmt.Errorf("failed to remove tag from article: %w", err)
	}
	
	return nil
}

// ClearArticleTags removes all tag associations from an article
func (r *TagRepository) ClearArticleTags(articleID int) error {
	query := `DELETE FROM article_tags WHERE article_id = ?`
	
	_, err := r.db.Exec(query, articleID)
	if err != nil {
		return fmt.Errorf("failed to clear article tags: %w", err)
	}
	
	return nil
}