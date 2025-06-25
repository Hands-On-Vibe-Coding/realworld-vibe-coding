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

	// Apply CORS middleware
	router.Use(middleware.CORS)

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"ok","service":"realworld-backend"}`)
	}).Methods("GET")

	// Initialize repositories
	userRepo := repository.NewUserRepository(database.DB)
	articleRepo := repository.NewArticleRepository(database.DB)
	tagRepo := repository.NewTagRepository(database.DB)
	commentRepo := repository.NewCommentRepository(database.DB)

	// Initialize services
	userService := service.NewUserService(userRepo)
	tagService := service.NewTagService(tagRepo)
	articleService := service.NewArticleService(articleRepo, userRepo, tagService)
	commentService := service.NewCommentService(commentRepo, userRepo)
	profileService := service.NewProfileService(userRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(cfg.JWTSecret)
	userHandler := handler.NewUserHandler(userService, cfg.JWTSecret)
	articleHandler := handler.NewArticleHandler(articleService)
	tagHandler := handler.NewTagHandler(tagService)
	commentHandler := handler.NewCommentHandler(commentService)
	profileHandler := handler.NewProfileHandler(profileService)

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
	api.HandleFunc("/users", userHandler.Register).Methods("POST", "OPTIONS")
	api.HandleFunc("/users/login", userHandler.Login).Methods("POST", "OPTIONS")

	// Protected user endpoints (require authentication)
	userProtected := api.PathPrefix("/user").Subrouter()
	userProtected.Use(jwtMiddleware)
	userProtected.HandleFunc("", userHandler.GetCurrentUser).Methods("GET", "OPTIONS")
	userProtected.HandleFunc("", userHandler.UpdateUser).Methods("PUT", "OPTIONS")

	// Article endpoints
	// Feed endpoint (requires authentication) - specific route first
	api.HandleFunc("/articles/feed", func(w http.ResponseWriter, r *http.Request) {
		jwtMiddleware(http.HandlerFunc(articleHandler.GetArticlesFeed)).ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")

	// Public article endpoints (optional auth) - general routes
	api.HandleFunc("/articles", func(w http.ResponseWriter, r *http.Request) {
		optionalJwtMiddleware(http.HandlerFunc(articleHandler.GetArticles)).ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")
	api.HandleFunc("/articles/{slug}", func(w http.ResponseWriter, r *http.Request) {
		optionalJwtMiddleware(http.HandlerFunc(articleHandler.GetArticle)).ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")

	// Article creation and modification (requires authentication)
	api.HandleFunc("/articles", func(w http.ResponseWriter, r *http.Request) {
		jwtMiddleware(http.HandlerFunc(articleHandler.CreateArticle)).ServeHTTP(w, r)
	}).Methods("POST", "OPTIONS")
	api.HandleFunc("/articles/{slug}", func(w http.ResponseWriter, r *http.Request) {
		jwtMiddleware(http.HandlerFunc(articleHandler.UpdateArticle)).ServeHTTP(w, r)
	}).Methods("PUT", "OPTIONS")
	api.HandleFunc("/articles/{slug}", func(w http.ResponseWriter, r *http.Request) {
		jwtMiddleware(http.HandlerFunc(articleHandler.DeleteArticle)).ServeHTTP(w, r)
	}).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/articles/{slug}/favorite", func(w http.ResponseWriter, r *http.Request) {
		jwtMiddleware(http.HandlerFunc(articleHandler.FavoriteArticle)).ServeHTTP(w, r)
	}).Methods("POST", "OPTIONS")
	api.HandleFunc("/articles/{slug}/favorite", func(w http.ResponseWriter, r *http.Request) {
		jwtMiddleware(http.HandlerFunc(articleHandler.UnfavoriteArticle)).ServeHTTP(w, r)
	}).Methods("DELETE", "OPTIONS")

	// Tag endpoints (public)
	api.HandleFunc("/tags", tagHandler.GetTags).Methods("GET", "OPTIONS")

	// Comment endpoints
	// Protected comment endpoints (require authentication)
	commentProtected := api.PathPrefix("/articles/{slug}/comments").Subrouter()
	commentProtected.Use(jwtMiddleware)
	commentProtected.HandleFunc("", commentHandler.CreateComment).Methods("POST")
	commentProtected.HandleFunc("/{id}", commentHandler.DeleteComment).Methods("DELETE")

	// Public comment endpoints (optional auth)
	commentPublic := api.PathPrefix("/articles/{slug}/comments").Subrouter()
	commentPublic.Use(optionalJwtMiddleware)
	commentPublic.HandleFunc("", commentHandler.GetComments).Methods("GET")

	// Profile endpoints
	// Protected profile endpoints (require authentication)
	profileProtected := api.PathPrefix("/profiles/{username}").Subrouter()
	profileProtected.Use(jwtMiddleware)
	profileProtected.HandleFunc("/follow", profileHandler.FollowUser).Methods("POST")
	profileProtected.HandleFunc("/follow", profileHandler.UnfollowUser).Methods("DELETE")

	// Public profile endpoints (optional auth)
	profilePublic := api.PathPrefix("/profiles/{username}").Subrouter()
	profilePublic.Use(optionalJwtMiddleware)
	profilePublic.HandleFunc("", profileHandler.GetProfile).Methods("GET")

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
			"message":       "This endpoint works with or without authentication",
			"authenticated": authenticated,
		}

		if authenticated {
			response["user"] = map[string]interface{}{
				"id":    claims.UserID,
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
