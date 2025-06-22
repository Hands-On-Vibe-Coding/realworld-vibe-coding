# RealWorld 바이브 코딩 구현 - PRD (제품 요구사항 문서)

## 1. 프로젝트 개요

### 1.1 프로젝트 목표
바이브 코딩 방법론을 사용하여 완전한 풀스택 애플리케이션을 구축하는 RealWorld 애플리케이션 구현

### 1.2 프로젝트 범위
- **프론트엔드**: React + Vite 기반 SPA
- **백엔드**: Go + 표준 net/http 기반 REST API
- **데이터베이스**: SQLite (개발) + PostgreSQL (운영)
- **인증**: JWT 기반 사용자 인증
- **배포**: AWS ECS + Fargate를 통한 컨테이너 배포

### 1.3 성공 지표
- RealWorld API 사양 100% 준수
- 80%+ 테스트 커버리지
- 초기 로딩 시간 3초 이하
- 모바일 반응형 디자인 지원

## 2. 기능 요구사항

### 2.1 사용자 관리 및 인증
#### 2.1.1 사용자 등록
- **기능**: 이메일, 사용자명, 비밀번호 기반 등록
- **검증**: 이메일 중복 확인, 사용자명 중복 확인
- **보안**: JWT 토큰 발급

#### 2.1.2 사용자 로그인
- **기능**: 이메일/사용자명과 비밀번호를 통한 로그인
- **검증**: 입력값 유효성 검사
- **보안**: JWT 토큰 발급

#### 2.1.3 프로필 관리
- **조회**: 다른 사용자의 프로필 정보 조회
- **정보**: 이메일, 사용자명, 프로필, 자기소개, 이미지 정보
- **팔로우**: 다른 사용자 팔로우/언팔로우

### 2.2 기사 관리
#### 2.2.1 기사 CRUD
- **생성**: 제목, 설명, 본문, 태그를 포함한 기사 작성
- **조회**: 개별 기사 상세 조회
- **정보**: 기사 작성 정보(작성자)
- **편집**: 기사 편집 (작성자만)

#### 2.2.2 기사 목록
- **글로벌 피드**: 모든 기사 목록 (최신순)
- **개인 피드**: 팔로우한 사용자들의 기사
- **태그 필터**: 특정 태그로 필터링된 기사
- **페이지네이션**: 페이지당 20개 기사

#### 2.2.3 기사 상호작용
- **즐겨찾기**: 기사 즐겨찾기/즐겨찾기 해제
- **즐겨찾기 수**: 기사별 즐겨찾기 수 표시

### 2.3 댓글 시스템
#### 2.3.1 댓글 CRUD
- **생성**: 기사에 댓글 작성
- **조회**: 기사 댓글 목록 조회
- **삭제**: 댓글 삭제 (작성자만)

### 2.4 태그 시스템
- **태그 목록**: 자주 사용되는 태그 목록
- **태그 필터**: 태그별 기사 필터링

## 3. 기술 스택 및 아키텍처

### 3.1 프론트엔드 기술 스택
```
- 프레임워크: React with Vite
- 언어: TypeScript
- 라우터: Tanstack Router
- 상태 관리: Tanstack Query (서버 상태), Zustand (클라이언트 상태)
- UI 라이브러리: Mantine UI
- 폼 처리: Mantine Form + Zod 검증
- 스타일링: Mantine의 CSS-in-JS + 커스텀 CSS
- 아이콘: Tabler Icons (Mantine 기본 아이콘 세트)
- 알림: Mantine Notifications
- 테스트: Vitest + React Testing Library
```

### 3.2 백엔드 기술 스택
```
- 언어: Go 1.21+
- HTTP 서버: 표준 net/http
- 데이터베이스: SQLite (개발), PostgreSQL (운영)
- 데이터베이스 접근: Pure SQL (ORM 사용 안함)
- 인증: JWT
- 검증: Go 표준 검증
- 테스트: Go 표준 테스트 + testify
```

