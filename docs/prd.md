# RealWorld 바이브코딩 구현 - PRD (Product Requirements Document)

## 1. 프로젝트 개요

### 1.1 프로젝트 목표
RealWorld 애플리케이션을 바이브코딩 방식으로 구현하여 완전한 풀스택 애플리케이션 구축

### 1.2 프로젝트 범위
- **Frontend**: React + Vite 기반 SPA
- **Backend**: Go + 표준 net/http 기반 REST API
- **Database**: SQLite (개발용) + PostgreSQL (운영용)
- **인증**: JWT 기반 사용자 인증
- **배포**: AWS ECS + Fargate를 통한 컨테이너 배포

### 1.3 성공 지표
- RealWorld API 스펙 100% 준수
- 테스트 커버리지 80% 이상
- 초기 로딩 시간 3초 이하
- 모바일 반응형 지원

## 2. 기능 요구사항

### 2.1 사용자 관리 및 인증
#### 2.1.1 회원가입
- **기능**: 이메일, 사용자명, 비밀번호 기반 회원가입
- **검증**: 이메일 중복 확인, 사용자명 중복 확인
- **보안**: JWT 토큰 발행

#### 2.1.2 로그인
- **기능**: 이메일/사용자명과 비밀번호를 통한 로그인
- **검증**: 입력값 검증
- **보안**: JWT 토큰 발행

#### 2.1.3 프로필 관리
- **조회**: 다른 사용자 프로필 정보 조회
- **정보**: 이메일, 사용자명, 프로필, 바이오, 이미지 정보
- **팔로우**: 다른 사용자 팔로우/언팔로우

### 2.2 게시글 관리
#### 2.2.1 게시글 CRUD
- **작성**: 제목, 설명, 본문, 태그를 포함한 게시글 작성
- **조회**: 개별 게시글 상세 조회
- **정보**: 게시글 작성 정보 (작성자)
- **수정**: 게시글 수정 (작성자)

#### 2.2.2 게시글 목록
- **글로벌 피드**: 모든 게시글 목록 (최신순)
- **개인 피드**: 팔로우한 사용자의 게시글 목록
- **태그 필터**: 특정 태그로 필터링된 게시글 목록
- **페이지네이션**: 20개씩 페이지 단위로 조회

#### 2.2.3 게시글 상호작용
- **좋아요**: 게시글 좋아요/취소
- **좋아요 수**: 게시글별 좋아요 개수 표시

### 2.3 댓글 시스템
#### 2.3.1 댓글 CRUD
- **작성**: 게시글에 댓글 작성
- **조회**: 게시글의 댓글 목록 조회
- **삭제**: 댓글 삭제 (작성자)

### 2.4 태그 시스템
- **태그 목록**: 자주 사용된 태그의 목록
- **태그 필터**: 태그별 게시글 필터링

## 3. 기술 스택 및 아키텍처

### 3.1 Frontend 기술 스택
```
- Framework: React with Vite
- Language: TypeScript
- Router: Tanstack Router
- State Management: Tanstack Query (서버 상태), Zustand (클라이언트 상태)
- UI Library: Mantine UI
- Form Handling: Mantine Form + Zod validation
- Styling: Mantine's CSS-in-JS + Custom CSS
- Icons: Tabler Icons (Mantine 기본 아이콘 세트)
- Notifications: Mantine Notifications
- Testing: Vitest + React Testing Library
```

### 3.2 Backend 기술 스택
```
- Language: Go 1.21+
- HTTP Server: 표준 net/http
- Database: SQLite (개발용), PostgreSQL (운영용)
- Database Access: 순수 SQL (ORM 지양)
- Authentication: JWT
- Validation: Go 표준 validation
- Testing: Go 표준 테스트 + testify
```

### 3.3 개발 환경
```
- 프로젝트 관리: Makefile
- 컨테이너: Docker
- CI/CD: GitHub Actions
- 배포: AWS ECS + Fargate
- 인프라: AWS CDK (TypeScript)
- 모니터링: CloudWatch + X-Ray
```

## 4. API 설계

### 4.1 사용자 API
```
POST /api/users/login
POST /api/users
GET /api/user
PUT /api/user
```

