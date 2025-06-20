# TASK-002: 데이터베이스 설계 및 마이그레이션

**Status**: `pending`
**Priority**: `high`
**Estimated Time**: 3-4 hours
**Sprint**: Sprint 1

## Description
RealWorld 애플리케이션의 데이터베이스 스키마를 설계하고 SQLite 개발용 데이터베이스를 구현합니다.

## Background
사용자, 게시글, 댓글, 태그, 팔로우, 좋아요 등의 데이터를 저장하기 위한 데이터베이스 스키마가 필요합니다. 개발 단계에서는 SQLite를 사용하여 빠른 프로토타이핑을 지원합니다.

## Acceptance Criteria
- [ ] 데이터베이스 스키마 설계 완료
- [ ] SQLite 마이그레이션 스크립트 작성
- [ ] 데이터베이스 연결 설정
- [ ] 기본 테이블 생성 확인
- [ ] 테스트 데이터 시드 스크립트 작성

## Technical Details

### 데이터베이스 스키마

#### Users 테이블
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    image VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Articles 테이블
```sql
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    body TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tags 테이블
```sql
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL
);
```

#### Article_Tags 테이블
```sql
CREATE TABLE article_tags (
    article_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### Follows 테이블
```sql
CREATE TABLE follows (
    follower_id INTEGER NOT NULL,
    followed_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followed_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Favorites 테이블
```sql
CREATE TABLE favorites (
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);
```

#### Comments 테이블
```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);
```

### 마이그레이션 파일 구조
```
backend/migrations/
├── 001_create_users.sql
├── 002_create_articles.sql
├── 003_create_tags.sql
├── 004_create_article_tags.sql
├── 005_create_follows.sql
├── 006_create_favorites.sql
└── 007_create_comments.sql
```

### 데이터베이스 설정
```go
// internal/config/database.go
package config

import (
    "database/sql"
    _ "github.com/mattn/go-sqlite3"
)

func InitDB() (*sql.DB, error) {
    db, err := sql.Open("sqlite3", "./realworld.db")
    if err != nil {
        return nil, err
    }
    
    return db, nil
}
```

## Dependencies
- TASK-001: 프로젝트 구조 설정

## Notes
- SQLite를 사용하여 빠른 개발 환경 구축
- 운영 환경에서는 PostgreSQL로 전환 예정
- 인덱스 최적화는 추후 성능 개선 단계에서 적용

## Definition of Done
- [ ] 모든 테이블 생성 SQL 스크립트 작성
- [ ] 마이그레이션 실행 스크립트 구현
- [ ] 데이터베이스 연결 설정 구현
- [ ] 기본 테이블 생성 확인
- [ ] 테스트 데이터 시드 스크립트 작성
- [ ] 데이터베이스 초기화 명령어 Makefile 추가