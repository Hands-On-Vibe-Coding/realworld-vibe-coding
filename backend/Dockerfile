# Build stage
FROM golang:1.21-alpine AS builder

# Install git and build dependencies  
RUN apk add --no-cache git ca-certificates tzdata gcc musl-dev sqlite-dev postgresql-dev

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application for production (CGO enabled for SQLite)
RUN CGO_ENABLED=1 GOOS=linux go build \
    -ldflags='-w -s' \
    -o server ./cmd/server/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates, curl, and database libraries for runtime
RUN apk --no-cache add ca-certificates tzdata sqlite postgresql-client curl

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/server .

# Copy migrations directory
COPY --from=builder /app/migrations ./migrations

# Create data directory for database
RUN mkdir -p /data && chown -R appuser:appgroup /app /data

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Environment variables (will be overridden by ECS task definition)
ENV PORT=8080
ENV DATABASE_URL=/data/realworld.db
ENV JWT_SECRET=change-me-in-production
ENV ENVIRONMENT=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the application
CMD ["./server"]