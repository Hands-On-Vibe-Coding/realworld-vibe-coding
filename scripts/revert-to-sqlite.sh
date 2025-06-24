#!/bin/bash

# SQLite 문법으로 되돌리는 스크립트

set -euo pipefail

echo "🔄 Converting Go code back to SQLite compatibility..."

# 백엔드 디렉토리로 이동
cd "$(dirname "$0")/../backend"

# repository 파일들에서 $n 플레이스홀더를 ?로 변환
echo "📝 Converting placeholders in repository files..."

# Python script to convert PostgreSQL syntax back to SQLite
python3 << 'EOF'
import re
import os

def convert_postgresql_to_sqlite(content):
    # $1, $2, $3... -> ?
    content = re.sub(r'\$\d+', '?', content)
    return content

# Convert all repository files
repo_files = ['article.go', 'user.go', 'comment.go', 'tag.go']

for filename in repo_files:
    filepath = f'internal/repository/{filename}'
    if os.path.exists(filepath):
        print(f"Converting {filename}...")
        with open(filepath, 'r') as f:
            content = f.read()
        
        converted = convert_postgresql_to_sqlite(content)
        
        with open(filepath, 'w') as f:
            f.write(converted)
        
        print(f"✅ {filename} converted")
    else:
        print(f"⚠️ {filename} not found")

print("✅ Repository files converted to SQLite syntax!")
EOF

echo "✅ SQLite conversion completed!"
echo "🧪 Running tests to verify conversion..."

# Go 파일 포맷 정리
go fmt ./...

# 빌드 테스트
if go build ./...; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed - please check for syntax errors"
    exit 1
fi