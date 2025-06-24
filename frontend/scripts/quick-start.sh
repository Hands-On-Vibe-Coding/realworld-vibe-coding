#!/bin/bash

# Quick Frontend Start Script
# 가장 간단한 버전 - 빠른 정리 후 서버 시작

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Quick Frontend Start${NC}"

# Quick cleanup
echo -e "${YELLOW}🧹 Quick cleanup...${NC}"
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:5174 2>/dev/null | xargs kill -9 2>/dev/null || true
ps aux | grep -E "vite|npm.*dev" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true

sleep 1

# Start server
echo -e "${GREEN}✅ Starting dev server...${NC}"
exec npm run dev