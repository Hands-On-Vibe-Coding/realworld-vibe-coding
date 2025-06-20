package model

import "time"

// User represents a user in the system
type User struct {
	ID           int       `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	Username     string    `json:"username" db:"username"`
	PasswordHash string    `json:"-" db:"password_hash"`
	Bio          string    `json:"bio" db:"bio"`
	Image        string    `json:"image" db:"image"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}

// UserResponse represents the user response format for the API
type UserResponse struct {
	Email    string `json:"email"`
	Token    string `json:"token"`
	Username string `json:"username"`
	Bio      string `json:"bio"`
	Image    string `json:"image"`
}

// ProfileResponse represents the profile response format for the API
type ProfileResponse struct {
	Username  string `json:"username"`
	Bio       string `json:"bio"`
	Image     string `json:"image"`
	Following bool   `json:"following"`
}

// CreateUserRequest represents the request body for user registration
type CreateUserRequest struct {
	User struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Username string `json:"username"`
	} `json:"user"`
}

// UpdateUserRequest represents the request body for user update
type UpdateUserRequest struct {
	User struct {
		Email    *string `json:"email,omitempty"`
		Username *string `json:"username,omitempty"`
		Password *string `json:"password,omitempty"`
		Bio      *string `json:"bio,omitempty"`
		Image    *string `json:"image,omitempty"`
	} `json:"user"`
}

// LoginRequest represents the request body for user login
type LoginRequest struct {
	User struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	} `json:"user"`
}