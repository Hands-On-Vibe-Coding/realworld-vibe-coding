#!/bin/bash

# SQLite 마이그레이션으로 변환하는 스크립트

set -euo pipefail

echo "🔄 Converting migration files to SQLite syntax..."

# 백엔드 디렉토리로 이동
cd "$(dirname "$0")/../backend/migrations"

# Python script to convert PostgreSQL migrations to SQLite
python3 << 'EOF'
import os
import re

def convert_migration_to_sqlite(content, filename):
    # SERIAL PRIMARY KEY -> INTEGER PRIMARY KEY (SQLite autoincrement)
    content = re.sub(r'SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY', content, flags=re.IGNORECASE)
    
    # TIMESTAMP -> DATETIME
    content = re.sub(r'TIMESTAMP', 'DATETIME', content, flags=re.IGNORECASE)
    
    # VARCHAR -> TEXT (SQLite doesn't have VARCHAR)
    content = re.sub(r'VARCHAR\(\d+\)', 'TEXT', content, flags=re.IGNORECASE)
    
    # Remove PostgreSQL-specific function and trigger syntax
    # Remove function definition
    content = re.sub(r'-- Create function.*?language \'plpgsql\';', '', content, flags=re.DOTALL)
    
    # Remove trigger definitions
    content = re.sub(r'-- Create trigger.*?EXECUTE FUNCTION update_updated_at_column\(\);', '', content, flags=re.DOTALL)
    content = re.sub(r'DROP TRIGGER.*?ON \w+;', '', content, flags=re.DOTALL)
    
    # Clean up extra whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    # Add SQLite-specific trigger for updated_at (if the file contains updated_at)
    if 'updated_at' in content and 'users' in filename:
        content += '''
-- SQLite trigger for updating updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
    AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
'''
    elif 'updated_at' in content and 'articles' in filename:
        content += '''
-- SQLite trigger for updating updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_articles_updated_at
    AFTER UPDATE ON articles
BEGIN
    UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
'''
    elif 'updated_at' in content and 'comments' in filename:
        content += '''
-- SQLite trigger for updating updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_comments_updated_at
    AFTER UPDATE ON comments
BEGIN
    UPDATE comments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
'''
    
    return content

# Convert all migration files
for filename in os.listdir('.'):
    if filename.endswith('.sql'):
        print(f"Converting {filename}...")
        with open(filename, 'r') as f:
            content = f.read()
        
        converted = convert_migration_to_sqlite(content, filename)
        
        with open(filename, 'w') as f:
            f.write(converted)
        
        print(f"✅ {filename} converted")

print("✅ All migration files converted to SQLite syntax!")
EOF

echo "✅ Migration conversion completed!"