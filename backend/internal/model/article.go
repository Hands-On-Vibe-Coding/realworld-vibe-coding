package model

import "time"

// Article represents an article in the system
type Article struct {
	ID             int       `json:"id" db:"id"`
	Slug           string    `json:"slug" db:"slug"`
	Title          string    `json:"title" db:"title"`
	Description    string    `json:"description" db:"description"`
	Body           string    `json:"body" db:"body"`
	AuthorID       int       `json:"-" db:"author_id"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time `json:"updatedAt" db:"updated_at"`
	TagList        []string  `json:"tagList"`
	Favorited      bool      `json:"favorited"`
	FavoritesCount int       `json:"favoritesCount"`
	Author         *ProfileResponse `json:"author"`
}

// ArticleResponse represents the article response format for the API
type ArticleResponse struct {
	Article *Article `json:"article"`
}

// ArticlesResponse represents the articles list response format for the API
type ArticlesResponse struct {
	Articles      []*Article `json:"articles"`
	ArticlesCount int        `json:"articlesCount"`
}