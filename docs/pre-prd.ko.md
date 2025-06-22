# RealWorld 바이브 코딩 구현 - Pre-PRD

## 프로젝트 개요
이 프로젝트는 바이브 코딩 방법론을 사용하여 RealWorld 애플리케이션(https://realworld-docs.netlify.app/implementation-creation/introduction/)을 구현합니다. 이 문서는 PRD(제품 요구사항 문서) 작성을 위한 예비 요구사항 정의 역할을 합니다.

## RealWorld 사양 분석

### 기본 요구사항
- **프론트엔드**: SPA(Single Page Application) 구현
- **백엔드**: REST API 서버 구현
- **데이터베이스**: 사용자, 기사, 댓글 관리
- **인증**: JWT 기반 사용자 인증
- **배포**: 실제 운영 환경 배포

### 핵심 기능
1. **사용자 관리**
   - 등록/로그인/로그아웃
   - 프로필 관리
   - 사용자 팔로우/언팔로우

2. **기사 관리**
   - 기사 생성/편집/삭제
   - 기사 목록 조회(피드, 글로벌)
   - 기사 즐겨찾기/즐겨찾기 해제
   - 태그 기반 필터링

3. **댓글 시스템**
   - 댓글 생성/삭제
   - 댓글 목록 조회

## 기술 스택 선택 기준

### 프론트엔드 기술 스택 (확정)
- **프레임워크**: React with Vite
- **라우팅**: Tanstack Router  
- **상태 관리**: Tanstack Query (서버 상태), Zustand (클라이언트 상태)
- **UI 라이브러리**: Mantine UI (컴포넌트 라이브러리)
- **스타일링**: Mantine의 CSS-in-JS + 커스텀 CSS
- **아이콘**: Tabler Icons (Mantine 기본 아이콘 세트)
- **폼 처리**: Mantine Form + Zod 검증
- **알림**: Mantine Notifications
- **언어**: TypeScript
- **빌드 도구**: Vite

### 백엔드 기술 스택 (확정)
- **언어**: Go (선택 이유: 명시적인 컨텍스트, 간단한 테스트, 생태계 안정성, AI 협업 친화적)
- **데이터베이스**: SQLite (개발), PostgreSQL (운영)
- **인증**: JWT
- **HTTP 서버**: 표준 net/http (복잡한 프레임워크 사용 안함)
- **데이터베이스 접근**: Pure SQL (ORM 사용 안함, 명확한 쿼리 제어)

### 개발 환경 및 도구
- **프로젝트 관리**: Makefile
- **Go 모듈**: Go Modules
- **코드 품질**: Go fmt, Go vet
- **테스트**: Go 표준 테스트 도구
- **로깅**: 구조화된 로깅 (JSON 형식)
- **컨테이너화**: Docker (개발 환경 통일)
- **CI/CD**: GitHub Actions
- **배포**: AWS ECS + Fargate
- **인프라**: AWS CDK (TypeScript)

## 아키텍처 요구사항

### 프론트엔드 코드 품질
- TypeScript 사용 (타입 안전성)
- 80%+ 테스트 커버리지
- ESLint, Prettier 적용
- 컴포넌트/모듈 기반 설계
- Mantine UI 컴포넌트를 기반으로 한 일관된 디자인 시스템
- 접근성 준수 (Mantine 기본 지원)
- 반응형 디자인 (Mantine Grid, Flex 시스템 활용)

### 백엔드 코드 품질
- Go 사용 (타입 안전성)
- 80%+ 테스트 커버리지
- Go Format 적용
- 컴포넌트/모듈 기반 설계

### 성능 요구사항
- 초기 로딩 시간 3초 이하
- 페이지 전환 시간 1초 이하
- 모바일 반응형 지원 (Mantine 반응형 브레이크포인트 활용)
- SEO 최적화 고려
- Mantine 번들 사이즈 최적화 (tree-shaking 적용)
- 다크 테마 지원 (Mantine ColorScheme 활용)

### 배포 및 운영
- **CI/CD**: GitHub Actions 파이프라인
  - 테스트 자동화 (프론트엔드 + 백엔드)
  - Docker 이미지 빌드 및 ECR 푸시
  - ECS 서비스 자동 배포
- **인프라 관리**: AWS CDK로 IaC 구현
  - ECS 클러스터 + Fargate 서비스
  - RDS PostgreSQL (운영 환경)
  - ALB + CloudFront (CDN)
  - Route53 (도메인 관리)
- **환경 구성**: dev, staging, prod 분리
- **모니터링**: CloudWatch + X-Ray
- **로깅**: CloudWatch Logs 중앙화
- **보안**: AWS IAM + Security Groups

## 개발 프로세스

### 바이브 코딩 적용 전략
1. **빠른 프로토타이핑**: 핵심 기능 우선 구현
2. **반복적 개선**: 점진적 기능 완성도 향상
3. **실시간 피드백**: 구현 중 지속적 테스트
4. **문서화**: 코드와 함께 실시간 문서화
5. **단순함 우선**: 복잡한 아키텍처 패턴보다 명확한 함수명과 간단한 구조
6. **AI 협업 친화적**: 예측 가능하고 안정적인 생태계 활용

## 성공 지표

### 기능 지표
- [ ] RealWorld API 사양 100% 준수
- [ ] 모든 사용자 스토리 구현
- [ ] 크로스 브라우저 호환성
- [ ] 모바일 반응형 완성도

### 기술 지표
- [ ] 80%+ 테스트 커버리지
- [ ] 빌드 시간 30초 이하
- [ ] 번들 사이즈 최적화
- [ ] AA 접근성 등급 달성

## 다음 단계
1. 최종 기술 스택 결정
2. 상세 PRD 작성
3. 개발 환경 설정
4. 프로젝트 구조 설계
5. 첫 번째 스프린트 계획

---

*이 문서는 PRD 작성을 위한 기초 자료 역할을 합니다.*