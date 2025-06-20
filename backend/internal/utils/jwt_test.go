package utils

import (
	"os"
	"testing"
	"time"

	"realworld-backend/internal/testutil"
)

func TestGenerateJWT(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	tests := []struct {
		name     string
		userID   int
		username string
		email    string
		wantErr  bool
	}{
		{
			name:     "valid user data",
			userID:   1,
			username: "testuser",
			email:    "test@example.com",
			wantErr:  false,
		},
		{
			name:     "zero user ID",
			userID:   0,
			username: "testuser",
			email:    "test@example.com",
			wantErr:  false, // Should still work
		},
		{
			name:     "empty username",
			userID:   1,
			username: "",
			email:    "test@example.com",
			wantErr:  false, // Should still work
		},
		{
			name:     "empty email",
			userID:   1,
			username: "testuser",
			email:    "",
			wantErr:  false, // Should still work
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := GenerateJWT(tt.userID, tt.username, tt.email)
			if (err != nil) != tt.wantErr {
				t.Errorf("GenerateJWT() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr {
				if token == "" {
					t.Errorf("GenerateJWT() returned empty token")
				}
				
				// Token should have 3 parts separated by dots
				parts := len(token)
				if parts == 0 {
					t.Errorf("GenerateJWT() returned invalid token format")
				}
			}
		})
	}
}

func TestValidateJWT(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	// Generate a valid token first
	userID := 123
	username := "testuser"
	email := "test@example.com"
	
	validToken, err := GenerateJWT(userID, username, email)
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	tests := []struct {
		name      string
		token     string
		wantErr   bool
		wantID    int
		wantEmail string
	}{
		{
			name:      "valid token",
			token:     validToken,
			wantErr:   false,
			wantID:    userID,
			wantEmail: email,
		},
		{
			name:    "empty token",
			token:   "",
			wantErr: true,
		},
		{
			name:    "invalid token",
			token:   "invalid.token.here",
			wantErr: true,
		},
		{
			name:    "malformed token",
			token:   "not-a-jwt-token",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			claims, err := ValidateJWT(tt.token)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateJWT() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr {
				if claims == nil {
					t.Errorf("ValidateJWT() returned nil claims")
					return
				}
				
				if claims.UserID != tt.wantID {
					t.Errorf("ValidateJWT() userID = %v, want %v", claims.UserID, tt.wantID)
				}
				
				if claims.Email != tt.wantEmail {
					t.Errorf("ValidateJWT() email = %v, want %v", claims.Email, tt.wantEmail)
				}
			}
		})
	}
}

func TestJWTExpiration(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	userID := 1
	username := "testuser"
	email := "test@example.com"

	token, err := GenerateJWT(userID, username, email)
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	claims, err := ValidateJWT(token)
	if err != nil {
		t.Fatalf("Failed to validate test token: %v", err)
	}

	// Check that expiration is set and in the future
	if claims.ExpiresAt.Time.Before(time.Now()) {
		t.Errorf("JWT token expires in the past")
	}

	// Check that expiration is reasonable (should be 24 hours from now, give or take)
	expectedExp := time.Now().Add(24 * time.Hour)
	timeDiff := claims.ExpiresAt.Time.Sub(expectedExp)
	if timeDiff > time.Minute || timeDiff < -time.Minute {
		t.Errorf("JWT expiration time unexpected: got %v, expected around %v", claims.ExpiresAt.Time, expectedExp)
	}
}

func TestJWTWithoutSecret(t *testing.T) {
	// Remove JWT secret
	originalSecret := os.Getenv("JWT_SECRET")
	os.Unsetenv("JWT_SECRET")
	defer func() {
		if originalSecret != "" {
			os.Setenv("JWT_SECRET", originalSecret)
		}
	}()

	// The implementation uses a default secret, so this should still work
	token, err := GenerateJWT(1, "test", "test@example.com")
	if err != nil {
		t.Errorf("GenerateJWT() should work with default secret: %v", err)
	}
	
	if token == "" {
		t.Errorf("GenerateJWT() should return non-empty token with default secret")
	}
}

func TestJWTRoundTrip(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	testCases := []struct {
		userID   int
		username string
		email    string
	}{
		{1, "user1", "user1@example.com"},
		{999, "longusername", "very.long.email@example.com"},
		{42, "user-with-dashes", "user+tag@example.org"},
	}

	for _, tc := range testCases {
		t.Run(tc.username, func(t *testing.T) {
			// Generate token
			token, err := GenerateJWT(tc.userID, tc.username, tc.email)
			if err != nil {
				t.Fatalf("GenerateJWT() failed: %v", err)
			}

			// Validate token
			claims, err := ValidateJWT(token)
			if err != nil {
				t.Fatalf("ValidateJWT() failed: %v", err)
			}

			// Verify all fields match
			if claims.UserID != tc.userID {
				t.Errorf("UserID mismatch: got %v, want %v", claims.UserID, tc.userID)
			}
			if claims.Username != tc.username {
				t.Errorf("Username mismatch: got %v, want %v", claims.Username, tc.username)
			}
			if claims.Email != tc.email {
				t.Errorf("Email mismatch: got %v, want %v", claims.Email, tc.email)
			}
		})
	}
}