### 3.3 개발 환경
```
- 프로젝트 관리: Makefile
- 컨테이너화: Docker
- CI/CD: GitHub Actions
- 프론트엔드 배포: GitHub Pages
- 백엔드 배포: AWS ECS + Fargate
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

### 4.3 기사 API
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

### 5.2 기사 테이블 (articles)
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

### 5.4 기사-태그 관계 테이블 (article_tags)
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

### 5.6 즐겨찾기 테이블 (favorites)
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
/ (홈 - 글로벌 피드)
/login (로그인)
/register (회원가입)
/settings (설정)
/profile/:username (프로필)
/editor (기사 작성)
/editor/:slug (기사 편집)
/article/:slug (기사 상세)
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
│   ├── ArticleDetail.tsx (Mantine Container, TypographyStylesProvider 사용)
│   └── ArticleForm.tsx (Mantine Form, TextInput, Textarea 사용)
├── Comment/
│   ├── CommentList.tsx (Mantine Stack 사용)
│   ├── CommentForm.tsx (Mantine Form, Textarea, Button 사용)
│   └── CommentItem.tsx (Mantine Paper, Avatar, Text 사용)
├── Profile/
│   ├── ProfileInfo.tsx (Mantine Avatar, Text, Group 사용)
│   └── FollowButton.tsx (Mantine Button, ActionIcon 사용)
├── Common/
│   ├── Loading.tsx (Mantine Loader, LoadingOverlay 사용)
│   ├── ErrorBoundary.tsx (Mantine Alert, Notification 사용)
│   ├── Pagination.tsx (Mantine Pagination 사용)
│   └── TagsList.tsx (Mantine Badge, Group 사용)
└── forms/
    ├── LoginForm.tsx (Mantine Form, PasswordInput 사용)
    ├── RegisterForm.tsx (Mantine Form, TextInput 사용)
    └── SettingsForm.tsx (Mantine Form, FileInput 사용)
```

### 6.3 UI 테마 및 스타일링 (Mantine)
```typescript
// theme/index.ts
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'green', // RealWorld 브랜드 색상
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

// Mantine Notifications와 통합
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
1. **1단계**: 기본 CRUD 및 인증 구현
2. **2단계**: 고급 기능(팔로우, 즐겨찾기) 구현
3. **3단계**: UI/UX 개선 및 최적화
4. **4단계**: 테스트 작성 및 배포

### 8.2 바이브 코딩 적용
- **빠른 프로토타이핑**: MVP 기능 우선 구현
- **반복적 개선**: 기능 완성도의 점진적 향상
- **실시간 피드백**: TDD 적용 및 실시간 테스트
- **문서화**: 코드 개발과 동시 API 문서화

### 8.3 품질 관리
- **코드 리뷰**: 모든 PR에 대한 코드 리뷰
- **자동화 테스트**: CI/CD 파이프라인에서 자동 테스트 실행
- **성능 모니터링**: 개발 중 및 배포 후 성능 모니터링

## 9. 배포 및 운영

### 9.1 배포 환경
- **개발 환경**: 로컬 개발 서버
- **프론트엔드 운영**: GitHub Pages 자동 배포
- **백엔드 스테이징**: AWS ECS 테스트 환경
- **백엔드 운영**: AWS ECS 운영 환경

### 9.2 CI/CD 파이프라인
```yaml
# 프론트엔드 파이프라인 (.github/workflows/frontend-deploy.yml)
name: Deploy Frontend to GitHub Pages
on:
  push:
    branches: [main]
    paths: ['frontend/**']
jobs:
  build:
    - 프론트엔드 테스트 실행
    - 린팅 및 타입 검사 실행
    - GitHub Pages용 빌드
    - GitHub Pages 배포

# 백엔드 파이프라인 (.github/workflows/backend-deploy.yml)
name: Deploy Backend to AWS
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  test:
    - 백엔드 테스트 실행
    - Docker 이미지 빌드
  deploy:
    - ECR에 이미지 푸시
    - ECS 서비스 업데이트
```

### 9.3 모니터링
- **서버 모니터링**: CloudWatch를 통한 서버 모니터링
- **애플리케이션 성능**: 애플리케이션 성능 로깅 및 추적
- **사용 통계**: 배포 후 사용량 및 개발 통계

## 10. 검증 기준

### 10.1 기능 검증 기준
- [ ] RealWorld API 사양 모든 항목 구현
- [ ] 모든 프론트엔드 페이지 구현
- [ ] 사용자 시나리오 테스트 통과
- [ ] 모바일 반응형 디자인 정상 동작

### 10.2 기술 검증 기준
- [ ] 백엔드 테스트 커버리지 80% 이상
- [ ] 프론트엔드 테스트 커버리지 80% 이상
- [ ] 성능 요구사항 달성 (로딩 시간 3초 이하)
- [ ] 접근성 AA 등급 달성

### 10.3 운영 검증 기준
- [ ] CI/CD 파이프라인 구축
- [ ] 운영 환경 배포
- [ ] 모니터링 시스템 구축
- [ ] 문서화 완료 (API 문서, 사용자 가이드)

---

*이 PRD는 RealWorld 바이브 코딩 구현 프로젝트의 상세 요구사항을 정의합니다.*