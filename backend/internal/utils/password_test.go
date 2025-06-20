package utils

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		wantErr  bool
	}{
		{
			name:     "valid password",
			password: "password123",
			wantErr:  false,
		},
		{
			name:     "empty password",
			password: "",
			wantErr:  false, // bcrypt can handle empty strings
		},
		{
			name:     "long password",
			password: "this_is_a_very_long_password_that_should_still_work_fine",
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hash, err := HashPassword(tt.password)
			if (err != nil) != tt.wantErr {
				t.Errorf("HashPassword() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr {
				if hash == "" {
					t.Errorf("HashPassword() returned empty hash")
				}
				if hash == tt.password {
					t.Errorf("HashPassword() returned unhashed password")
				}
			}
		})
	}
}

func TestCheckPassword(t *testing.T) {
	password := "password123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password for test: %v", err)
	}

	tests := []struct {
		name     string
		hash     string
		password string
		want     bool
	}{
		{
			name:     "correct password",
			hash:     hash,
			password: password,
			want:     true,
		},
		{
			name:     "incorrect password",
			hash:     hash,
			password: "wrongpassword",
			want:     false,
		},
		{
			name:     "empty password",
			hash:     hash,
			password: "",
			want:     false,
		},
		{
			name:     "invalid hash",
			hash:     "invalid_hash",
			password: password,
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CheckPassword(tt.hash, tt.password)
			if got != tt.want {
				t.Errorf("CheckPassword() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestHashPasswordConsistency(t *testing.T) {
	password := "testpassword"
	
	// Hash the same password multiple times
	hash1, err1 := HashPassword(password)
	hash2, err2 := HashPassword(password)
	
	if err1 != nil || err2 != nil {
		t.Fatalf("Failed to hash passwords: %v, %v", err1, err2)
	}
	
	// Hashes should be different (due to salt)
	if hash1 == hash2 {
		t.Errorf("HashPassword() produced identical hashes, expected different due to salt")
	}
	
	// But both should verify correctly
	if !CheckPassword(hash1, password) {
		t.Errorf("CheckPassword() failed for first hash")
	}
	
	if !CheckPassword(hash2, password) {
		t.Errorf("CheckPassword() failed for second hash")
	}
}