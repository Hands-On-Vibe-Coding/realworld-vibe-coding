package handler

import (
	"database/sql"
	"net/http"
	"strings"

	"realworld-backend/internal/middleware"
	"realworld-backend/internal/repository"
	"realworld-backend/internal/service"
)

// SetupRoutes configures all application routes
func SetupRoutes(db *sql.DB) http.Handler {
	mux := http.NewServeMux()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	articleRepo := repository.NewArticleRepository(db)
	tagRepo := repository.NewTagRepository(db)
	favoriteRepo := repository.NewFavoriteRepository(db)

	// Initialize services
	userService := service.NewUserService(userRepo)
	articleService := service.NewArticleService(articleRepo, tagRepo, favoriteRepo, userRepo)

	// Initialize handlers
	userHandler := NewUserHandler(userService)
	articleHandler := NewArticleHandler(articleService)
	favoriteHandler := NewFavoriteHandler(articleService)
	tagHandler := NewTagHandler(tagRepo)

	// Health check endpoint
	mux.HandleFunc("/health", HealthHandler)

	// Public routes
	mux.HandleFunc("/api/users", userHandler.Register)
	mux.HandleFunc("/api/users/login", userHandler.Login)
	mux.Handle("/api/tags", http.HandlerFunc(tagHandler.GetTags))

	// Article routes with method-based routing
	mux.HandleFunc("/api/articles", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			middleware.OptionalAuthMiddleware(http.HandlerFunc(articleHandler.ListArticles)).ServeHTTP(w, r)
		case http.MethodPost:
			middleware.AuthMiddleware(http.HandlerFunc(articleHandler.CreateArticle)).ServeHTTP(w, r)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/articles/feed", func(w http.ResponseWriter, r *http.Request) {
		middleware.AuthMiddleware(http.HandlerFunc(articleHandler.GetFeed)).ServeHTTP(w, r)
	})

	// Handle article slug-based routes
	mux.HandleFunc("/api/articles/", func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/api/articles/")
		parts := strings.Split(path, "/")
		
		if len(parts) == 1 && parts[0] != "" && parts[0] != "feed" {
			// /api/articles/:slug
			switch r.Method {
			case http.MethodGet:
				middleware.OptionalAuthMiddleware(http.HandlerFunc(articleHandler.GetArticle)).ServeHTTP(w, r)
			case http.MethodPut:
				middleware.AuthMiddleware(http.HandlerFunc(articleHandler.UpdateArticle)).ServeHTTP(w, r)
			case http.MethodDelete:
				middleware.AuthMiddleware(http.HandlerFunc(articleHandler.DeleteArticle)).ServeHTTP(w, r)
			default:
				http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
			}
		} else if len(parts) == 2 && parts[0] != "" && parts[1] == "favorite" {
			// /api/articles/:slug/favorite
			switch r.Method {
			case http.MethodPost:
				middleware.AuthMiddleware(http.HandlerFunc(favoriteHandler.FavoriteArticle)).ServeHTTP(w, r)
			case http.MethodDelete:
				middleware.AuthMiddleware(http.HandlerFunc(favoriteHandler.UnfavoriteArticle)).ServeHTTP(w, r)
			default:
				http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
			}
		} else {
			http.Error(w, `{"error": "Not found"}`, http.StatusNotFound)
		}
	})

	// Protected user routes
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