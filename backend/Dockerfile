# Build stage
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git gcc musl-dev sqlite-dev

# Set working directory
WORKDIR /app

# Copy go mod and sum files first for better caching
COPY go.mod go.sum ./

# Download dependencies (this layer will be cached if go.mod/go.sum don't change)
RUN go mod download

# Copy source code
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-w -s" -a -installsuffix cgo -o realworld-backend ./cmd/server

# Runtime stage
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates sqlite

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