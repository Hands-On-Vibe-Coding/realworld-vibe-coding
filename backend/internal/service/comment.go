package service

import (
	"fmt"

	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/model"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/repository"
)

type CommentService struct {
	commentRepo *repository.CommentRepository
	userRepo    *repository.UserRepository
}

func NewCommentService(commentRepo *repository.CommentRepository, userRepo *repository.UserRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
		userRepo:    userRepo,
	}
}

func (s *CommentService) GetCommentsByArticleSlug(slug string, currentUserID int) ([]*model.Comment, error) {
	comments, err := s.commentRepo.GetByArticleSlug(slug)
	if err != nil {
		return nil, fmt.Errorf("failed to get comments: %w", err)
	}

	// Set following status for each comment author (simplified for now)
	for _, comment := range comments {
		// TODO: Implement following functionality when user profile/follow features are added
		comment.Author.Following = false
	}

	return comments, nil
}

func (s *CommentService) CreateComment(articleSlug, body string, authorID int) (*model.Comment, error) {
	if body == "" {
		return nil, fmt.Errorf("comment body cannot be empty")
	}

	// Get article ID by slug
	articleID, err := s.commentRepo.GetArticleIDBySlug(articleSlug)
	if err != nil {
		return nil, fmt.Errorf("failed to find article: %w", err)
	}

	// Create comment
	comment := &model.Comment{
		Body:      body,
		AuthorID:  authorID,
		ArticleID: articleID,
	}

	err = s.commentRepo.Create(comment)
	if err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	// Get author information
	author, err := s.userRepo.GetByID(authorID)
	if err != nil {
		return nil, fmt.Errorf("failed to get author information: %w", err)
	}

	comment.Author = &model.ProfileResponse{
		Username:  author.Username,
		Bio:       author.Bio,
		Image:     author.Image,
		Following: false, // Default to false for newly created comment
	}

	return comment, nil
}

func (s *CommentService) DeleteComment(commentID, authorID int) error {
	// Get comment to verify ownership
	comment, err := s.commentRepo.GetByID(commentID)
	if err != nil {
		return fmt.Errorf("failed to get comment: %w", err)
	}

	// Check if user is the author of the comment
	if comment.AuthorID != authorID {
		return fmt.Errorf("unauthorized: only comment author can delete the comment")
	}

	// Delete comment
	err = s.commentRepo.Delete(commentID)
	if err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}

	return nil
}