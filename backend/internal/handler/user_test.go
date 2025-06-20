package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"realworld-backend/internal/middleware"
	"realworld-backend/internal/model"
	"realworld-backend/internal/repository"
	"realworld-backend/internal/service"
	"realworld-backend/internal/testutil"
	"realworld-backend/internal/utils"
)

func TestUserHandler_Register(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	db := testutil.TestDB(t)
	defer testutil.CleanupDB(db)

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	userHandler := NewUserHandler(userService)

	tests := []struct {
		name       string
		method     string
		body       interface{}
		wantStatus int
		wantError  string
	}{
		{
			name:   "successful registration",
			method: http.MethodPost,
			body: model.UserCreateRequest{
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
			wantStatus: http.StatusCreated,
		},
		{
			name:   "invalid method",
			method: http.MethodGet,
			body: model.UserCreateRequest{
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
			wantStatus: http.StatusMethodNotAllowed,
			wantError:  "Method not allowed",
		},
		{
			name:       "invalid JSON",
			method:     http.MethodPost,
			body:       "invalid json",
			wantStatus: http.StatusBadRequest,
			wantError:  "Invalid JSON",
		},
		{
			name:   "missing email",
			method: http.MethodPost,
			body: model.UserCreateRequest{
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
			wantStatus: http.StatusBadRequest,
			wantError:  "email is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var reqBody []byte
			var err error

			if str, ok := tt.body.(string); ok {
				reqBody = []byte(str)
			} else {
				reqBody, err = json.Marshal(tt.body)
				if err != nil {
					t.Fatalf("Failed to marshal request body: %v", err)
				}
			}

			req := httptest.NewRequest(tt.method, "/api/users", bytes.NewBuffer(reqBody))
			req.Header.Set("Content-Type", "application/json")
			
			rr := httptest.NewRecorder()
			userHandler.Register(rr, req)

			if rr.Code != tt.wantStatus {
				t.Errorf("UserHandler.Register() status = %v, want %v", rr.Code, tt.wantStatus)
			}

			if tt.wantError != "" {
				var errorResp map[string]string
				err := json.Unmarshal(rr.Body.Bytes(), &errorResp)
				if err != nil {
					t.Errorf("Failed to unmarshal error response: %v", err)
					return
				}
				if errorResp["error"] != tt.wantError {
					t.Errorf("UserHandler.Register() error = %v, want %v", errorResp["error"], tt.wantError)
				}
			} else if tt.wantStatus == http.StatusCreated {
				var response model.UserResponse
				err := json.Unmarshal(rr.Body.Bytes(), &response)
				if err != nil {
					t.Errorf("Failed to unmarshal success response: %v", err)
					return
				}
				if response.User.Email == "" {
					t.Errorf("UserHandler.Register() missing email in response")
				}
				if response.User.Token == "" {
					t.Errorf("UserHandler.Register() missing token in response")
				}
			}
		})
	}
}

func TestUserHandler_Login(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	db := testutil.TestDB(t)
	defer testutil.CleanupDB(db)

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	userHandler := NewUserHandler(userService)

	// Create a test user first
	registerReq := model.UserCreateRequest{
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

	reqBody, _ := json.Marshal(registerReq)
	req := httptest.NewRequest(http.MethodPost, "/api/users", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	userHandler.Register(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("Failed to create test user: %v", rr.Body.String())
	}

	tests := []struct {
		name       string
		method     string
		body       interface{}
		wantStatus int
		wantError  string
	}{
		{
			name:   "successful login",
			method: http.MethodPost,
			body: model.UserLoginRequest{
				User: struct {
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Email:    "test@example.com",
					Password: "password123",
				},
			},
			wantStatus: http.StatusOK,
		},
		{
			name:   "invalid credentials",
			method: http.MethodPost,
			body: model.UserLoginRequest{
				User: struct {
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Email:    "test@example.com",
					Password: "wrongpassword",
				},
			},
			wantStatus: http.StatusUnauthorized,
			wantError:  "invalid email or password",
		},
		{
			name:   "invalid method",
			method: http.MethodGet,
			body: model.UserLoginRequest{
				User: struct {
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Email:    "test@example.com",
					Password: "password123",
				},
			},
			wantStatus: http.StatusMethodNotAllowed,
			wantError:  "Method not allowed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reqBody, err := json.Marshal(tt.body)
			if err != nil {
				t.Fatalf("Failed to marshal request body: %v", err)
			}

			req := httptest.NewRequest(tt.method, "/api/users/login", bytes.NewBuffer(reqBody))
			req.Header.Set("Content-Type", "application/json")
			
			rr := httptest.NewRecorder()
			userHandler.Login(rr, req)

			if rr.Code != tt.wantStatus {
				t.Errorf("UserHandler.Login() status = %v, want %v", rr.Code, tt.wantStatus)
			}

			if tt.wantError != "" {
				var errorResp map[string]string
				err := json.Unmarshal(rr.Body.Bytes(), &errorResp)
				if err != nil {
					t.Errorf("Failed to unmarshal error response: %v", err)
					return
				}
				if errorResp["error"] != tt.wantError {
					t.Errorf("UserHandler.Login() error = %v, want %v", errorResp["error"], tt.wantError)
				}
			} else if tt.wantStatus == http.StatusOK {
				var response model.UserResponse
				err := json.Unmarshal(rr.Body.Bytes(), &response)
				if err != nil {
					t.Errorf("Failed to unmarshal success response: %v", err)
					return
				}
				if response.User.Email == "" {
					t.Errorf("UserHandler.Login() missing email in response")
				}
				if response.User.Token == "" {
					t.Errorf("UserHandler.Login() missing token in response")
				}
			}
		})
	}
}

func TestUserHandler_GetCurrentUser(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	db := testutil.TestDB(t)
	defer testutil.CleanupDB(db)

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	userHandler := NewUserHandler(userService)

	// Create a test user first
	user := &model.User{
		Email:        "test@example.com",
		Username:     "testuser",
		PasswordHash: "hashed_password",
	}
	err := userRepo.Create(user)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	// Generate test JWT token
	token, err := utils.GenerateJWT(user.ID, user.Username, user.Email)
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	tests := []struct {
		name       string
		method     string
		authToken  string
		wantStatus int
		wantError  string
	}{
		{
			name:       "successful get current user",
			method:     http.MethodGet,
			authToken:  token,
			wantStatus: http.StatusOK,
		},
		{
			name:       "missing auth token",
			method:     http.MethodGet,
			authToken:  "",
			wantStatus: http.StatusUnauthorized,
			wantError:  "User not found in context",
		},
		{
			name:       "invalid method",
			method:     http.MethodPost,
			authToken:  token,
			wantStatus: http.StatusMethodNotAllowed,
			wantError:  "Method not allowed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, "/api/user", nil)
			if tt.authToken != "" {
				req.Header.Set("Authorization", "Bearer "+tt.authToken)
				
				// Validate and add claims to context
				claims, err := utils.ValidateJWT(tt.authToken)
				if err == nil {
					ctx := context.WithValue(req.Context(), middleware.UserContextKey, claims)
					req = req.WithContext(ctx)
				}
			}
			
			rr := httptest.NewRecorder()
			userHandler.GetCurrentUser(rr, req)

			if rr.Code != tt.wantStatus {
				t.Errorf("UserHandler.GetCurrentUser() status = %v, want %v", rr.Code, tt.wantStatus)
			}

			if tt.wantError != "" {
				var errorResp map[string]string
				err := json.Unmarshal(rr.Body.Bytes(), &errorResp)
				if err != nil {
					t.Errorf("Failed to unmarshal error response: %v", err)
					return
				}
				if errorResp["error"] != tt.wantError {
					t.Errorf("UserHandler.GetCurrentUser() error = %v, want %v", errorResp["error"], tt.wantError)
				}
			} else if tt.wantStatus == http.StatusOK {
				var response model.UserResponse
				err := json.Unmarshal(rr.Body.Bytes(), &response)
				if err != nil {
					t.Errorf("Failed to unmarshal success response: %v", err)
					return
				}
				if response.User.Email != user.Email {
					t.Errorf("UserHandler.GetCurrentUser() email = %v, want %v", response.User.Email, user.Email)
				}
				if response.User.Token == "" {
					t.Errorf("UserHandler.GetCurrentUser() missing token in response")
				}
			}
		})
	}
}