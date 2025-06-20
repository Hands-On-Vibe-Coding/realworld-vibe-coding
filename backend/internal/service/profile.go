package service

import (
	"fmt"

	"realworld-backend/internal/model"
	"realworld-backend/internal/repository"
)

type ProfileService struct {
	profileRepo *repository.ProfileRepository
}

func NewProfileService(profileRepo *repository.ProfileRepository) *ProfileService {
	return &ProfileService{
		profileRepo: profileRepo,
	}
}

// GetProfile retrieves a user profile by username
func (s *ProfileService) GetProfile(username string, currentUserID *int) (*model.Profile, error) {
	if username == "" {
		return nil, fmt.Errorf("username is required")
	}

	profile, err := s.profileRepo.GetProfileByUsername(username, currentUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get profile: %w", err)
	}

	return profile, nil
}

// FollowUser creates a follow relationship
func (s *ProfileService) FollowUser(followerID int, username string) (*model.Profile, error) {
	if username == "" {
		return nil, fmt.Errorf("username is required")
	}
	if followerID <= 0 {
		return nil, fmt.Errorf("invalid user ID")
	}

	err := s.profileRepo.FollowUser(followerID, username)
	if err != nil {
		return nil, fmt.Errorf("failed to follow user: %w", err)
	}

	// Return updated profile
	return s.GetProfile(username, &followerID)
}

// UnfollowUser removes a follow relationship
func (s *ProfileService) UnfollowUser(followerID int, username string) (*model.Profile, error) {
	if username == "" {
		return nil, fmt.Errorf("username is required")
	}
	if followerID <= 0 {
		return nil, fmt.Errorf("invalid user ID")
	}

	err := s.profileRepo.UnfollowUser(followerID, username)
	if err != nil {
		return nil, fmt.Errorf("failed to unfollow user: %w", err)
	}

	// Return updated profile
	return s.GetProfile(username, &followerID)
}