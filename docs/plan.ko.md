# RealWorld 바이브 코딩 구현 계획

## 프로젝트 개요
바이브 코딩 방법론을 사용한 RealWorld 애플리케이션 구축 완전 구현 계획.
- **프론트엔드**: React + Vite + TypeScript + Mantine UI
- **백엔드**: Go + SQLite/PostgreSQL + JWT
- **배포**: AWS ECS + Fargate

## 개발 단계 계획

### 1단계: 기본 인프라 및 프로젝트 설정 (1주)

#### TASK-01: 백엔드 프로젝트 구조 설정
- **설명**: Go 기반 백엔드 프로젝트 구조 생성
- **의존성**: 없음
- **결과물**: backend/ 디렉터리 구조, go.mod, Makefile

#### TASK-02: 프론트엔드 프로젝트 구조 설정  
- **설명**: Mantine UI 구성과 함께 React + Vite + TypeScript 프로젝트 설정 완료
- **의존성**: 없음
- **결과물**: 완전한 frontend/ 디렉터리 구성, package.json, vite.config.ts

#### TASK-03: 데이터베이스 스키마 및 마이그레이션
- **설명**: SQLite 기반 데이터베이스 스키마 설계 및 마이그레이션 스크립트
- **의존성**: TASK-01
- **결과물**: migrations/ 디렉터리, 테이블 생성 스크립트

#### TASK-04: Docker 개발 환경 설정
- **설명**: Docker Compose를 사용한 통합 개발 환경
- **의존성**: TASK-01, TASK-02
- **결과물**: docker-compose.yml, Dockerfile (프론트엔드/백엔드)

### 2단계: 사용자 인증 시스템 (1주)

#### TASK-05: JWT 인증 미들웨어 구현
- **설명**: Go JWT 토큰 생성/검증 미들웨어
- **의존성**: TASK-01, TASK-03
- **결과물**: internal/middleware/jwt.go, internal/utils/jwt.go

#### TASK-06: 사용자 등록 API
- **설명**: 사용자 등록 REST API 엔드포인트
- **의존성**: TASK-05
- **결과물**: internal/handler/user.go (Register), internal/service/user.go

#### TASK-07: 사용자 로그인 API
- **설명**: 사용자 로그인 REST API 엔드포인트
- **의존성**: TASK-06
- **결과물**: internal/handler/user.go (Login), JWT 토큰 발급

#### TASK-08: 프론트엔드 인증 상태 관리
- **설명**: Zustand 기반 인증 스토어 및 API 클라이언트
- **의존성**: TASK-02
- **결과물**: src/stores/authStore.ts, src/lib/api.ts

#### TASK-09: 로그인/등록 페이지 구현
- **설명**: Mantine Form을 사용한 로그인/등록 UI
- **의존성**: TASK-08
- **결과물**: src/pages/Login.tsx, src/pages/Register.tsx

### 3단계: 기사 관리 시스템 (1.5주)

#### TASK-10: 기사 CRUD API
- **설명**: 기사 생성/읽기/수정/삭제 REST API
- **의존성**: TASK-05
- **결과물**: internal/handler/article.go, internal/service/article.go

#### TASK-11: 기사 목록 API (페이지네이션)
- **설명**: 기사 목록 조회 및 페이지네이션 구현
- **의존성**: TASK-10
- **결과물**: 기사 목록 API, 페이지네이션 로직

#### TASK-12: 태그 시스템 API
- **설명**: 태그 관리 및 태그 기반 기사 필터링
- **의존성**: TASK-10
- **결과물**: internal/handler/tag.go, 태그 관련 테이블

#### TASK-13: 프론트엔드 기사 상태 관리
- **설명**: TanStack Query를 사용한 기사 데이터 관리
- **의존성**: TASK-08
- **결과물**: src/hooks/useArticles.ts, 기사 관련 쿼리

#### TASK-14: 기사 목록 페이지 구현
- **설명**: Mantine Card를 사용한 기사 목록 UI
- **의존성**: TASK-13
- **결과물**: src/pages/Home.tsx, src/components/Article/ArticleList.tsx

#### TASK-15: 기사 상세 페이지 구현
- **설명**: 기사 상세 보기 및 편집 UI
- **의존성**: TASK-14
- **결과물**: src/pages/Article.tsx, src/components/Article/ArticleDetail.tsx

#### TASK-16: 기사 생성/편집 페이지 구현
- **설명**: Mantine Form을 사용한 기사 에디터
- **의존성**: TASK-13
- **결과물**: src/pages/Editor.tsx, src/components/Article/ArticleForm.tsx

