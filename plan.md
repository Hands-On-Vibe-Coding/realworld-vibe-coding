# RealWorld 바이브코딩 구현 계획

## 프로젝트 개요
RealWorld 애플리케이션을 바이브코딩 방식으로 구현하는 전체 구현 계획입니다.
- **Frontend**: React + Vite + TypeScript + Mantine UI
- **Backend**: Go + SQLite/PostgreSQL + JWT
- **배포**: AWS ECS + Fargate

## 개발 단계별 계획

### Phase 1: 기본 인프라 및 프로젝트 설정 (1주)

#### TASK-01: 백엔드 프로젝트 구조 설정
- **설명**: Go 기반 백엔드 프로젝트 구조 생성
- **의존성**: 없음
- **산출물**: backend/ 디렉토리 구조, go.mod, Makefile
- **예상 시간**: 4시간

#### TASK-02: 프론트엔드 프로젝트 구조 설정  
- **설명**: React + Vite + TypeScript 프로젝트 완성 및 Mantine UI 설정
- **의존성**: 없음
- **산출물**: frontend/ 디렉토리 완전 구성, package.json, vite.config.ts
- **예상 시간**: 4시간

#### TASK-03: 데이터베이스 스키마 및 마이그레이션
- **설명**: SQLite 기반 데이터베이스 스키마 설계 및 마이그레이션 스크립트
- **의존성**: TASK-01
- **산출물**: migrations/ 디렉토리, 테이블 생성 스크립트
- **예상 시간**: 6시간

#### TASK-04: Docker 개발 환경 구축
- **설명**: Docker Compose를 이용한 통합 개발 환경
- **의존성**: TASK-01, TASK-02
- **산출물**: docker-compose.yml, Dockerfile (frontend/backend)
- **예상 시간**: 4시간

### Phase 2: 사용자 인증 시스템 (1주)

#### TASK-05: JWT 인증 미들웨어 구현
- **설명**: Go JWT 토큰 생성/검증 미들웨어
- **의존성**: TASK-01, TASK-03
- **산출물**: internal/middleware/jwt.go, internal/utils/jwt.go
- **예상 시간**: 6시간

#### TASK-06: 사용자 회원가입 API
- **설명**: 사용자 등록 REST API 엔드포인트
- **의존성**: TASK-05
- **산출물**: internal/handler/user.go (Register), internal/service/user.go
- **예상 시간**: 8시간

#### TASK-07: 사용자 로그인 API
- **설명**: 사용자 로그인 REST API 엔드포인트
- **의존성**: TASK-06
- **산출물**: internal/handler/user.go (Login), JWT 토큰 발행
- **예상 시간**: 6시간

#### TASK-08: 프론트엔드 인증 상태 관리
- **설명**: Zustand 기반 인증 스토어 및 API 클라이언트
- **의존성**: TASK-02
- **산출물**: src/stores/authStore.ts, src/lib/api.ts
- **예상 시간**: 6시간

#### TASK-09: 로그인/회원가입 페이지 구현
- **설명**: Mantine Form을 이용한 로그인/회원가입 UI
- **의존성**: TASK-08
- **산출물**: src/pages/Login.tsx, src/pages/Register.tsx
- **예상 시간**: 8시간

### Phase 3: 게시글 관리 시스템 (1.5주)

#### TASK-10: 게시글 CRUD API
- **설명**: 게시글 생성/조회/수정/삭제 REST API
- **의존성**: TASK-05
- **산출물**: internal/handler/article.go, internal/service/article.go
- **예상 시간**: 12시간

#### TASK-11: 게시글 목록 조회 API (페이지네이션)
- **설명**: 게시글 목록 조회 및 페이지네이션 구현
- **의존성**: TASK-10
- **산출물**: 게시글 목록 API, 페이지네이션 로직
- **예상 시간**: 8시간

#### TASK-12: 태그 시스템 API
- **설명**: 태그 관리 및 태그별 게시글 필터링
- **의존성**: TASK-10
- **산출물**: internal/handler/tag.go, 태그 관련 테이블
- **예상 시간**: 6시간

#### TASK-13: 프론트엔드 게시글 상태 관리
- **설명**: TanStack Query를 이용한 게시글 데이터 관리
- **의존성**: TASK-08
- **산출물**: src/hooks/useArticles.ts, 게시글 관련 쿼리
- **예상 시간**: 6시간

#### TASK-14: 게시글 목록 페이지 구현
- **설명**: Mantine Card를 이용한 게시글 목록 UI
- **의존성**: TASK-13
- **산출물**: src/pages/Home.tsx, src/components/Article/ArticleList.tsx
- **예상 시간**: 10시간

#### TASK-15: 게시글 상세 페이지 구현
- **설명**: 게시글 상세 보기 및 수정 UI
- **의존성**: TASK-14
- **산출물**: src/pages/Article.tsx, src/components/Article/ArticleDetail.tsx
- **예상 시간**: 8시간

#### TASK-16: 게시글 작성/수정 페이지 구현
- **설명**: Mantine Form을 이용한 게시글 에디터
- **의존성**: TASK-13
- **산출물**: src/pages/Editor.tsx, src/components/Article/ArticleForm.tsx
- **예상 시간**: 10시간

