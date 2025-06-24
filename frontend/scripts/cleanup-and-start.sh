#!/bin/bash

# Frontend cleanup and start script
# This script kills existing frontend processes and starts a fresh development server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Frontend Development Server Cleanup & Start${NC}"
echo "================================================"

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    local process_name=$2
    
    echo -e "${YELLOW}🔍 Checking for processes on port ${port}...${NC}"
    
    # Find processes using the port
    local pids=$(lsof -ti:${port} 2>/dev/null || true)
    
    if [ ! -z "$pids" ]; then
        echo -e "${RED}⚠️  Found ${process_name} processes on port ${port}:${NC}"
        lsof -i:${port} || true
        
        echo -e "${YELLOW}🔥 Killing processes on port ${port}...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        
        # Wait a moment for processes to die
        sleep 2
        
        # Check if any processes are still running
        local remaining=$(lsof -ti:${port} 2>/dev/null || true)
        if [ ! -z "$remaining" ]; then
            echo -e "${RED}❌ Some processes are still running on port ${port}${NC}"
            lsof -i:${port} || true
        else
            echo -e "${GREEN}✅ Successfully killed all processes on port ${port}${NC}"
        fi
    else
        echo -e "${GREEN}✅ No processes found on port ${port}${NC}"
    fi
}

# Function to kill node processes by command pattern
kill_node_processes() {
    local pattern=$1
    local description=$2
    
    echo -e "${YELLOW}🔍 Checking for ${description}...${NC}"
    
    # Find node processes matching the pattern
    local pids=$(ps aux | grep -E "$pattern" | grep -v grep | awk '{print $2}' || true)
    
    if [ ! -z "$pids" ]; then
        echo -e "${RED}⚠️  Found ${description}:${NC}"
        ps aux | grep -E "$pattern" | grep -v grep || true
        
        echo -e "${YELLOW}🔥 Killing ${description}...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        
        echo -e "${GREEN}✅ Successfully killed ${description}${NC}"
    else
        echo -e "${GREEN}✅ No ${description} found${NC}"
    fi
}

# Kill processes on common Vite dev server ports
kill_port_processes 5173 "Vite (5173)"
kill_port_processes 5174 "Vite (5174)"
kill_port_processes 3000 "Alternative dev server (3000)"
kill_port_processes 4173 "Vite preview (4173)"

# Kill node processes that might be running Vite
kill_node_processes "vite|npm.*dev|yarn.*dev" "Vite/npm dev processes"

# Kill any hanging esbuild processes
kill_node_processes "esbuild" "esbuild processes"

echo ""
echo -e "${BLUE}🧹 Cleanup completed!${NC}"
echo ""

# Navigate to frontend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}📁 Changing to frontend directory: ${FRONTEND_DIR}${NC}"
cd "$FRONTEND_DIR"

# Clean npm cache if needed
echo -e "${YELLOW}🧽 Checking node_modules and cache...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 node_modules not found, installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ node_modules found${NC}"
fi

# Start the development server
echo ""
echo -e "${GREEN}🚀 Starting frontend development server...${NC}"
echo -e "${BLUE}   URL: http://localhost:5173${NC}"
echo -e "${BLUE}   Press Ctrl+C to stop${NC}"
echo ""

# Start the dev server
npm run dev