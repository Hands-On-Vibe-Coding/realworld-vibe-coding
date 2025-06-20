package model

import (
	"time"
)

// Comment represents a comment on an article
type Comment struct {
	ID        int       `json:"id" db:"id"`
	Body      string    `json:"body" db:"body"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
	AuthorID  int       `json:"-" db:"author_id"`
	ArticleID int       `json:"-" db:"article_id"`
	
	// Author information (populated via JOIN)
	Author Profile `json:"author"`
}

// CommentCreateRequest represents the request payload for creating a comment
type CommentCreateRequest struct {
	Comment struct {
		Body string `json:"body"`
	} `json:"comment"`
}

// CommentResponse represents the response format for a single comment
type CommentResponse struct {
	Comment Comment `json:"comment"`
}

// CommentsResponse represents the response format for multiple comments
type CommentsResponse struct {
	Comments []Comment `json:"comments"`
}