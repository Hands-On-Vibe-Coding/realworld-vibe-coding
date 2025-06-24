#!/bin/bash

# Frontend Development Server Start Script
# 기존 프로세스 정리 후 새로운 개발 서버 시작

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}$1${NC}"
}

log_success() {
    echo -e "${GREEN}$1${NC}"
}

log_warning() {
    echo -e "${YELLOW}$1${NC}"
}

log_error() {
    echo -e "${RED}$1${NC}"
}

log_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Kill processes on specific port
kill_port() {
    local port=$1
    local name=$2
    
    log_warning "🔍 Checking port $port ($name)..."
    
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pids" ]; then
        log_error "⚠️  Found processes on port $port"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
        log_success "✅ Killed processes on port $port"
    else
        log_success "✅ Port $port is free"
    fi
}

# Kill processes by pattern
kill_pattern() {
    local pattern=$1
    local name=$2
    
    log_warning "🔍 Checking for $name..."
    
    local pids=$(ps aux | grep -E "$pattern" | grep -v grep | awk '{print $2}' 2>/dev/null || true)
    if [ ! -z "$pids" ]; then
        log_error "⚠️  Found $name processes"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        log_success "✅ Killed $name processes"
    else
        log_success "✅ No $name processes found"
    fi
}

# Main cleanup function
cleanup_processes() {
    log_header "🧹 Cleaning up existing processes..."
    echo "========================================"
    
    # Kill port-specific processes
    kill_port 5173 "Vite default"
    kill_port 5174 "Vite alternative"
    kill_port 3000 "Dev server"
    kill_port 4173 "Vite preview"
    
    # Kill pattern-specific processes
    kill_pattern "vite.*dev|npm.*dev|yarn.*dev" "Dev server"
    kill_pattern "esbuild" "ESBuild"
    
    log_success "🎉 Cleanup completed!"
    echo ""
}

# Check if we should only cleanup
if [[ "$1" == "--cleanup-only" || "$1" == "-c" ]]; then
    cleanup_processes
    exit 0
fi

# Full start process
log_header "🚀 Frontend Development Server"
echo "================================"

# Cleanup first
cleanup_processes

# Navigate to frontend directory if not already there
if [[ ! -f "package.json" ]]; then
    log_error "❌ package.json not found in current directory"
    log_info "Please run this script from the frontend directory"
    exit 1
fi

# Check node_modules
if [[ ! -d "node_modules" ]]; then
    log_warning "📦 Installing dependencies..."
    npm install
else
    log_success "✅ Dependencies found"
fi

# Start development server
log_info "🚀 Starting development server..."
log_info "   URL: http://localhost:5173"
log_info "   Press Ctrl+C to stop"
echo ""

# Start the server
exec npm run dev