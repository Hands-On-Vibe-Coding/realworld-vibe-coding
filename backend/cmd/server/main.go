package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/config"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/db"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/handler"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/middleware"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/repository"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/service"
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

	// Initialize repositories
	userRepo := repository.NewUserRepository(database.DB)
	articleRepo := repository.NewArticleRepository(database.DB)

	// Initialize services
	userService := service.NewUserService(userRepo)
	articleService := service.NewArticleService(articleRepo, userRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(cfg.JWTSecret)
	userHandler := handler.NewUserHandler(userService, cfg.JWTSecret)
	articleHandler := handler.NewArticleHandler(articleService)

	// Create JWT middleware
	jwtMiddleware := middleware.JWTMiddleware(cfg.JWTSecret)
	optionalJwtMiddleware := middleware.OptionalJWTMiddleware(cfg.JWTSecret)

	// API routes
	api := router.PathPrefix("/api").Subrouter()
	
	// Public endpoints
	api.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"message":"pong"}`)
	}).Methods("GET")

	// Auth test endpoints (for development/testing)
	api.HandleFunc("/auth/test-token", authHandler.GenerateTestToken).Methods("POST")

	// RealWorld API endpoints
	// User registration and authentication
	api.HandleFunc("/users", userHandler.Register).Methods("POST")
	api.HandleFunc("/users/login", userHandler.Login).Methods("POST")
	
	// Protected user endpoints (require authentication)
	userProtected := api.PathPrefix("/user").Subrouter()
	userProtected.Use(jwtMiddleware)
	userProtected.HandleFunc("", userHandler.GetCurrentUser).Methods("GET")
	userProtected.HandleFunc("", userHandler.UpdateUser).Methods("PUT")

	// Article endpoints
	// Article creation (requires authentication)
	articleProtected := api.PathPrefix("/articles").Subrouter()
	articleProtected.Use(jwtMiddleware)
	articleProtected.HandleFunc("", articleHandler.CreateArticle).Methods("POST")
	articleProtected.HandleFunc("/feed", articleHandler.GetArticlesFeed).Methods("GET")
	articleProtected.HandleFunc("/{slug}", articleHandler.UpdateArticle).Methods("PUT")
	articleProtected.HandleFunc("/{slug}", articleHandler.DeleteArticle).Methods("DELETE")
	
	// Public article endpoints (optional auth)
	articlePublic := api.PathPrefix("/articles").Subrouter()
	articlePublic.Use(optionalJwtMiddleware)
	articlePublic.HandleFunc("", articleHandler.GetArticles).Methods("GET")
	articlePublic.HandleFunc("/{slug}", articleHandler.GetArticle).Methods("GET")

	// Protected auth test endpoints (require authentication)
	protected := api.PathPrefix("/auth").Subrouter()
	protected.Use(jwtMiddleware)
	protected.HandleFunc("/validate", authHandler.ValidateToken).Methods("GET")
	protected.HandleFunc("/refresh", authHandler.RefreshToken).Methods("POST")
	protected.HandleFunc("/protected", authHandler.ProtectedEndpoint).Methods("GET")

	// Optional auth endpoints (work with or without auth)
	optional := api.PathPrefix("/optional").Subrouter()
	optional.Use(optionalJwtMiddleware)
	optional.HandleFunc("/test", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		
		claims, authenticated := middleware.GetUserFromContext(r)
		response := map[string]interface{}{
			"message": "This endpoint works with or without authentication",
			"authenticated": authenticated,
		}
		
		if authenticated {
			response["user"] = map[string]interface{}{
				"id": claims.UserID,
				"email": claims.Email,
			}
		}
		
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	}).Methods("GET")

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server starting on %s", addr)
	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}