package model

import "time"

// Comment represents a comment in the system
type Comment struct {
	ID        int              `json:"id" db:"id"`
	Body      string           `json:"body" db:"body"`
	AuthorID  int              `json:"-" db:"author_id"`
	ArticleID int              `json:"-" db:"article_id"`
	CreatedAt time.Time        `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time        `json:"updatedAt" db:"updated_at"`
	Author    *ProfileResponse `json:"author"`
}

// CommentResponse represents the comment response format for the API
type CommentResponse struct {
	Comment *Comment `json:"comment"`
}

// CommentsResponse represents the comments list response format for the API
type CommentsResponse struct {
	Comments []*Comment `json:"comments"`
}
