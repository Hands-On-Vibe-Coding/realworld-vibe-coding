package middleware

import (
	"context"
	"net/http"
	"strings"

	"realworld-backend/internal/utils"
)

// contextKey is a custom type for context keys to avoid collisions
type contextKey string

const (
	// UserContextKey is the key for storing user info in context
	UserContextKey contextKey = "user"
)

// AuthMiddleware validates JWT tokens and sets user context
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error": "Authorization header required"}`, http.StatusUnauthorized)
			return
		}

		// Check if header starts with "Token "
		if !strings.HasPrefix(authHeader, "Token ") {
			http.Error(w, `{"error": "Invalid authorization header format. Use: Token <jwt>"}`, http.StatusUnauthorized)
			return
		}

		// Extract token
		tokenString := strings.TrimPrefix(authHeader, "Token ")
		if tokenString == "" {
			http.Error(w, `{"error": "Token is required"}`, http.StatusUnauthorized)
			return
		}

		// Validate token
		claims, err := utils.ValidateJWT(tokenString)
		if err != nil {
			http.Error(w, `{"error": "Invalid token"}`, http.StatusUnauthorized)
			return
		}

		// Add user info to context
		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		r = r.WithContext(ctx)

		// Call next handler
		next.ServeHTTP(w, r)
	})
}

// OptionalAuthMiddleware validates JWT tokens if present but doesn't require them
func OptionalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Token ") {
			// Extract and validate token
			tokenString := strings.TrimPrefix(authHeader, "Token ")
			if tokenString != "" {
				claims, err := utils.ValidateJWT(tokenString)
				if err == nil {
					// Add user info to context only if token is valid
					ctx := context.WithValue(r.Context(), UserContextKey, claims)
					r = r.WithContext(ctx)
				}
			}
		}

		// Call next handler regardless of token validation
		next.ServeHTTP(w, r)
	})
}

// GetUserFromContext extracts user claims from request context
func GetUserFromContext(r *http.Request) (*utils.JWTClaims, bool) {
	user, ok := r.Context().Value(UserContextKey).(*utils.JWTClaims)
	return user, ok
}