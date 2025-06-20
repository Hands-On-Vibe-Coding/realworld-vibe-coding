package service

import (
	"testing"

	"realworld-backend/internal/model"
	"realworld-backend/internal/repository"
	"realworld-backend/internal/testutil"
)

func TestUserService_Register(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	db := testutil.TestDB(t)
	defer testutil.CleanupDB(db)

	userRepo := repository.NewUserRepository(db)
	userService := NewUserService(userRepo)

	tests := []struct {
		name    string
		req     *model.UserCreateRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "successful registration",
			req: &model.UserCreateRequest{
				User: struct {
					Username string `json:"username"`
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Username: "testuser",
					Email:    "test@example.com",
					Password: "password123",
				},
			},
			wantErr: false,
		},
		{
			name: "empty email",
			req: &model.UserCreateRequest{
				User: struct {
					Username string `json:"username"`
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Username: "testuser",
					Email:    "",
					Password: "password123",
				},
			},
			wantErr: true,
			errMsg:  "email is required",
		},
		{
			name: "empty username",
			req: &model.UserCreateRequest{
				User: struct {
					Username string `json:"username"`
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Username: "",
					Email:    "test@example.com",
					Password: "password123",
				},
			},
			wantErr: true,
			errMsg:  "username is required",
		},
		{
			name: "short password",
			req: &model.UserCreateRequest{
				User: struct {
					Username string `json:"username"`
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Username: "testuser",
					Email:    "test@example.com",
					Password: "123",
				},
			},
			wantErr: true,
			errMsg:  "password must be at least 6 characters",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user, err := userService.Register(tt.req)
			if tt.wantErr {
				if err == nil {
					t.Errorf("UserService.Register() expected error but got nil")
					return
				}
				if err.Error() != tt.errMsg {
					t.Errorf("UserService.Register() error = %v, wantErr %v", err, tt.errMsg)
				}
				return
			}

			if err != nil {
				t.Errorf("UserService.Register() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if user == nil {
				t.Errorf("UserService.Register() returned nil user")
				return
			}

			if user.Email != tt.req.User.Email {
				t.Errorf("UserService.Register() email = %v, want %v", user.Email, tt.req.User.Email)
			}

			if user.Username != tt.req.User.Username {
				t.Errorf("UserService.Register() username = %v, want %v", user.Username, tt.req.User.Username)
			}

			if user.PasswordHash == "" {
				t.Errorf("UserService.Register() password hash is empty")
			}
		})
	}
}

func TestUserService_Register_DuplicateEmail(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	db := testutil.TestDB(t)
	defer testutil.CleanupDB(db)

	userRepo := repository.NewUserRepository(db)
	userService := NewUserService(userRepo)

	// First registration
	req1 := &model.UserCreateRequest{
		User: struct {
			Username string `json:"username"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}{
			Username: "user1",
			Email:    "test@example.com",
			Password: "password123",
		},
	}

	_, err := userService.Register(req1)
	if err != nil {
		t.Fatalf("First registration failed: %v", err)
	}

	// Second registration with same email
	req2 := &model.UserCreateRequest{
		User: struct {
			Username string `json:"username"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}{
			Username: "user2",
			Email:    "test@example.com", // Same email
			Password: "password123",
		},
	}

	_, err = userService.Register(req2)
	if err == nil {
		t.Errorf("Expected error for duplicate email, but got nil")
	}

	if err.Error() != "email already taken" {
		t.Errorf("Expected 'email already taken' error, got: %v", err)
	}
}

func TestUserService_Login(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	db := testutil.TestDB(t)
	defer testutil.CleanupDB(db)

	userRepo := repository.NewUserRepository(db)
	userService := NewUserService(userRepo)

	// Create a user first
	registerReq := &model.UserCreateRequest{
		User: struct {
			Username string `json:"username"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}{
			Username: "testuser",
			Email:    "test@example.com",
			Password: "password123",
		},
	}

	_, err := userService.Register(registerReq)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	tests := []struct {
		name    string
		req     *model.UserLoginRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "successful login",
			req: &model.UserLoginRequest{
				User: struct {
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Email:    "test@example.com",
					Password: "password123",
				},
			},
			wantErr: false,
		},
		{
			name: "invalid email",
			req: &model.UserLoginRequest{
				User: struct {
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Email:    "wrong@example.com",
					Password: "password123",
				},
			},
			wantErr: true,
			errMsg:  "invalid email or password",
		},
		{
			name: "invalid password",
			req: &model.UserLoginRequest{
				User: struct {
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Email:    "test@example.com",
					Password: "wrongpassword",
				},
			},
			wantErr: true,
			errMsg:  "invalid email or password",
		},
		{
			name: "empty email",
			req: &model.UserLoginRequest{
				User: struct {
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Email:    "",
					Password: "password123",
				},
			},
			wantErr: true,
			errMsg:  "email is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user, err := userService.Login(tt.req)
			if tt.wantErr {
				if err == nil {
					t.Errorf("UserService.Login() expected error but got nil")
					return
				}
				if err.Error() != tt.errMsg {
					t.Errorf("UserService.Login() error = %v, wantErr %v", err, tt.errMsg)
				}
				return
			}

			if err != nil {
				t.Errorf("UserService.Login() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if user == nil {
				t.Errorf("UserService.Login() returned nil user")
				return
			}

			if user.Email != tt.req.User.Email {
				t.Errorf("UserService.Login() email = %v, want %v", user.Email, tt.req.User.Email)
			}
		})
	}
}

func TestUserService_GetUserByID(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	db := testutil.TestDB(t)
	defer testutil.CleanupDB(db)

	userRepo := repository.NewUserRepository(db)
	userService := NewUserService(userRepo)

	// Create a user first
	registerReq := &model.UserCreateRequest{
		User: struct {
			Username string `json:"username"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}{
			Username: "testuser",
			Email:    "test@example.com",
			Password: "password123",
		},
	}

	createdUser, err := userService.Register(registerReq)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	tests := []struct {
		name    string
		userID  int
		wantErr bool
	}{
		{
			name:    "existing user",
			userID:  createdUser.ID,
			wantErr: false,
		},
		{
			name:    "non-existing user",
			userID:  999,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user, err := userService.GetUserByID(tt.userID)
			if tt.wantErr {
				if err == nil {
					t.Errorf("UserService.GetUserByID() expected error but got nil")
				}
				return
			}

			if err != nil {
				t.Errorf("UserService.GetUserByID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if user == nil {
				t.Errorf("UserService.GetUserByID() returned nil user")
				return
			}

			if user.ID != tt.userID {
				t.Errorf("UserService.GetUserByID() ID = %v, want %v", user.ID, tt.userID)
			}
		})
	}
}