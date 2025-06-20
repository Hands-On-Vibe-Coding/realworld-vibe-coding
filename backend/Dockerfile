# Build stage  
FROM golang:1.23-bullseye AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy go mod and sum files first for better caching
COPY go.mod go.sum ./

# Download dependencies (this layer will be cached if go.mod/go.sum don't change)
RUN go mod download

# Copy source code
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=1 go build -ldflags="-w -s" -o realworld-backend ./cmd/server

# Runtime stage
FROM debian:bullseye-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    sqlite3 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/realworld-backend .

# Copy migrations
COPY --from=builder /app/migrations ./migrations

# Create data directory for SQLite
RUN mkdir -p /data

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV DATABASE_URL=/data/realworld.db
ENV JWT_SECRET=dev-secret-key
ENV ENVIRONMENT=development

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./realworld-backend"]