package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/utils"
)

// ContextKey is the type for context keys to avoid collisions
type ContextKey string

const (
	// UserContextKey is the key for storing user claims in request context
	UserContextKey ContextKey = "user"
)

// JWTMiddleware creates a middleware that validates JWT tokens
func JWTMiddleware(secretKey string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get the Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, `{"error":"Authorization header is required"}`, http.StatusUnauthorized)
				return
			}

			// Check if header has "Bearer " prefix
			if !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, `{"error":"Authorization header must start with Bearer"}`, http.StatusUnauthorized)
				return
			}

			// Extract the token
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == "" {
				http.Error(w, `{"error":"Token is required"}`, http.StatusUnauthorized)
				return
			}

			// Validate the token
			claims, err := utils.ValidateToken(tokenString, secretKey)
			if err != nil {
				http.Error(w, `{"error":"Invalid or expired token"}`, http.StatusUnauthorized)
				return
			}

			// Add user claims to request context
			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			r = r.WithContext(ctx)

			// Call the next handler
			next.ServeHTTP(w, r)
		})
	}
}

// OptionalJWTMiddleware creates a middleware that validates JWT tokens if present
// but doesn't require authentication (useful for endpoints that work with or without auth)
func OptionalJWTMiddleware(secretKey string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get the Authorization header
			authHeader := r.Header.Get("Authorization")
			
			// If no auth header, proceed without authentication
			if authHeader == "" {
				next.ServeHTTP(w, r)
				return
			}

			// If header exists, validate it
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString := strings.TrimPrefix(authHeader, "Bearer ")
				if tokenString != "" {
					// Try to validate the token
					if claims, err := utils.ValidateToken(tokenString, secretKey); err == nil {
						// Add user claims to request context if token is valid
						ctx := context.WithValue(r.Context(), UserContextKey, claims)
						r = r.WithContext(ctx)
					}
					// If token is invalid, we still continue without authentication
				}
			}

			// Call the next handler
			next.ServeHTTP(w, r)
		})
	}
}

// GetUserFromContext extracts user claims from request context
func GetUserFromContext(r *http.Request) (*utils.Claims, bool) {
	user := r.Context().Value(UserContextKey)
	if user == nil {
		return nil, false
	}

	claims, ok := user.(*utils.Claims)
	return claims, ok
}

// RequireAuth is a helper function to check if user is authenticated
func RequireAuth(r *http.Request) (*utils.Claims, error) {
	claims, ok := GetUserFromContext(r)
	if !ok {
		return nil, http.ErrNoCookie // Using standard error, could be custom
	}
	return claims, nil
}