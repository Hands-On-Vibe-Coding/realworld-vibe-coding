package model

import (
	"time"
)

// Article represents an article in the system
type Article struct {
	ID              int       `json:"id" db:"id"`
	Slug            string    `json:"slug" db:"slug"`
	Title           string    `json:"title" db:"title"`
	Description     string    `json:"description" db:"description"`
	Body            string    `json:"body" db:"body"`
	AuthorID        int       `json:"authorId" db:"author_id"`
	CreatedAt       time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time `json:"updatedAt" db:"updated_at"`
	
	// Computed fields (not in database)
	TagList         []string  `json:"tagList,omitempty"`
	Favorited       bool      `json:"favorited"`
	FavoritesCount  int       `json:"favoritesCount"`
	Author          *Profile  `json:"author,omitempty"`
}

// Profile represents user profile information
type Profile struct {
	Username  string  `json:"username"`
	Bio       *string `json:"bio"`
	Image     *string `json:"image"`
	Following bool    `json:"following"`
}

// Tag represents a tag in the system
type Tag struct {
	ID   int    `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

// ArticleTag represents the many-to-many relationship between articles and tags
type ArticleTag struct {
	ArticleID int `json:"articleId" db:"article_id"`
	TagID     int `json:"tagId" db:"tag_id"`
}

// Favorite represents a user's favorite article
type Favorite struct {
	UserID    int       `json:"userId" db:"user_id"`
	ArticleID int       `json:"articleId" db:"article_id"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

// ArticleCreateRequest represents the request payload for article creation
type ArticleCreateRequest struct {
	Article struct {
		Title       string   `json:"title"`
		Description string   `json:"description"`
		Body        string   `json:"body"`
		TagList     []string `json:"tagList,omitempty"`
	} `json:"article"`
}

// ArticleUpdateRequest represents the request payload for article updates
type ArticleUpdateRequest struct {
	Article struct {
		Title       *string  `json:"title,omitempty"`
		Description *string  `json:"description,omitempty"`
		Body        *string  `json:"body,omitempty"`
		TagList     []string `json:"tagList,omitempty"`
	} `json:"article"`
}

// ArticleResponse represents the response format for a single article
type ArticleResponse struct {
	Article Article `json:"article"`
}

// ArticlesResponse represents the response format for multiple articles
type ArticlesResponse struct {
	Articles      []Article `json:"articles"`
	ArticlesCount int       `json:"articlesCount"`
}

// TagsResponse represents the response format for tags
type TagsResponse struct {
	Tags []string `json:"tags"`
}

// ArticleFilter represents query parameters for filtering articles
type ArticleFilter struct {
	Tag       string
	Author    string
	Favorited string
	Limit     int
	Offset    int
}

// FeedFilter represents query parameters for user feed
type FeedFilter struct {
	Limit  int
	Offset int
}