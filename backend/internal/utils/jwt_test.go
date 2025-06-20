package utils

import (
	"testing"
	"time"
)

func TestGenerateToken(t *testing.T) {
	secretKey := "test-secret-key"
	userID := 123
	email := "test@example.com"

	token, err := GenerateToken(userID, email, secretKey)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if token == "" {
		t.Fatal("Expected token to be generated, got empty string")
	}
}

func TestValidateToken(t *testing.T) {
	secretKey := "test-secret-key"
	userID := 123
	email := "test@example.com"

	// Generate a token
	token, err := GenerateToken(userID, email, secretKey)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// Validate the token
	claims, err := ValidateToken(token, secretKey)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Check claims
	if claims.UserID != userID {
		t.Errorf("Expected UserID %d, got %d", userID, claims.UserID)
	}

	if claims.Email != email {
		t.Errorf("Expected Email %s, got %s", email, claims.Email)
	}
}

func TestValidateTokenWithWrongSecret(t *testing.T) {
	secretKey := "test-secret-key"
	wrongSecret := "wrong-secret-key"
	userID := 123
	email := "test@example.com"

	// Generate a token with correct secret
	token, err := GenerateToken(userID, email, secretKey)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// Try to validate with wrong secret
	_, err = ValidateToken(token, wrongSecret)
	if err == nil {
		t.Fatal("Expected error when validating with wrong secret, got nil")
	}
}

func TestValidateInvalidToken(t *testing.T) {
	secretKey := "test-secret-key"
	invalidToken := "invalid.token.here"

	_, err := ValidateToken(invalidToken, secretKey)
	if err == nil {
		t.Fatal("Expected error when validating invalid token, got nil")
	}
}

func TestRefreshToken(t *testing.T) {
	secretKey := "test-secret-key"
	userID := 123
	email := "test@example.com"

	// Generate original token
	originalToken, err := GenerateToken(userID, email, secretKey)
	if err != nil {
		t.Fatalf("Failed to generate original token: %v", err)
	}

	// Wait a moment to ensure different issued times
	time.Sleep(time.Second * 1)

	// Refresh the token
	newToken, err := RefreshToken(originalToken, secretKey)
	if err != nil {
		t.Fatalf("Failed to refresh token: %v", err)
	}

	// Validate the new token
	claims, err := ValidateToken(newToken, secretKey)
	if err != nil {
		t.Fatalf("Failed to validate refreshed token: %v", err)
	}

	// Check that user data is preserved
	if claims.UserID != userID {
		t.Errorf("Expected UserID %d, got %d", userID, claims.UserID)
	}

	if claims.Email != email {
		t.Errorf("Expected Email %s, got %s", email, claims.Email)
	}

	// Tokens should be different
	if originalToken == newToken {
		t.Error("Expected refreshed token to be different from original")
	}
}