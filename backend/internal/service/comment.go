package service

import (
	"fmt"

	"realworld-backend/internal/model"
	"realworld-backend/internal/repository"
)

type CommentService struct {
	commentRepo *repository.CommentRepository
}

func NewCommentService(commentRepo *repository.CommentRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
	}
}

// GetCommentsByArticleSlug retrieves all comments for an article
func (s *CommentService) GetCommentsByArticleSlug(slug string, currentUserID *int) ([]model.Comment, error) {
	if slug == "" {
		return nil, fmt.Errorf("article slug is required")
	}

	comments, err := s.commentRepo.GetCommentsByArticleSlug(slug, currentUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get comments: %w", err)
	}

	return comments, nil
}

// CreateComment creates a new comment on an article
func (s *CommentService) CreateComment(slug string, authorID int, body string) (*model.Comment, error) {
	if slug == "" {
		return nil, fmt.Errorf("article slug is required")
	}
	if body == "" {
		return nil, fmt.Errorf("comment body is required")
	}

	comment, err := s.commentRepo.CreateComment(slug, authorID, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	return comment, nil
}

// DeleteComment deletes a comment (only if the user is the author)
func (s *CommentService) DeleteComment(commentID, userID int) error {
	if commentID <= 0 {
		return fmt.Errorf("invalid comment ID")
	}
	if userID <= 0 {
		return fmt.Errorf("invalid user ID")
	}

	err := s.commentRepo.DeleteComment(commentID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}

	return nil
}