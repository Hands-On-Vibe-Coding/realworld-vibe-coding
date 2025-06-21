package service

import (
	"fmt"

	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/model"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/repository"
)

type ProfileService struct {
	userRepo *repository.UserRepository
}

func NewProfileService(userRepo *repository.UserRepository) *ProfileService {
	return &ProfileService{
		userRepo: userRepo,
	}
}

func (s *ProfileService) GetProfile(username string, currentUserID *int) (*model.ProfileResponse, error) {
	profile, err := s.userRepo.GetProfileByUsername(username, currentUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get profile: %w", err)
	}

	return profile, nil
}

func (s *ProfileService) FollowUser(followerID int, username string) (*model.ProfileResponse, error) {
	// Get the user to follow
	followed, err := s.userRepo.GetByUsername(username)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Prevent self-following
	if followerID == followed.ID {
		return nil, fmt.Errorf("cannot follow yourself")
	}

	// Check if already following
	isFollowing, err := s.userRepo.IsFollowing(followerID, followed.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to check follow status: %w", err)
	}

	if isFollowing {
		return nil, fmt.Errorf("already following this user")
	}

	// Create follow relationship
	err = s.userRepo.FollowUser(followerID, followed.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to follow user: %w", err)
	}

	// Return updated profile
	profile := &model.ProfileResponse{
		Username:  followed.Username,
		Bio:       followed.Bio,
		Image:     followed.Image,
		Following: true,
	}

	return profile, nil
}

func (s *ProfileService) UnfollowUser(followerID int, username string) (*model.ProfileResponse, error) {
	// Get the user to unfollow
	followed, err := s.userRepo.GetByUsername(username)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Remove follow relationship
	err = s.userRepo.UnfollowUser(followerID, followed.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to unfollow user: %w", err)
	}

	// Return updated profile
	profile := &model.ProfileResponse{
		Username:  followed.Username,
		Bio:       followed.Bio,
		Image:     followed.Image,
		Following: false,
	}

	return profile, nil
}
