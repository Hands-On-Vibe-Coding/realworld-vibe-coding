package model

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID           int       `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	Username     string    `json:"username" db:"username"`
	PasswordHash string    `json:"-" db:"password_hash"` // Never expose password hash in JSON
	Bio          *string   `json:"bio" db:"bio"`
	Image        *string   `json:"image" db:"image"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}

// UserCreateRequest represents the request payload for user registration
type UserCreateRequest struct {
	User struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	} `json:"user"`
}

// UserLoginRequest represents the request payload for user login
type UserLoginRequest struct {
	User struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	} `json:"user"`
}

// UserUpdateRequest represents the request payload for user updates
type UserUpdateRequest struct {
	User struct {
		Email    *string `json:"email,omitempty"`
		Username *string `json:"username,omitempty"`
		Password *string `json:"password,omitempty"`
		Bio      *string `json:"bio,omitempty"`
		Image    *string `json:"image,omitempty"`
	} `json:"user"`
}

// UserResponse represents the response format for user data
type UserResponse struct {
	User struct {
		Email    string  `json:"email"`
		Token    string  `json:"token"`
		Username string  `json:"username"`
		Bio      *string `json:"bio"`
		Image    *string `json:"image"`
	} `json:"user"`
}

// ProfileResponse represents the response format for user profiles
type ProfileResponse struct {
	Profile struct {
		Username  string  `json:"username"`
		Bio       *string `json:"bio"`
		Image     *string `json:"image"`
		Following bool    `json:"following"`
	} `json:"profile"`
}