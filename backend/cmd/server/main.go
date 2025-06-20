package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/config"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/db"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Initialize database
	database, err := db.NewDatabase(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer database.Close()

	// Run migrations
	log.Println("Running database migrations...")
	if err := database.Migrate(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}
	log.Println("Database migrations completed successfully")

	// Create router
	router := mux.NewRouter()

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"ok","service":"realworld-backend"}`)
	}).Methods("GET")

	// API routes will be added here
	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"message":"pong"}`)
	}).Methods("GET")

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server starting on %s", addr)
	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}