### 4단계: 고급 기능 구현 (1주)

#### TASK-17: 댓글 시스템 API
- **설명**: 댓글 생성/읽기/삭제 REST API
- **의존성**: TASK-10
- **결과물**: internal/handler/comment.go, internal/service/comment.go

#### TASK-18: 사용자 프로필 및 팔로우 API
- **설명**: 사용자 프로필 조회 및 팔로우/언팔로우 API
- **의존성**: TASK-05
- **결과물**: internal/handler/profile.go, 팔로우 관계 테이블

#### TASK-19: 기사 즐겨찾기 API
- **설명**: 기사 즐겨찾기/즐겨찾기 해제 API
- **의존성**: TASK-10
- **결과물**: 즐겨찾기 관련 API, favorites 테이블

#### TASK-20: 댓글 시스템 프론트엔드 구현
- **설명**: 댓글 목록/생성 UI 구현
- **의존성**: TASK-15, TASK-17
- **결과물**: src/components/Comment/, 댓글 관련 컴포넌트

#### TASK-21: 사용자 프로필 페이지 구현
- **설명**: 프로필 보기 및 팔로우 버튼 UI
- **의존성**: TASK-08, TASK-18
- **결과물**: src/pages/Profile.tsx, src/components/Profile/

#### TASK-22: 개인 피드 구현
- **설명**: 팔로우한 사용자들의 기사 피드
- **의존성**: TASK-18, TASK-14
- **결과물**: 개인 피드 API 및 UI

### 5단계: 테스트 및 품질 개선 (1주)

#### TASK-23: 백엔드 단위 테스트 구현
- **설명**: Go 표준 테스트 도구를 사용하여 80% 테스트 커버리지 달성
- **의존성**: TASK-01~TASK-22
- **결과물**: *_test.go 파일들, 테스트 커버리지 리포트

#### TASK-24: 프론트엔드 테스트 구현
- **설명**: Vitest + React Testing Library를 사용한 컴포넌트 테스트
- **의존성**: TASK-02~TASK-22
- **결과물**: *.test.tsx 파일들, 테스트 커버리지 리포트

#### TASK-25: E2E 테스트 구현
- **설명**: Playwright를 사용한 완전한 사용자 플로우 테스트
- **의존성**: TASK-23, TASK-24
- **결과물**: e2e/ 테스트 디렉터리, CI/CD 통합

### 6단계: 배포 및 운영 (1주)

#### TASK-26: GitHub Actions CI/CD 파이프라인
- **설명**: 자동화된 테스트 및 배포 파이프라인
- **의존성**: TASK-25
- **결과물**: .github/workflows/, Docker 이미지 자동화

#### TASK-27: AWS ECS 인프라 설정
- **설명**: AWS CDK를 사용한 Infrastructure as Code
- **의존성**: TASK-04
- **결과물**: infrastructure/ 디렉터리, CDK 스택

#### TASK-28: 운영 배포 및 모니터링
- **설명**: 운영 환경 배포 및 모니터링 설정
- **의존성**: TASK-26, TASK-27
- **결과물**: 운영 배포, CloudWatch 대시보드

## 마일스톤 요약

### 스프린트 1: 기본 인프라 + 인증
- TASK-01 ~ TASK-09
- **목표**: 사용자 등록/로그인 기능 완료

### 스프린트 2: 기사 시스템
- TASK-10 ~ TASK-16  
- **목표**: 기사 CRUD 기능 완료

### 스프린트 3: 고급 기능
- TASK-17 ~ TASK-22
- **목표**: 댓글, 프로필, 즐겨찾기 기능 완료

### 스프린트 4: 품질 개선
- TASK-23 ~ TASK-25
- **목표**: 80% 테스트 커버리지 달성

### 스프린트 5: 배포 준비
- TASK-26 ~ TASK-28
- **목표**: 운영 배포 완료

## 성공 기준
- [ ] RealWorld API 사양 100% 준수
- [ ] 80%+ 테스트 커버리지 (프론트엔드 + 백엔드)
- [ ] 초기 로딩 시간 3초 이하
- [ ] 모바일 반응형 디자인 지원
- [ ] AA 접근성 준수
- [ ] 안정적인 운영 환경 동작

## 위험 관리
1. **기술적 복잡성**: 간단한 아키텍처 우선 적용
2. **일정 지연**: 핵심 기능 우선순위 유지
3. **품질 문제**: TDD 접근법으로 진행
4. **배포 복잡성**: Docker 기반 접근법으로 단순화

---
*이 계획은 빠른 프로토타이핑과 반복적 개선을 통한 바이브 코딩 방법론을 따릅니다.*