### Phase 4: 고급 기능 구현 (1주)

#### TASK-17: 댓글 시스템 API
- **설명**: 댓글 생성/조회/삭제 REST API
- **의존성**: TASK-10
- **산출물**: internal/handler/comment.go, internal/service/comment.go
- **예상 시간**: 8시간

#### TASK-18: 사용자 프로필 및 팔로우 API
- **설명**: 사용자 프로필 조회 및 팔로우/언팔로우 API
- **의존성**: TASK-05
- **산출물**: internal/handler/profile.go, 팔로우 관계 테이블
- **예상 시간**: 10시간

#### TASK-19: 게시글 좋아요 API
- **설명**: 게시글 좋아요/취소 API
- **의존성**: TASK-10
- **산출물**: 좋아요 관련 API, favorites 테이블
- **예상 시간**: 6시간

#### TASK-20: 댓글 시스템 프론트엔드 구현
- **설명**: 댓글 목록/작성 UI 구현
- **의존성**: TASK-15, TASK-17
- **산출물**: src/components/Comment/, 댓글 관련 컴포넌트
- **예상 시간**: 8시간

#### TASK-21: 사용자 프로필 페이지 구현
- **설명**: 프로필 조회 및 팔로우 버튼 UI
- **의존성**: TASK-08, TASK-18
- **산출물**: src/pages/Profile.tsx, src/components/Profile/
- **예상 시간**: 8시간

#### TASK-22: 개인 피드 구현
- **설명**: 팔로우한 사용자의 게시글 피드
- **의존성**: TASK-18, TASK-14
- **산출물**: 개인 피드 API 및 UI
- **예상 시간**: 6시간

### Phase 5: 테스트 및 품질 개선 (1주)

#### TASK-23: 백엔드 유닛 테스트 구현
- **설명**: Go 표준 테스트 도구를 이용한 테스트 커버리지 80% 달성
- **의존성**: TASK-01~TASK-22
- **산출물**: *_test.go 파일들, 테스트 커버리지 리포트
- **예상 시간**: 12시간

#### TASK-24: 프론트엔드 테스트 구현
- **설명**: Vitest + React Testing Library를 이용한 컴포넌트 테스트
- **의존성**: TASK-02~TASK-22
- **산출물**: *.test.tsx 파일들, 테스트 커버리지 리포트
- **예상 시간**: 12시간

#### TASK-25: E2E 테스트 구현
- **설명**: Playwright를 이용한 전체 사용자 플로우 테스트
- **의존성**: TASK-23, TASK-24
- **산출물**: e2e/ 테스트 디렉토리, CI/CD 통합
- **예상 시간**: 8시간

### Phase 6: 배포 및 운영 (1주)

#### TASK-26: GitHub Actions CI/CD 파이프라인
- **설명**: 자동화된 테스트 및 배포 파이프라인
- **의존성**: TASK-25
- **산출물**: .github/workflows/, Docker 이미지 자동화
- **예상 시간**: 8시간

#### TASK-27: AWS ECS 인프라 구축
- **설명**: AWS CDK를 이용한 인프라 코드
- **의존성**: TASK-04
- **산출물**: infrastructure/ 디렉토리, CDK 스택
- **예상 시간**: 12시간

#### TASK-28: 프로덕션 배포 및 모니터링
- **설명**: 실제 운영 환경 배포 및 모니터링 설정
- **의존성**: TASK-26, TASK-27
- **산출물**: 운영 환경 배포, CloudWatch 대시보드
- **예상 시간**: 6시간

## 마일스톤 요약

### Sprint 1 (2주): 기본 인프라 + 인증
- TASK-01 ~ TASK-09
- **목표**: 사용자 회원가입/로그인 완성

### Sprint 2 (1.5주): 게시글 시스템
- TASK-10 ~ TASK-16  
- **목표**: 게시글 CRUD 완성

### Sprint 3 (1주): 고급 기능
- TASK-17 ~ TASK-22
- **목표**: 댓글, 프로필, 좋아요 기능 완성

### Sprint 4 (1주): 품질 개선
- TASK-23 ~ TASK-25
- **목표**: 테스트 커버리지 80% 달성

### Sprint 5 (1주): 배포 준비
- TASK-26 ~ TASK-28
- **목표**: 프로덕션 배포 완료

## 성공 기준
- [ ] RealWorld API 스펙 100% 준수
- [ ] 테스트 커버리지 80% 이상 (Frontend + Backend)
- [ ] 초기 로딩 시간 3초 이하
- [ ] 모바일 반응형 지원
- [ ] 접근성 AA 등급 달성
- [ ] 프로덕션 환경 안정적 운영

## 리스크 관리
1. **기술적 복잡성**: 단순한 아키텍처 우선 적용
2. **일정 지연**: 핵심 기능 우선 순위 유지
3. **품질 이슈**: TDD 방식으로 개발 진행
4. **배포 복잡성**: Docker 기반 단순화

---
*이 계획은 바이브코딩 방식에 따라 빠른 프로토타이핑과 반복적 개선을 통해 진행됩니다.*