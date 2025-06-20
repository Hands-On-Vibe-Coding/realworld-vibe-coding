# RealWorld 바이브코딩 구현 - 실행 계획

## 프로젝트 개요
RealWorld 애플리케이션을 Go 백엔드와 React 프론트엔드로 구현하는 바이브코딩 프로젝트

## 실행 단계별 계획

### Phase 1: 프로젝트 기반 구축 (2-3일)

#### TASK-001: 프로젝트 구조 설정
- 백엔드 Go 프로젝트 구조 생성
- 프론트엔드 React + Vite 프로젝트 구조 생성
- Makefile 및 개발 환경 설정
- **Dependencies**: None
- **Priority**: High

#### TASK-002: 데이터베이스 설계 및 마이그레이션
- SQLite 개발용 데이터베이스 스키마 구현
- 테이블 생성 SQL 스크립트 작성
- **Dependencies**: TASK-001
- **Priority**: High

#### TASK-003: 기본 HTTP 서버 및 라우팅 설정
- Go 표준 net/http 서버 구현
- 기본 미들웨어 (CORS, 로깅) 설정
- 라우팅 구조 설정
- **Dependencies**: TASK-001, TASK-002
- **Priority**: High

### Phase 2: 사용자 인증 시스템 (3-4일)

#### TASK-004: 사용자 모델 및 리포지토리 구현
- User 모델 구조체 정의
- 사용자 CRUD 리포지토리 구현
- 비밀번호 해싱 유틸리티 구현
- **Dependencies**: TASK-002
- **Priority**: High

#### TASK-005: JWT 인증 시스템 구현
- JWT 토큰 생성/검증 유틸리티
- JWT 미들웨어 구현
- 인증 헬퍼 함수들
- **Dependencies**: TASK-004
- **Priority**: High

#### TASK-006: 사용자 API 핸들러 구현
- POST /api/users (회원가입)
- POST /api/users/login (로그인)
- GET /api/user (현재 사용자 조회)
- PUT /api/user (사용자 정보 수정)
- **Dependencies**: TASK-004, TASK-005
- **Priority**: High

#### TASK-007: 프론트엔드 인증 시스템 구현
- Zustand 인증 스토어 구현
- API 클라이언트 설정 (JWT 토큰 처리)
- 로그인/회원가입 폼 컴포넌트
- **Dependencies**: TASK-006
- **Priority**: High

### Phase 3: 게시글 시스템 (4-5일)

#### TASK-008: 게시글 및 태그 모델 구현
- Article, Tag, ArticleTag 모델 구현
- 게시글 리포지토리 구현 (CRUD)
- 태그 리포지토리 구현
- **Dependencies**: TASK-002
- **Priority**: High

#### TASK-009: 게시글 API 핸들러 구현
- GET /api/articles (게시글 목록)
- GET /api/articles/feed (개인 피드)
- GET /api/articles/:slug (게시글 상세)
- POST /api/articles (게시글 작성)
- PUT /api/articles/:slug (게시글 수정)
- DELETE /api/articles/:slug (게시글 삭제)
- **Dependencies**: TASK-008, TASK-005
- **Priority**: High

#### TASK-010: 게시글 좋아요 시스템 구현
- Favorite 모델 및 리포지토리 구현
- POST /api/articles/:slug/favorite
- DELETE /api/articles/:slug/favorite
- **Dependencies**: TASK-008
- **Priority**: Medium

#### TASK-011: 태그 시스템 구현
- GET /api/tags API 구현
- 태그 기반 게시글 필터링
- **Dependencies**: TASK-008
- **Priority**: Medium

#### TASK-012: 프론트엔드 게시글 시스템 구현
- 게시글 목록 컴포넌트 (ArticleList, ArticlePreview)
- 게시글 상세 컴포넌트 (ArticleDetail)
- 게시글 작성/수정 컴포넌트 (ArticleForm)
- Tanstack Query를 활용한 데이터 페칭
- **Dependencies**: TASK-009, TASK-010, TASK-011
- **Priority**: High

### Phase 4: 댓글 및 프로필 시스템 (2-3일)

#### TASK-013: 댓글 시스템 구현
- Comment 모델 및 리포지토리 구현
- GET /api/articles/:slug/comments
- POST /api/articles/:slug/comments
- DELETE /api/articles/:slug/comments/:id
- **Dependencies**: TASK-008
- **Priority**: Medium

#### TASK-014: 프로필 시스템 구현
- Follow 모델 및 리포지토리 구현
- GET /api/profiles/:username
- POST /api/profiles/:username/follow
- DELETE /api/profiles/:username/follow
- **Dependencies**: TASK-004
- **Priority**: Medium

