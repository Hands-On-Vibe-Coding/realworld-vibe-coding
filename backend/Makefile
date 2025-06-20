# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
BINARY_NAME=realworld-backend
BINARY_UNIX=$(BINARY_NAME)_unix

# Main targets
.PHONY: all build clean test coverage deps run dev fmt vet

all: test build

# Build the application
build:
	$(GOBUILD) -o $(BINARY_NAME) -v ./cmd/server

# Clean build artifacts
clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)
	rm -f $(BINARY_UNIX)

# Run tests
test:
	$(GOTEST) -v ./...

# Run tests with coverage
coverage:
	$(GOTEST) -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out -o coverage.html

# Download dependencies
deps:
	$(GOMOD) download
	$(GOMOD) tidy

# Run the application
run: build
	./$(BINARY_NAME)

# Development server (with hot reload support)
dev:
	$(GOCMD) run ./cmd/server

# Format code
fmt:
	$(GOCMD) fmt ./...

# Vet code
vet:
	$(GOCMD) vet ./...

# Install tools
tools:
	$(GOGET) -u golang.org/x/tools/cmd/goimports

# Cross compilation
build-linux:
	CGO_ENABLED=1 GOOS=linux GOARCH=amd64 $(GOBUILD) -o $(BINARY_UNIX) -v ./cmd/server

# Docker targets
docker-build:
	docker build -t $(BINARY_NAME) .

# Help
help:
	@echo "Available targets:"
	@echo "  build     - Build the binary"
	@echo "  clean     - Clean build artifacts"
	@echo "  test      - Run tests"
	@echo "  coverage  - Run tests with coverage"
	@echo "  deps      - Download dependencies"
	@echo "  run       - Build and run the application"
	@echo "  dev       - Run development server"
	@echo "  fmt       - Format code"
	@echo "  vet       - Vet code"
	@echo "  help      - Show this help message"