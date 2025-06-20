# RealWorld 바이브코딩 Makefile

.PHONY: setup dev dev-back dev-front build test lint clean

# 개발 환경 설정
setup:
	@echo "🔧 Setting up development environment..."
	cd backend && go mod tidy
	cd frontend && npm install
	@echo "✅ Setup complete!"

# 개발 서버 실행 (백엔드 + 프론트엔드)
dev:
	@echo "🚀 Starting development servers..."
	@make dev-back & make dev-front

# 백엔드 개발 서버 실행
dev-back:
	@echo "🟢 Starting backend server..."
	cd backend && go run cmd/server/main.go

# 프론트엔드 개발 서버 실행
dev-front:
	@echo "🔵 Starting frontend server..."
	cd frontend && npm run dev

# 빌드
build:
	@echo "🏗️ Building project..."
	cd backend && go build -o bin/server cmd/server/main.go
	cd frontend && npm run build
	@echo "✅ Build complete!"

# 테스트 실행
test:
	@echo "🧪 Running tests..."
	make test-back
	make test-front

# 백엔드 테스트
test-back:
	@echo "🧪 Running backend tests..."
	cd backend && go test ./...

# 프론트엔드 테스트
test-front:
	@echo "🧪 Running frontend tests..."
	cd frontend && npm run test

# 린팅
lint:
	@echo "🔍 Running linters..."
	cd backend && go vet ./...
	cd backend && go fmt ./...
	cd frontend && npm run lint

# 정리
clean:
	@echo "🧹 Cleaning up..."
	cd backend && rm -rf bin/
	cd frontend && rm -rf dist/
	@echo "✅ Cleanup complete!"

# 데이터베이스 초기화
db-init:
	@echo "💾 Initializing database..."
	cd backend && rm -f realworld.db
	cd backend && go run cmd/server/main.go &
	@sleep 2
	@pkill -f "go run cmd/server/main.go" || true
	@echo "✅ Database initialized with all tables!"

# Docker 관련 (추후 구현)
docker:
	@echo "🐳 Building Docker images..."
	# TODO: Docker 이미지 빌드

# 배포 (추후 구현)
deploy:
	@echo "🚀 Deploying to production..."
	# TODO: 배포 스크립트 실행

# 도움말
help:
	@echo "RealWorld 바이브코딩 - Available commands:"
	@echo "  setup     - Set up development environment"
	@echo "  dev       - Start both backend and frontend servers"
	@echo "  dev-back  - Start backend server only"
	@echo "  dev-front - Start frontend server only"
	@echo "  build     - Build project for production"
	@echo "  test      - Run all tests"
	@echo "  lint      - Run linters and formatters"
	@echo "  clean     - Clean build artifacts"