#### TASK-015: 프론트엔드 댓글 및 프로필 구현
- 댓글 컴포넌트들 (CommentList, CommentForm, CommentItem)
- 프로필 컴포넌트들 (ProfileInfo, FollowButton)
- **Dependencies**: TASK-013, TASK-014
- **Priority**: Medium

### Phase 5: UI/UX 및 라우팅 완성 (2-3일)

#### TASK-016: Tanstack Router 설정 및 페이지 구현
- 라우터 설정 및 보호된 라우트 구현
- 모든 페이지 컴포넌트 구현
- 네비게이션 및 레이아웃 컴포넌트
- **Dependencies**: TASK-007, TASK-012, TASK-015
- **Priority**: High

#### TASK-017: Tailwind CSS 스타일링 및 반응형 디자인
- RealWorld 디자인 시스템 구현
- 모바일 반응형 스타일링
- 로딩 상태 및 에러 상태 UI
- **Dependencies**: TASK-016
- **Priority**: Medium

#### TASK-018: 폼 검증 및 에러 처리
- React Hook Form + Zod 검증 구현
- 통합 에러 핸들링 시스템
- 사용자 피드백 시스템 (토스트, 알림)
- **Dependencies**: TASK-016
- **Priority**: Medium

### Phase 6: 테스트 및 최적화 (3-4일)

#### TASK-019: 백엔드 테스트 구현
- 단위 테스트 (각 핸들러, 서비스, 리포지토리)
- 통합 테스트 (API 엔드포인트)
- 테스트 커버리지 80% 이상 달성
- **Dependencies**: All backend tasks
- **Priority**: High

#### TASK-020: 프론트엔드 테스트 구현
- 컴포넌트 단위 테스트 (Vitest + React Testing Library)
- 통합 테스트 (페이지 레벨)
- E2E 테스트 (주요 사용자 플로우)
- **Dependencies**: All frontend tasks
- **Priority**: High

#### TASK-021: 성능 최적화 및 번들 최적화
- 코드 스플리팅 및 지연 로딩
- 이미지 최적화
- 빌드 최적화
- **Dependencies**: TASK-017
- **Priority**: Medium

### Phase 7: 배포 및 CI/CD (2-3일)

#### TASK-022: Docker 및 개발 환경 구성
- 백엔드 Dockerfile 작성
- 프론트엔드 Dockerfile 작성
- docker-compose 개발 환경 구성
- **Dependencies**: TASK-001
- **Priority**: Medium

#### TASK-023: GitHub Actions CI/CD 파이프라인
- 테스트 자동화 워크플로우
- Docker 이미지 빌드 및 ECR 푸시
- 배포 자동화
- **Dependencies**: TASK-019, TASK-020, TASK-022
- **Priority**: Medium

#### TASK-024: AWS 인프라 구성 (선택사항)
- AWS CDK를 통한 ECS + Fargate 구성
- RDS PostgreSQL 설정
- ALB 및 CloudFront 설정
- **Dependencies**: TASK-022
- **Priority**: Low

## 의존성 관계 요약

```
Phase 1: TASK-001 → TASK-002 → TASK-003
Phase 2: TASK-004 → TASK-005 → TASK-006 → TASK-007
Phase 3: TASK-008 → TASK-009,010,011 → TASK-012
Phase 4: TASK-013,014 → TASK-015
Phase 5: TASK-016 → TASK-017,018
Phase 6: TASK-019,020,021 (병렬 진행 가능)
Phase 7: TASK-022 → TASK-023 → TASK-024
```

## 성공 지표

### 기능적 지표
- [ ] RealWorld API 스펙 100% 준수
- [ ] 모든 사용자 스토리 구현
- [ ] 크로스 브라우저 호환성
- [ ] 모바일 반응형 완성도

### 기술적 지표
- [ ] 테스트 커버리지 80% 이상 (백엔드/프론트엔드)
- [ ] 빌드 시간 30초 이하
- [ ] 초기 로딩 시간 3초 이하
- [ ] 번들 크기 최적화

### 바이브코딩 원칙 적용
- [ ] 빠른 프로토타이핑으로 MVP 우선 구현
- [ ] 반복적 개선을 통한 점진적 완성도 향상
- [ ] 실시간 피드백을 위한 TDD 적용
- [ ] 코드와 함께 실시간 문서 작성

## 예상 소요 시간
- **총 기간**: 4-5주
- **Phase 1**: 2-3일
- **Phase 2**: 3-4일  
- **Phase 3**: 4-5일
- **Phase 4**: 2-3일
- **Phase 5**: 2-3일
- **Phase 6**: 3-4일
- **Phase 7**: 2-3일

*바이브코딩 방식에 따라 핵심 기능 우선 구현 후 점진적 개선 진행*