### 4.2 프로필 API
```
GET /api/profiles/:username
POST /api/profiles/:username/follow
DELETE /api/profiles/:username/follow
```

### 4.3 게시글 API
```
GET /api/articles
GET /api/articles/feed
GET /api/articles/:slug
POST /api/articles
PUT /api/articles/:slug
DELETE /api/articles/:slug
POST /api/articles/:slug/favorite
DELETE /api/articles/:slug/favorite
```

### 4.4 댓글 API
```
GET /api/articles/:slug/comments
POST /api/articles/:slug/comments
DELETE /api/articles/:slug/comments/:id
```

### 4.5 태그 API
```
GET /api/tags
```

## 5. 데이터베이스 설계

### 5.1 사용자 테이블 (users)
```sql
id (Primary Key)
email (Unique)
username (Unique)
password_hash
bio
image
created_at
updated_at
```

### 5.2 게시글 테이블 (articles)
```sql
id (Primary Key)
slug (Unique)
title
description
body
author_id (Foreign Key -> users.id)
created_at
updated_at
```

### 5.3 태그 테이블 (tags)
```sql
id (Primary Key)
name (Unique)
```

### 5.4 게시글-태그 관계 테이블 (article_tags)
```sql
article_id (Foreign Key -> articles.id)
tag_id (Foreign Key -> tags.id)
```

### 5.5 팔로우 관계 테이블 (follows)
```sql
follower_id (Foreign Key -> users.id)
followed_id (Foreign Key -> users.id)
created_at
```

### 5.6 좋아요 테이블 (favorites)
```sql
user_id (Foreign Key -> users.id)
article_id (Foreign Key -> articles.id)
created_at
```

### 5.7 댓글 테이블 (comments)
```sql
id (Primary Key)
body
author_id (Foreign Key -> users.id)
article_id (Foreign Key -> articles.id)
created_at
updated_at
```

## 6. 프론트엔드 설계

### 6.1 페이지 구조
```
/ (홈페이지 - 글로벌 피드)
/login (로그인)
/register (회원가입)
/settings (설정)
/profile/:username (프로필)
/editor (게시글 작성)
/editor/:slug (게시글 수정)
/article/:slug (게시글 상세)
```

### 6.2 컴포넌트 구조
```
components/
├── Layout/
│   ├── Header.tsx (Mantine Header, Navbar 사용)
│   ├── Footer.tsx (Mantine Footer 사용)
│   └── AppShell.tsx (Mantine AppShell 사용)
├── Article/
│   ├── ArticleList.tsx (Mantine Grid, Card 사용)
│   ├── ArticlePreview.tsx (Mantine Card, Badge 사용)
│   ├── ArticleDetail.tsx (Mantine Container, TypographyStylesProvider)
│   └── ArticleForm.tsx (Mantine Form, TextInput, Textarea)
├── Comment/
│   ├── CommentList.tsx (Mantine Stack 사용)
│   ├── CommentForm.tsx (Mantine Form, Textarea, Button)
│   └── CommentItem.tsx (Mantine Paper, Avatar, Text)
├── Profile/
│   ├── ProfileInfo.tsx (Mantine Avatar, Text, Group)
│   └── FollowButton.tsx (Mantine Button, ActionIcon)
├── Common/
│   ├── Loading.tsx (Mantine Loader, LoadingOverlay)
│   ├── ErrorBoundary.tsx (Mantine Alert, Notification)
│   ├── Pagination.tsx (Mantine Pagination)
│   └── TagsList.tsx (Mantine Badge, Group)
└── forms/
    ├── LoginForm.tsx (Mantine Form, PasswordInput)
    ├── RegisterForm.tsx (Mantine Form, TextInput)
    └── SettingsForm.tsx (Mantine Form, FileInput)
```

### 6.3 UI 테마 및 스타일링 (Mantine)
```typescript
// theme/index.ts
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'green', // RealWorld 브랜드 컬러
  colors: {
    brand: [
      '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc',
      '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1',
      '#075985', '#0c4a6e'
    ]
  },
  components: {
    Button: Button.extend({
      defaultProps: {
        size: 'md',
        radius: 'md'
      }
    }),
    Card: Card.extend({
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        withBorder: true
      }
    })
  }
});

// App.tsx에서 MantineProvider 적용
<MantineProvider theme={theme}>
  <Notifications />
  <Router />
</MantineProvider>
```

