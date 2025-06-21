package service

import (
	"fmt"
	"net/mail"

	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/model"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/repository"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
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

// CreateUser creates a new user with validation
func (s *UserService) CreateUser(req model.CreateUserRequest) (*model.User, error) {
	// Validate input
	if err := s.validateCreateUserRequest(req); err != nil {
		return nil, err
	}

	// Check if email already exists
	emailExists, err := s.userRepo.EmailExists(req.User.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to check email existence: %w", err)
	}
	if emailExists {
		return nil, fmt.Errorf("email already exists")
	}

	// Check if username already exists
	usernameExists, err := s.userRepo.UsernameExists(req.User.Username)
	if err != nil {
		return nil, fmt.Errorf("failed to check username existence: %w", err)
	}
	if usernameExists {
		return nil, fmt.Errorf("username already exists")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.User.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user object
	user := &model.User{
		Email:        req.User.Email,
		Username:     req.User.Username,
		PasswordHash: hashedPassword,
		Bio:          "",
		Image:        "",
	}

	// Save to database
	if err := s.userRepo.Create(user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// GetUserByEmail retrieves a user by email
func (s *UserService) GetUserByEmail(email string) (*model.User, error) {
	return s.userRepo.GetByEmail(email)
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(id int) (*model.User, error) {
	return s.userRepo.GetByID(id)
}

// GetUserByUsername retrieves a user by username
func (s *UserService) GetUserByUsername(username string) (*model.User, error) {
	return s.userRepo.GetByUsername(username)
}

// AuthenticateUser authenticates a user with email and password
func (s *UserService) AuthenticateUser(email, password string) (*model.User, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	return user, nil
}

// UpdateUser updates user information
func (s *UserService) UpdateUser(userID int, req model.UpdateUserRequest) (*model.User, error) {
	// Get existing user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	// Update fields if provided
	if req.User.Email != nil {
		if err := s.validateEmail(*req.User.Email); err != nil {
			return nil, err
		}
		// Check if new email already exists (excluding current user)
		if *req.User.Email != user.Email {
			emailExists, err := s.userRepo.EmailExists(*req.User.Email)
			if err != nil {
				return nil, fmt.Errorf("failed to check email existence: %w", err)
			}
			if emailExists {
				return nil, fmt.Errorf("email already exists")
			}
		}
		user.Email = *req.User.Email
	}

	if req.User.Username != nil {
		if err := s.validateUsername(*req.User.Username); err != nil {
			return nil, err
		}
		// Check if new username already exists (excluding current user)
		if *req.User.Username != user.Username {
			usernameExists, err := s.userRepo.UsernameExists(*req.User.Username)
			if err != nil {
				return nil, fmt.Errorf("failed to check username existence: %w", err)
			}
			if usernameExists {
				return nil, fmt.Errorf("username already exists")
			}
		}
		user.Username = *req.User.Username
	}

	if req.User.Password != nil {
		if err := s.validatePassword(*req.User.Password); err != nil {
			return nil, err
		}
		hashedPassword, err := utils.HashPassword(*req.User.Password)
		if err != nil {
			return nil, fmt.Errorf("failed to hash password: %w", err)
		}
		user.PasswordHash = hashedPassword
	}

	if req.User.Bio != nil {
		user.Bio = *req.User.Bio
	}

	if req.User.Image != nil {
		user.Image = *req.User.Image
	}

	// Update in database
	if err := s.userRepo.Update(user); err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return user, nil
}

// validateCreateUserRequest validates the create user request
func (s *UserService) validateCreateUserRequest(req model.CreateUserRequest) error {
	if err := s.validateEmail(req.User.Email); err != nil {
		return err
	}

	if err := s.validateUsername(req.User.Username); err != nil {
		return err
	}

	if err := s.validatePassword(req.User.Password); err != nil {
		return err
	}

	return nil
}

// validateEmail validates email format
func (s *UserService) validateEmail(email string) error {
	if email == "" {
		return fmt.Errorf("email is required")
	}

	if _, err := mail.ParseAddress(email); err != nil {
		return fmt.Errorf("invalid email format")
	}

	return nil
}

// validateUsername validates username
func (s *UserService) validateUsername(username string) error {
	if username == "" {
		return fmt.Errorf("username is required")
	}

	if len(username) < 3 {
		return fmt.Errorf("username must be at least 3 characters long")
	}

	if len(username) > 20 {
		return fmt.Errorf("username must be no more than 20 characters long")
	}

	// Check for valid characters (alphanumeric and underscore)
	for _, char := range username {
		if !((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char == '_') {
			return fmt.Errorf("username can only contain letters, numbers, and underscores")
		}
	}

	return nil
}

// validatePassword validates password strength
func (s *UserService) validatePassword(password string) error {
	if password == "" {
		return fmt.Errorf("password is required")
	}

	if len(password) < 6 {
		return fmt.Errorf("password must be at least 6 characters long")
	}

	if len(password) > 100 {
		return fmt.Errorf("password must be no more than 100 characters long")
	}

	// Check for at least one letter and one number (basic requirement)
	hasLetter := false
	hasNumber := false

	for _, char := range password {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') {
			hasLetter = true
		}
		if char >= '0' && char <= '9' {
			hasNumber = true
		}
	}

	if !hasLetter {
		return fmt.Errorf("password must contain at least one letter")
	}

	if !hasNumber {
		return fmt.Errorf("password must contain at least one number")
	}

	return nil
}

// ToUserResponse converts a User model to UserResponse
func (s *UserService) ToUserResponse(user *model.User, token string) model.UserResponse {
	return model.UserResponse{
		Email:    user.Email,
		Token:    token,
		Username: user.Username,
		Bio:      user.Bio,
		Image:    user.Image,
	}
}
