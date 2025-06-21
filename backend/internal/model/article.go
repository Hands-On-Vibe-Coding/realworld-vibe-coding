package model

import (
	"time"
)

// Article represents an article in the database
type Article struct {
	ID             int       `json:"id" db:"id"`
	Slug           string    `json:"slug" db:"slug"`
	Title          string    `json:"title" db:"title"`
	Description    string    `json:"description" db:"description"`
	Body           string    `json:"body" db:"body"`
	AuthorID       int       `json:"author_id" db:"author_id"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time `json:"updatedAt" db:"updated_at"`
	FavoritesCount int       `json:"favoritesCount" db:"favorites_count"`
}

// ArticleResponse represents an article response for API
type ArticleResponse struct {
	Slug           string        `json:"slug"`
	Title          string        `json:"title"`
	Description    string        `json:"description"`
	Body           string        `json:"body"`
	TagList        []string      `json:"tagList"`
	CreatedAt      time.Time     `json:"createdAt"`
	UpdatedAt      time.Time     `json:"updatedAt"`
	Favorited      bool          `json:"favorited"`
	FavoritesCount int           `json:"favoritesCount"`
	Author         AuthorProfile `json:"author"`
}

// AuthorProfile represents an author in article responses
type AuthorProfile struct {
	Username  string `json:"username"`
	Bio       string `json:"bio"`
	Image     string `json:"image"`
	Following bool   `json:"following"`
}

// CreateArticleRequest represents a request to create an article
type CreateArticleRequest struct {
	Article struct {
		Title       string   `json:"title" validate:"required,min=1"`
		Description string   `json:"description" validate:"required,min=1"`
		Body        string   `json:"body" validate:"required,min=1"`
		TagList     []string `json:"tagList"`
	} `json:"article"`
}

// UpdateArticleRequest represents a request to update an article
type UpdateArticleRequest struct {
	Article struct {
		Title       *string  `json:"title,omitempty"`
		Description *string  `json:"description,omitempty"`
		Body        *string  `json:"body,omitempty"`
		TagList     []string `json:"tagList,omitempty"`
	} `json:"article"`
}

// ArticleResponseWrapper wraps an article response
type ArticleResponseWrapper struct {
	Article ArticleResponse `json:"article"`
}

// ArticlesResponse represents multiple articles response
type ArticlesResponse struct {
	Articles      []ArticleResponse `json:"articles"`
	ArticlesCount int               `json:"articlesCount"`
}