### 6.4 상태 관리 (Zustand + TanStack Query)
```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: User) => void
}

// Mantine Notifications와 연동
import { notifications } from '@mantine/notifications';

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => {
    set({ user, token });
    notifications.show({
      title: '로그인 성공',
      message: `환영합니다, ${user.username}님!`,
      color: 'green'
    });
  },
  logout: () => {
    set({ user: null, token: null });
    notifications.show({
      title: '로그아웃',
      message: '안전하게 로그아웃되었습니다.',
      color: 'blue'
    });
  }
}));
```

## 7. 백엔드 설계

### 7.1 프로젝트 구조
```
backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   ├── handler/
│   ├── middleware/
│   ├── model/
│   ├── repository/
│   ├── service/
│   └── utils/
├── pkg/
├── migrations/
├── go.mod
├── go.sum
└── Makefile
```

### 7.2 핸들러 구조
```go
// internal/handler/user.go
type UserHandler struct {
    userService service.UserService
}

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) error
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) error
func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) error
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) error
```

### 7.3 미들웨어
```go
// JWT 인증 미들웨어
func JWTMiddleware() http.Handler

// CORS 미들웨어
func CORSMiddleware() http.Handler

// 로깅 미들웨어
func LoggingMiddleware() http.Handler
```

## 8. 개발 프로세스

### 8.1 개발 단계
1. **Phase 1 (2주)**: 기본 CRUD 및 인증 구현
2. **Phase 2 (1주)**: 고급 기능 (팔로우, 좋아요) 구현
3. **Phase 3 (1주)**: UI/UX 개선 및 최적화
4. **Phase 4 (1주)**: 테스트 작성 및 배포

### 8.2 바이브코딩 적용
- **빠른 프로토타이핑**: MVP 기능 우선 구현
- **반복적 개선**: 기능별 점진적 완성도 향상
- **실시간 피드백**: TDD 적용 및 실시간 테스트
- **문서화**: 코드와 함께 API 문서 작성 병행

### 8.3 품질 관리
- **코드 리뷰**: 모든 PR에 대한 코드 리뷰
- **자동 테스트**: CI/CD 파이프라인에서 자동 테스트 실행
- **성능 모니터링**: 배포 후 및 개발 중 성능 모니터링

## 9. 배포 및 운영

### 9.1 배포 환경
- **개발 환경**: 로컬 Docker 환경
- **스테이징 환경**: AWS ECS 테스트 환경
- **프로덕션 환경**: AWS ECS 운영 환경

### 9.2 CI/CD 파이프라인
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    - Run backend tests
    - Run frontend tests
    - Docker 이미지 빌드
  deploy:
    - ECR에 이미지 푸시
    - ECS 서비스 업데이트
```

### 9.3 모니터링
- **서버 모니터링**: CloudWatch를 통한 서버 모니터링
- **앱 성능**: 애플리케이션 성능 로깅 및 추적
- **사용 통계**: 배포 후, 사용량, 개발 통계

## 10. 검증 기준

### 10.1 기능적 검증 기준
- [ ] 모든 RealWorld API 스펙의 구현
- [ ] 프론트엔드 모든 페이지 구현
- [ ] 사용자 시나리오 테스트 통과
- [ ] 모바일 반응형 정상 동작

### 10.2 기술적 검증 기준
- [ ] 백엔드 테스트 커버리지 80% 이상
- [ ] 프론트엔드 테스트 커버리지 80% 이상
- [ ] 성능 요구사항 달성 (로딩 시간 3초 이하)
- [ ] 접근성 AA 등급 달성

### 10.3 운영 검증 기준
- [ ] CI/CD 파이프라인 구축
- [ ] 프로덕션 환경 배포
- [ ] 모니터링 시스템 구축
- [ ] 문서화 완료 (API 문서, 사용자 가이드)

---

*이 PRD는 RealWorld 바이브코딩 구현 프로젝트의 상세 요구사항을 정의합니다.*