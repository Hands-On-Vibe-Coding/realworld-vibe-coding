package service

import (
	"fmt"
	"strings"

	"realworld-backend/internal/model"
	"realworld-backend/internal/repository"
	"realworld-backend/internal/utils"
)

// UserService handles user business logic
type UserService struct {
	userRepo *repository.UserRepository
}

// NewUserService creates a new user service
func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// Register creates a new user account
func (s *UserService) Register(req *model.UserCreateRequest) (*model.User, error) {
	// Validate input
	if err := s.validateRegistration(req); err != nil {
		return nil, err
	}

	// Check if email already exists
	exists, err := s.userRepo.EmailExists(req.User.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to check email existence: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("email already taken")
	}

	// Check if username already exists
	exists, err = s.userRepo.UsernameExists(req.User.Username)
	if err != nil {
		return nil, fmt.Errorf("failed to check username existence: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("username already taken")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.User.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := &model.User{
		Email:        req.User.Email,
		Username:     req.User.Username,
		PasswordHash: hashedPassword,
	}

	err = s.userRepo.Create(user)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// Login authenticates a user and returns user info
func (s *UserService) Login(req *model.UserLoginRequest) (*model.User, error) {
	// Validate input
	if err := s.validateLogin(req); err != nil {
		return nil, err
	}

	// Get user by email
	user, err := s.userRepo.GetByEmail(req.User.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	// Check password
	if !utils.CheckPassword(user.PasswordHash, req.User.Password) {
		return nil, fmt.Errorf("invalid email or password")
	}

	return user, nil
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(id int) (*model.User, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}
	return user, nil
}

// UpdateUser updates user information
func (s *UserService) UpdateUser(userID int, req *model.UserUpdateRequest) (*model.User, error) {
	// Get existing user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	// Update fields if provided
	if req.User.Email != nil {
		if *req.User.Email != user.Email {
			// Check if new email is already taken
			exists, err := s.userRepo.EmailExists(*req.User.Email)
			if err != nil {
				return nil, fmt.Errorf("failed to check email existence: %w", err)
			}
			if exists {
				return nil, fmt.Errorf("email already taken")
			}
			user.Email = *req.User.Email
		}
	}

	if req.User.Username != nil {
		if *req.User.Username != user.Username {
			// Check if new username is already taken
			exists, err := s.userRepo.UsernameExists(*req.User.Username)
			if err != nil {
				return nil, fmt.Errorf("failed to check username existence: %w", err)
			}
			if exists {
				return nil, fmt.Errorf("username already taken")
			}
			user.Username = *req.User.Username
		}
	}

	if req.User.Password != nil {
		hashedPassword, err := utils.HashPassword(*req.User.Password)
		if err != nil {
			return nil, fmt.Errorf("failed to hash password: %w", err)
		}
		user.PasswordHash = hashedPassword
	}

	if req.User.Bio != nil {
		user.Bio = req.User.Bio
	}

	if req.User.Image != nil {
		user.Image = req.User.Image
	}

	// Update user in database
	err = s.userRepo.Update(user)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return user, nil
}

// validateRegistration validates user registration input
func (s *UserService) validateRegistration(req *model.UserCreateRequest) error {
	if strings.TrimSpace(req.User.Email) == "" {
		return fmt.Errorf("email is required")
	}
	if strings.TrimSpace(req.User.Username) == "" {
		return fmt.Errorf("username is required")
	}
	if strings.TrimSpace(req.User.Password) == "" {
		return fmt.Errorf("password is required")
	}
	if len(req.User.Password) < 6 {
		return fmt.Errorf("password must be at least 6 characters")
	}
	return nil
}

// validateLogin validates user login input
func (s *UserService) validateLogin(req *model.UserLoginRequest) error {
	if strings.TrimSpace(req.User.Email) == "" {
		return fmt.Errorf("email is required")
	}
	if strings.TrimSpace(req.User.Password) == "" {
		return fmt.Errorf("password is required")
	}
	return nil
}