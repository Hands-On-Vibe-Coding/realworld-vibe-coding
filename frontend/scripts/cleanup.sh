#!/bin/bash

# Frontend Process Cleanup Script
# 프론트엔드 관련 모든 프로세스 정리

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
        lsof -i:$port 2>/dev/null || true
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
        
        # Verify cleanup
        local remaining=$(lsof -ti:$port 2>/dev/null || true)
        if [ ! -z "$remaining" ]; then
            log_error "❌ Some processes still running on port $port"
        else
            log_success "✅ Successfully killed all processes on port $port"
        fi
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
        log_error "⚠️  Found $name processes:"
        ps aux | grep -E "$pattern" | grep -v grep || true
        echo "$pids" | xargs kill -9 2>/dev/null || true
        log_success "✅ Killed $name processes"
    else
        log_success "✅ No $name processes found"
    fi
}

# Show current process status
show_status() {
    log_info "📊 Current process status:"
    echo "=========================="
    
    # Check ports
    echo "Port status:"
    for port in 5173 5174 3000 4173; do
        local count=$(lsof -ti:$port 2>/dev/null | wc -l || echo "0")
        if [ "$count" -gt 0 ]; then
            echo "  Port $port: $count process(es) ❌"
        else
            echo "  Port $port: free ✅"
        fi
    done
    
    # Check processes
    echo ""
    echo "Process status:"
    local vite_count=$(ps aux | grep -E "vite|npm.*dev|yarn.*dev" | grep -v grep | wc -l || echo "0")
    local esbuild_count=$(ps aux | grep -E "esbuild" | grep -v grep | wc -l || echo "0")
    
    echo "  Vite/Dev processes: $vite_count"
    echo "  ESBuild processes: $esbuild_count"
    echo ""
}

# Parse command line arguments
SHOW_STATUS=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --status|-s)
            SHOW_STATUS=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Frontend Process Cleanup Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -s, --status    Show process status before and after cleanup"
            echo "  -v, --verbose   Show detailed output"
            echo "  -h, --help      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0              # Basic cleanup"
            echo "  $0 --status     # Cleanup with status info"
            echo "  $0 --verbose    # Detailed cleanup"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Main execution
log_header "🧹 Frontend Process Cleanup"
echo "============================"

# Show status before cleanup if requested
if [ "$SHOW_STATUS" = true ]; then
    show_status
fi

log_info "Starting cleanup process..."
echo ""

# Kill processes on development ports
kill_port 5173 "Vite default"
kill_port 5174 "Vite alternative" 
kill_port 3000 "Dev server"
kill_port 4173 "Vite preview"
kill_port 8080 "Backend API" # Optional: also clean backend

# Kill development processes by pattern
kill_pattern "vite.*dev|npm.*dev|yarn.*dev" "Development server"
kill_pattern "esbuild" "ESBuild"

# Additional cleanup for stubborn processes
if [ "$VERBOSE" = true ]; then
    log_warning "🔍 Checking for Node.js processes with 'frontend' in path..."
    kill_pattern "node.*frontend.*|.*frontend.*node" "Frontend Node.js"
fi

echo ""
log_success "🎉 Cleanup completed!"

# Show status after cleanup if requested
if [ "$SHOW_STATUS" = true ]; then
    echo ""
    show_status
fi

echo ""
log_info "💡 You can now start the development server with:"
log_info "   npm run dev"
log_info "   or"
log_info "   ./scripts/dev-start.sh"