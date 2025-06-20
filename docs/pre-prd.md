# RealWorld 바이브코딩 구현 - Pre-PRD

## 프로젝트 개요
RealWorld 애플리케이션(https://realworld-docs.netlify.app/implementation-creation/introduction/)을 바이브코딩 방식으로 구현하는 프로젝트입니다. 이 문서는 PRD(Product Requirements Document) 작성을 위한 사전 요건 정의서입니다.

## RealWorld 스펙 분석

### 기본 요구사항
- **Frontend**: SPA(Single Page Application) 구현
- **Backend**: REST API 서버 구현
- **데이터베이스**: 사용자, 게시글, 댓글 관리
- **인증**: JWT 기반 사용자 인증
- **배포**: 실제 운영 환경 배포

### 핵심 기능
1. **사용자 관리**
   - 회원가입/로그인/로그아웃
   - 프로필 관리
   - 사용자 팔로우/언팔로우

2. **게시글 관리**
   - 게시글 작성/수정/삭제
   - 게시글 목록 조회 (피드, 글로벌)
   - 게시글 좋아요/취소
   - 태그 기반 필터링

3. **댓글 시스템**
   - 댓글 작성/삭제
   - 댓글 목록 조회

## 기술 스택 선택 기준

### Frontend 기술 스택 (확정)
- **프레임워크**: React with Vite
- **라우팅**: Tanstack Router  
- **상태관리**: Tanstack Query (서버 상태), Zustand (클라이언트 상태)
- **UI 라이브러리**: Mantine UI (컴포넌트 라이브러리)
- **스타일링**: Mantine의 CSS-in-JS + 커스텀 CSS
- **아이콘**: Tabler Icons (Mantine 기본 아이콘 세트)
- **폼 처리**: Mantine Form + Zod 유효성 검사
- **알림**: Mantine Notifications
- **언어**: TypeScript
- **빌드 도구**: Vite

### Backend 기술 스택 (확정)
- **언어**: Go (선택 이유: 명시적 컨텍스트, 간단한 테스트, 생태계 안정성, AI 협업 친화적)
- **데이터베이스**: SQLite (개발용), PostgreSQL (운영용)
- **인증**: JWT
- **HTTP 서버**: 표준 net/http (복잡한 프레임워크 지양)
- **데이터베이스 접근**: 순수 SQL (ORM 지양, 명확한 쿼리 제어)

### 개발 환경 및 도구
- **프로젝트 관리**: Makefile
- **Go 모듈**: Go Modules
- **코드 품질**: Go fmt, Go vet
- **테스팅**: Go 표준 테스트 도구
- **로깅**: 구조화된 로깅 (JSON 형태)
- **컨테이너**: Docker (개발 환경 통일)
- **CI/CD**: GitHub Actions
- **배포**: AWS ECS + Fargate
- **인프라**: AWS CDK (TypeScript)

## 아키텍처 요구사항

### 프론트엔드 코드 품질
- TypeScript 사용 (타입 안정성)
- 테스트 커버리지 80% 이상
- ESLint, Prettier 적용
- 컴포넌트/모듈 단위 설계
- Mantine UI 컴포넌트 기반 일관된 디자인 시스템
- 접근성 (Accessibility) 준수 (Mantine 기본 지원)
- 반응형 디자인 (Mantine Grid, Flex 시스템 활용)

### 백엔드 코드 품질
- Go 사용 (타입 안정성)
- 테스트 커버리지 80% 이상
- Go Format 적용
- 컴포넌트/모듈 단위 설계

### 성능 요구사항
- 초기 로딩 시간 3초 이하
- 페이지 전환 시간 1초 이하
- 모바일 반응형 지원 (Mantine responsive breakpoints 활용)
- SEO 최적화 고려
- Mantine 번들 크기 최적화 (tree-shaking 적용)
- 다크 테마 지원 (Mantine ColorScheme 활용)

### 배포 및 운영
- **CI/CD**: GitHub Actions 파이프라인
  - 테스트 자동화 (Frontend + Backend)
  - Docker 이미지 빌드 및 ECR 푸시
  - ECS 서비스 자동 배포
- **인프라 관리**: AWS CDK로 IaC 구현
  - ECS 클러스터 + Fargate 서비스
  - RDS PostgreSQL (운영환경)
  - ALB + CloudFront (CDN)
  - Route53 (도메인 관리)
- **환경별 설정**: dev, staging, prod 분리
- **모니터링**: CloudWatch + X-Ray
- **로깅**: CloudWatch Logs 중앙화
- **보안**: AWS IAM + Security Groups

## 개발 프로세스

### 바이브코딩 적용 방안
1. **빠른 프로토타이핑**: 핵심 기능 우선 구현
2. **반복적 개선**: 기능별 점진적 완성도 향상
3. **실시간 피드백**: 구현 과정 중 지속적 테스트
4. **문서화**: 코드와 함께 실시간 문서 작성
5. **단순함 우선**: 복잡한 아키텍처 패턴보다 명확한 함수명과 단순한 구조
6. **AI 협업 친화적**: 예측 가능하고 안정적인 생태계 활용

## 성공 지표

### 기능적 지표
- [ ] RealWorld API 스펙 100% 준수
- [ ] 모든 사용자 스토리 구현
- [ ] 크로스 브라우저 호환성
- [ ] 모바일 반응형 완성도

### 기술적 지표
- [ ] 테스트 커버리지 80% 이상
- [ ] 빌드 시간 30초 이하
- [ ] 번들 크기 최적화
- [ ] 접근성 AA 등급 달성

## 다음 단계
1. 기술 스택 최종 결정
2. 상세 PRD 작성
3. 개발 환경 구축
4. 프로젝트 구조 설계
5. 첫 번째 스프린트 계획 수립

---

*이 문서는 PRD 작성을 위한 기초 자료로 활용됩니다.*