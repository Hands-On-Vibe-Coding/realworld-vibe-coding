package handler

import (
	"net/http"

	"realworld-backend/internal/middleware"
)

// SetupRoutes configures all application routes
func SetupRoutes() http.Handler {
	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("/health", HealthHandler)

	// API routes (to be implemented)
	mux.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"error": "API endpoint not implemented yet"}`))
	})

	// Apply middleware chain
	handler := middleware.Logging(mux)
	handler = middleware.CORS(handler)

	return handler
}