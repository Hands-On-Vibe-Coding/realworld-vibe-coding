package main

import (
	"fmt"
	"log"
	"net/http"

	"realworld-backend/internal/config"
	"realworld-backend/internal/handler"
)

func main() {
	fmt.Println("🚀 RealWorld Backend Server Starting...")
	
	// Initialize database
	db, err := config.InitDB()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer db.Close()
	
	// Setup routes with middleware
	router := handler.SetupRoutes()
	
	port := ":8081"
	fmt.Printf("Server running on http://localhost%s\n", port)
	fmt.Println("Health check: http://localhost:8081/health")
	fmt.Println("API base URL: http://localhost:8081/api/")
	
	if err := http.ListenAndServe(port, router); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}