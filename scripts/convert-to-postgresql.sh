#!/bin/bash

# PostgreSQL 호환성을 위한 Go 코드 변환 스크립트

set -euo pipefail

echo "🔄 Converting Go code for PostgreSQL compatibility..."

# 백엔드 디렉토리로 이동
cd "$(dirname "$0")/../backend"

# repository 파일들에서 ? 플레이스홀더를 $n으로 변환
echo "📝 Converting placeholders in repository files..."

# article.go 변환
echo "Converting article.go..."
python3 << 'EOF'
import re

def convert_placeholders(content):
    lines = content.split('\n')
    converted_lines = []
    
    for line in lines:
        if '?' in line and ('INSERT' in line.upper() or 'SELECT' in line.upper() or 'UPDATE' in line.upper() or 'DELETE' in line.upper() or 'VALUES' in line.upper() or 'WHERE' in line.upper()):
            # ? 플레이스홀더를 $1, $2, ... 로 변환
            count = 1
            while '?' in line:
                line = line.replace('?', f'${count}', 1)
                count += 1
        converted_lines.append(line)
    
    return '\n'.join(converted_lines)

# article.go 변환
with open('internal/repository/article.go', 'r') as f:
    content = f.read()

converted = convert_placeholders(content)

with open('internal/repository/article.go', 'w') as f:
    f.write(converted)

print("✅ article.go converted")
EOF

# user.go 변환
echo "Converting user.go..."
python3 << 'EOF'
import re

def convert_placeholders(content):
    lines = content.split('\n')
    converted_lines = []
    
    for line in lines:
        if '?' in line and ('INSERT' in line.upper() or 'SELECT' in line.upper() or 'UPDATE' in line.upper() or 'DELETE' in line.upper() or 'VALUES' in line.upper() or 'WHERE' in line.upper()):
            # ? 플레이스홀더를 $1, $2, ... 로 변환
            count = 1
            while '?' in line:
                line = line.replace('?', f'${count}', 1)
                count += 1
        converted_lines.append(line)
    
    return '\n'.join(converted_lines)

# user.go 변환
with open('internal/repository/user.go', 'r') as f:
    content = f.read()

converted = convert_placeholders(content)

with open('internal/repository/user.go', 'w') as f:
    f.write(converted)

print("✅ user.go converted")
EOF

# comment.go 변환  
echo "Converting comment.go..."
python3 << 'EOF'
import re

def convert_placeholders(content):
    lines = content.split('\n')
    converted_lines = []
    
    for line in lines:
        if '?' in line and ('INSERT' in line.upper() or 'SELECT' in line.upper() or 'UPDATE' in line.upper() or 'DELETE' in line.upper() or 'VALUES' in line.upper() or 'WHERE' in line.upper()):
            # ? 플레이스홀더를 $1, $2, ... 로 변환
            count = 1
            while '?' in line:
                line = line.replace('?', f'${count}', 1)
                count += 1
        converted_lines.append(line)
    
    return '\n'.join(converted_lines)

# comment.go 변환
with open('internal/repository/comment.go', 'r') as f:
    content = f.read()

converted = convert_placeholders(content)

with open('internal/repository/comment.go', 'w') as f:
    f.write(converted)

print("✅ comment.go converted")
EOF

# tag.go 변환
echo "Converting tag.go..."
python3 << 'EOF'
import re

def convert_placeholders(content):
    lines = content.split('\n')
    converted_lines = []
    
    for line in lines:
        if '?' in line and ('INSERT' in line.upper() or 'SELECT' in line.upper() or 'UPDATE' in line.upper() or 'DELETE' in line.upper() or 'VALUES' in line.upper() or 'WHERE' in line.upper()):
            # ? 플레이스홀더를 $1, $2, ... 로 변환
            count = 1
            while '?' in line:
                line = line.replace('?', f'${count}', 1)
                count += 1
        converted_lines.append(line)
    
    return '\n'.join(converted_lines)

# tag.go 변환
with open('internal/repository/tag.go', 'r') as f:
    content = f.read()

converted = convert_placeholders(content)

with open('internal/repository/tag.go', 'w') as f:
    f.write(converted)

print("✅ tag.go converted")
EOF

echo "✅ PostgreSQL conversion completed!"
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