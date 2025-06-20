package handler

import (
	"database/sql"
	"net/http"

	"realworld-backend/internal/middleware"
	"realworld-backend/internal/repository"
	"realworld-backend/internal/service"
)

// SetupRoutes configures all application routes
func SetupRoutes(db *sql.DB) http.Handler {
	mux := http.NewServeMux()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)

	// Initialize services
	userService := service.NewUserService(userRepo)

	// Initialize handlers
	userHandler := NewUserHandler(userService)

	// Health check endpoint
	mux.HandleFunc("/health", HealthHandler)

	// Public user routes (no auth required)
	mux.HandleFunc("/api/users", userHandler.Register)
	mux.HandleFunc("/api/users/login", userHandler.Login)

	// Protected user routes (auth required)
	mux.Handle("/api/user", middleware.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			userHandler.GetCurrentUser(w, r)
		case http.MethodPut:
			userHandler.UpdateUser(w, r)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
	})))

	// Catch-all for unimplemented API routes
	mux.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"error": "API endpoint not found"}`))
	})

	// Apply middleware chain
	handler := middleware.Logging(mux)
	handler = middleware.CORS(handler)

	return handler
}