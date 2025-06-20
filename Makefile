# RealWorld Application Makefile

# Default target
.DEFAULT_GOAL := help

# Variables
COMPOSE_FILE := docker-compose.yml
COMPOSE_DEV_FILE := docker-compose.dev.yml
BACKEND_DIR := backend
FRONTEND_DIR := frontend

## Help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Setup and Installation
setup: ## Initial development environment setup
	@echo "Setting up development environment..."
	@make setup-backend
	@make setup-frontend
	@echo "✅ Development environment setup complete!"

setup-backend: ## Setup backend dependencies
	@echo "Setting up backend..."
	@cd $(BACKEND_DIR) && go mod download
	@cd $(BACKEND_DIR) && go mod tidy

setup-frontend: ## Setup frontend dependencies
	@echo "Setting up frontend..."
	@cd $(FRONTEND_DIR) && npm install

## Development
dev: ## Run both frontend and backend with Docker (hot reload)
	@echo "Starting development environment with Docker..."
	@docker-compose -f $(COMPOSE_DEV_FILE) up --build

dev-detached: ## Run development environment in background
	@echo "Starting development environment in background..."
	@docker-compose -f $(COMPOSE_DEV_FILE) up --build -d

dev-local: ## Run development servers locally (without Docker)
	@echo "Starting local development servers..."
	@make -j2 dev-back-local dev-front-local

dev-back: ## Run backend with Docker
	@echo "Starting backend with Docker..."
	@docker-compose -f $(COMPOSE_DEV_FILE) up backend --build

dev-front: ## Run frontend with Docker
	@echo "Starting frontend with Docker..."
	@docker-compose -f $(COMPOSE_DEV_FILE) up frontend --build

dev-back-local: ## Run backend server locally
	@echo "Starting backend server locally..."
	@cd $(BACKEND_DIR) && go run cmd/server/main.go

dev-front-local: ## Run frontend dev server locally
	@echo "Starting frontend dev server locally..."
	@cd $(FRONTEND_DIR) && npm run dev

## Production
prod: ## Run production environment with Docker
	@echo "Starting production environment..."
	@docker-compose --profile production up --build -d

prod-build: ## Build production images
	@echo "Building production images..."
	@docker-compose --profile production build

## Building
build: ## Build both frontend and backend
	@echo "Building all components..."
	@make build-back
	@make build-front

build-back: ## Build backend binary
	@echo "Building backend..."
	@cd $(BACKEND_DIR) && go build -o realworld-backend ./cmd/server

build-front: ## Build frontend for production
	@echo "Building frontend..."
	@cd $(FRONTEND_DIR) && npm run build

## Testing
test: ## Run all tests
	@echo "Running all tests..."
	@make test-back
	@make test-front

test-back: ## Run backend tests
	@echo "Running backend tests..."
	@cd $(BACKEND_DIR) && go test ./...

test-front: ## Run frontend tests
	@echo "Running frontend tests..."
	@cd $(FRONTEND_DIR) && npm run test

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	@cd $(BACKEND_DIR) && go test -cover ./...
	@cd $(FRONTEND_DIR) && npm run test:coverage

## Code Quality
lint: ## Run linting for both projects
	@echo "Running linting..."
	@make lint-back
	@make lint-front

lint-back: ## Run backend linting
	@echo "Running backend linting..."
	@cd $(BACKEND_DIR) && go vet ./...
	@cd $(BACKEND_DIR) && golangci-lint run || echo "golangci-lint not installed, using go vet only"

lint-front: ## Run frontend linting
	@echo "Running frontend linting..."
	@cd $(FRONTEND_DIR) && npm run lint

format: ## Format code
	@echo "Formatting code..."
	@cd $(BACKEND_DIR) && go fmt ./...
	@cd $(FRONTEND_DIR) && npm run format || echo "No format script found"

## Docker Management
docker-build: ## Build Docker images
	@echo "Building Docker images..."
	@docker-compose build

docker-rebuild: ## Rebuild Docker images without cache
	@echo "Rebuilding Docker images..."
	@docker-compose build --no-cache

docker-clean: ## Clean Docker resources
	@echo "Cleaning Docker resources..."
	@docker-compose down -v --remove-orphans
	@docker system prune -f

docker-logs: ## Show Docker logs
	@docker-compose logs -f

docker-logs-backend: ## Show backend Docker logs
	@docker-compose logs -f backend

docker-logs-frontend: ## Show frontend Docker logs
	@docker-compose logs -f frontend

## Database
db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	@cd $(BACKEND_DIR) && go run cmd/server/main.go -migrate-only || echo "Migration-only mode not implemented"

db-reset: ## Reset database (remove SQLite file)
	@echo "Resetting database..."
	@rm -f $(BACKEND_DIR)/realworld.db
	@docker volume rm realworld-vibe-coding_backend_data 2>/dev/null || true

## Cleanup
clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	@rm -f $(BACKEND_DIR)/realworld-backend
	@rm -rf $(FRONTEND_DIR)/dist
	@rm -rf $(FRONTEND_DIR)/node_modules/.cache

clean-all: ## Clean everything including dependencies
	@echo "Cleaning everything..."
	@make clean
	@rm -rf $(FRONTEND_DIR)/node_modules
	@cd $(BACKEND_DIR) && go clean -modcache

## Utilities
logs: ## Show local application logs
	@echo "Showing logs..."
	@tail -f $(BACKEND_DIR)/*.log 2>/dev/null || echo "No log files found"

health: ## Check application health
	@echo "Checking application health..."
	@curl -f http://localhost:8080/health || echo "Backend health check failed"
	@curl -f http://localhost:5173/ || echo "Frontend health check failed"

stop: ## Stop all Docker services
	@echo "Stopping all services..."
	@docker-compose down

restart: ## Restart all Docker services
	@echo "Restarting all services..."
	@docker-compose restart

## Deployment (placeholder for future use)
deploy: ## Deploy to production (placeholder)
	@echo "Production deployment not yet implemented"
	@echo "This will be implemented in later tasks"

.PHONY: help setup setup-backend setup-frontend dev dev-detached dev-local dev-back dev-front dev-back-local dev-front-local prod prod-build build build-back build-front test test-back test-front test-coverage lint lint-back lint-front format docker-build docker-rebuild docker-clean docker-logs docker-logs-backend docker-logs-frontend db-migrate db-reset clean clean-all logs health stop restart deploy