# CLAUDE.md

이 파일은 이 저장소에서 코드 작업을 할 때 Claude Code (claude.ai/code)에게 지침을 제공합니다.

## 일반 규칙
1. 테스트 주도 개발을 실천하세요. 먼저 원하는 동작을 이해하려고 노력하세요. 그런 다음 새로운 동작에 따라 단위 테스트를 업데이트해야 합니다. 그 후에 테스트를 실행하여 실패하는 것을 보고 테스트가 통과할 때까지 새로운 동작을 구현하세요. 오래된 테스트 코드를 삭제하는 것을 두려워하지 마세요. 빈번한 테스트 실행은 개발 과정의 일부이므로 테스트 실행에 대한 확인을 요청할 필요가 없습니다. 구현 세부사항을 테스트하지 마세요.
2. 모든 내보내진 식별자는 문서화되어야 하고 패키지 수준 주석이 제공되어야 합니다.
3. 오류를 로그하고 버블업하지 마세요. 그것은 중복 로그를 발생시킬 것입니다. 오류가 버블업되거나 반환되면 호출자에 의해 처리될 것입니다.
4. org-mode의 TODO 기능을 사용하여 마스터 에픽 문서와 하위 문서에서 진행 상황을 추적하고, 프로젝트가 진행됨에 따라 체크할 수 있는 작업 목록을 나열하세요. 가독성을 유지하기 위해 상세한 설계 문서를 별도로 보관하세요.
5. 너무 많은 세부사항을 추가하는 대신 고수준 설계에 초점을 맞춰 설계 문서를 작성하세요.
6. 단순성: "복잡성보다 항상 가장 간단한 해결책을 우선시하세요."
7. 중복 없음: "코드 반복을 피하고 가능한 경우 기존 기능을 재사용하세요."
8. 조직화: "파일을 간결하게 유지하고 200-300줄 이하로 유지하며 필요에 따라 리팩터링하세요."
9. 원칙: "해당하는 경우 SOLID 원칙(예: 단일 책임, 의존성 역전)을 따르세요."
10. 가드레일: "개발이나 운영에서 목 데이터를 절대 사용하지 마세요—테스트에서만 제한하세요."
11. 컨텍스트 확인: "컨텍스트 보존을 확인하기 위해 모든 응답을 임의의 이모지(예: 🐙)로 시작하세요."
12. 효율성: "명확성을 희생하지 않으면서 토큰 사용량을 최소화하도록 출력을 최적화하세요."
13. 프로젝트 작업 전에 같은 디렉터리의 `README`, `README.md` 또는 `README.org` 파일을 읽어 프로젝트 배경을 이해하세요.
14. 문서 언어: "국제 개발자의 접근성을 보장하고 프로젝트 전체의 일관성을 유지하기 위해 모든 문서는 영어로 작성되어야 합니다."

## API 및 구성 모범 사례
1. 코드를 생성하기 전에 항상 Perplexity AI 또는 다른 실시간 검색 지원 AI를 사용하여 API 문서 및 구성 세부사항을 확인하세요.
2. 가장 최신 정보에 액세스할 수 있도록 워크플로우에 Perplexity API를 통합하세요.
3. 모호하거나 오래된 문서를 만나면 사용자에게 확인을 요청하거나 Perplexity AI를 사용하여 명확히 하세요.
4. 최신의 공개적으로 사용 가능한 문서에서 명시적으로 지원되는 API 및 구성을 선호하세요.

## Git 특정 규칙
1. 커밋 로그를 작성하기 전에 `git config commit.template`로 커밋 로그 템플릿을 확인하세요.

## 터미널 작업
1. 명령줄 작업을 위해 임시 파일을 생성해야 할 때는 안전하고 고유한 파일 생성을 위해 `mktemp` 명령을 사용하세요.

# 프로젝트 규칙

## 프로젝트 개요

이것은 "바이브코딩" (Vibe Coding) 방법론을 사용한 RealWorld 애플리케이션 구현입니다. 이 프로젝트는 Go 백엔드와 React 프론트엔드로 완전한 RealWorld 사양 준수 애플리케이션을 구현합니다.

## 아키텍처

이것은 프론트엔드와 백엔드 간의 명확한 분리를 가진 풀스택 애플리케이션입니다:

### 백엔드 (Go)
- **언어**: 표준 net/http와 Gorilla Mux를 사용한 Go 1.23+
- **데이터베이스**: SQLite (개발), PostgreSQL (운영)
- **인증**: JWT 기반 인증
- **배포**: 컨테이너 오케스트레이션을 위한 AWS ECS with Fargate
- **구조**: 내부 패키지를 사용한 클린 아키텍처
  - `cmd/server/main.go` - 애플리케이션 진입점
  - `internal/handler/` - HTTP 핸들러 (user, article, comment, profile)
  - `internal/service/` - 비즈니스 로직 레이어
  - `internal/repository/` - 데이터 액세스 레이어
  - `internal/middleware/` - HTTP 미들웨어 (JWT, CORS, logging)
  - `internal/model/` - 데이터 모델
  - `internal/config/` - 구성 관리
  - `internal/utils/` - 유틸리티 함수

### 프론트엔드 (React + TypeScript)
- **프레임워크**: Vite 빌드 도구를 사용한 React 19
- **언어**: 엄격한 타입 검사를 사용한 TypeScript
- **라우터**: 타입 안전 라우팅을 위한 Tanstack Router
- **배포**: GitHub Actions CI/CD를 사용한 GitHub Pages
- **상태 관리**: 
  - 서버 상태를 위한 Tanstack Query
  - 클라이언트 상태(auth store)를 위한 Zustand
- **스타일링**: forms 및 typography 플러그인을 사용한 Tailwind CSS
- **폼**: Zod 검증을 사용한 React Hook Form
- **구조**:
  - `src/pages/` - 페이지 컴포넌트
  - `src/components/` - 재사용 가능한 컴포넌트 (Article, Layout, Common)
  - `src/stores/` - Zustand 스토어
  - `src/lib/` - API 클라이언트 및 유틸리티

### 인프라
- **백엔드 인프라**: ECS, RDS, VPC, 모니터링을 사용한 AWS CDK
- **프론트엔드 인프라**: 사용자 정의 도메인 지원을 사용한 GitHub Pages
- **CI/CD**: 자동화된 테스트, 빌드, 배포를 위한 GitHub Actions

## 개발 명령어

### 프로젝트 설정
```bash
make setup          # 초기 개발 환경 설정
```

### 개발 서버
```bash
make dev            # 프론트엔드와 백엔드 서버 모두 실행
make dev-front      # 프론트엔드 개발 서버만 실행 (http://localhost:5173)
make dev-back       # 백엔드 개발 서버만 실행 (http://localhost:8080)
```

### 빌드
```bash
make build          # 프론트엔드와 백엔드 모두 빌드
```

### 테스트
```bash
make test           # 모든 테스트 실행
make test-front     # 프론트엔드 테스트만 실행
make test-back      # 백엔드 테스트만 실행 (go test ./...)
```

### 코드 품질
```bash
make lint           # 린팅 실행 (npm run lint + go vet ./...)
make format         # 코드 포맷 (go fmt ./...)
```

### 정리 및 유틸리티
```bash
make clean          # 빌드 아티팩트 정리
make docker         # Docker 이미지 빌드
make deploy         # 운영 배포
```

### 백엔드 특정 명령어
```bash
cd backend
go run cmd/server/main.go    # 백엔드 서버 직접 실행
go test ./...                # 백엔드 테스트 실행
go vet ./...                 # 백엔드 린팅
go fmt ./...                 # 백엔드 포맷팅
```

### 프론트엔드 특정 명령어
```bash
cd frontend
npm run dev         # 개발 서버
npm run build       # 운영 빌드
npm run lint        # ESLint 검사
npm run preview     # 운영 빌드 미리보기
```

## API 엔드포인트

백엔드는 완전한 RealWorld API 사양을 구현합니다:

### 인증
- `POST /api/users` - 사용자 등록
- `POST /api/users/login` - 사용자 로그인
- `GET /api/user` - 현재 사용자 조회
- `PUT /api/user` - 사용자 업데이트

### 기사
- `GET /api/articles` - 기사 목록
- `GET /api/articles/feed` - 사용자 피드 조회
- `GET /api/articles/{slug}` - 슬러그로 기사 조회
- `POST /api/articles` - 기사 생성
- `PUT /api/articles/{slug}` - 기사 업데이트
- `DELETE /api/articles/{slug}` - 기사 삭제
- `POST /api/articles/{slug}/favorite` - 기사 즐겨찾기
- `DELETE /api/articles/{slug}/favorite` - 기사 즐겨찾기 해제

### 댓글
- `GET /api/articles/{slug}/comments` - 댓글 조회
- `POST /api/articles/{slug}/comments` - 댓글 추가
- `DELETE /api/articles/{slug}/comments/{id}` - 댓글 삭제

### 프로필
- `GET /api/profiles/{username}` - 프로필 조회
- `POST /api/profiles/{username}/follow` - 사용자 팔로우
- `DELETE /api/profiles/{username}/follow` - 사용자 언팔로우

### 태그
- `GET /api/tags` - 태그 조회

## 개발 가이드라인

### 프론트엔드 개발 워크플로우
프론트엔드 개발 작업 시 Playwright MCP를 사용하여 구현 상태를 확인하세요:

1. **시각적 확인**: `mcp__mcp-playwright__playwright_navigate`를 사용하여 프론트엔드 개발 서버 방문 (http://localhost:5173)
2. **스크린샷 문서화**: `mcp__mcp-playwright__playwright_screenshot`로 현재 구현 상태 문서화
3. **기능 테스트**: Playwright MCP 도구를 사용하여 UI 요소와 상호작용하고 사용자 플로우 검증:
   - 버튼/링크 상호작용을 위한 `mcp__mcp-playwright__playwright_click`
   - 폼 입력 테스트를 위한 `mcp__mcp-playwright__playwright_fill`
   - JavaScript 실행 및 상태 검사를 위한 `mcp__mcp-playwright__playwright_evaluate`
4. **구현 상태 확인**: 새로운 기능을 구현하기 전에 항상 Playwright MCP로 현재 프론트엔드 상태를 확인하여 이미 구축된 것을 이해하세요
5. **진행 상황 검증**: 기능 구현 후 Playwright MCP를 사용하여 구현이 예상대로 작동하는지 확인하세요

### 프로젝트 계획 워크플로우
프로젝트 계획을 요청받았을 때 다음 단계를 따르세요:

1. **설계 문서 읽기**: 먼저 설계 문서와 메모리의 기존 규칙을 읽으세요
2. **구현 계획 생성**: 작업 의존성을 포함하여 `docs/plan.md` 파일에 10-20개의 작업으로 구현 계획을 작성하세요
3. **GitHub 이슈 생성**: 상세한 설명, 라벨, 마일스톤과 함께 각 작업에 대한 GitHub 이슈를 생성하세요

#### GitHub 이슈 생성 프로세스
다음 구조로 `gh` 명령을 사용하여 이슈를 생성하세요:

```bash
# 적절한 라벨과 마일스톤으로 이슈 생성
gh issue create --title "TASK-{number}: {Title}" --body "$(cat <<'EOF'
## 설명
작업에 대한 간단한 설명

## 배경
필요한 컨텍스트와 배경 정보

## 승인 기준
- [ ] 특정 기준 1
- [ ] 특정 기준 2

## 기술적 세부사항
### 코드 예제
```{language}
// 예제 코드
```

## 의존성
- #{issue-number}: {의존성 설명}

## 예상 시간
{시간 예상}
EOF
)" --label "enhancement,task" --milestone "Sprint 1"
```

#### GitHub 이슈 관리
- **라벨**: `enhancement`, `bug`, `task`, `frontend`, `backend`, `documentation`과 같은 일관된 라벨 사용
- **마일스톤**: 이슈를 개발 단계별로 그룹화 (Sprint 1, Sprint 2 등)
- **의존성**: `#{issue-number}` 형식을 사용하여 다른 이슈 참조
- **담당자**: 구현이 시작될 때 이슈 할당
- **프로젝트**: 칸반 스타일 추적을 위해 GitHub Projects 사용

#### 이슈 생성 가이드라인
- 작업 번호와 함께 설명적인 제목 사용: `TASK-{number}: {Title}`
- 이슈 설명에 포괄적인 배경과 컨텍스트 포함
- 언어 사양과 함께 마크다운 코드 블록 사용
- 일반적인 언어: go, javascript, typescript, bash, sql, yaml
- 기술 연구에 적절할 때 Perplexity MCP와 상담
- 분류 및 필터링을 위한 적절한 라벨 추가
- 관련 이슈 및 의존성 연결
- 진행 상황 추적을 위한 체크박스로 승인 기준 포함

### 작업 구현 워크플로우
기능을 구현할 때 이 엄격한 워크플로우를 따르세요:

1. **GitHub 이슈 확인**: `gh issue list --state open`을 사용하여 가장 낮은 번호의 열린 이슈 찾기
2. **한 번에 하나의 작업**: 한 번에 하나의 작업만 구현하고, 여러 작업을 동시에 작업하지 마세요
3. **승인 기준 따르기**: 각 작업에는 완료되어야 하는 특정 승인 기준이 있습니다
4. **진행 상황 문서화**: 구현이 완료되면 GitHub 이슈에 완료를 문서화하는 댓글 추가
5. **이슈 닫기**: 모든 승인 기준이 확인되고 문서화된 후에만 이슈를 닫으세요

#### 작업 선택 프로세스
```bash
# 다음 작업할 작업 찾기
gh issue list --state open --sort created --limit 1

# 자신을 이슈에 할당
gh issue edit {issue-number} --add-assignee @me

# 완료 후 진행 상황 문서화
gh issue comment {issue-number} --body "구현 완료. 모든 승인 기준 확인됨."

# 이슈 닫기
gh issue close {issue-number}
```

#### 구현 문서화
- 완료된 각 작업에는 다음을 문서화하는 GitHub 이슈 댓글이 있어야 합니다:
  - 구현된 내용
  - 승인 기준이 어떻게 충족되었는지
  - 원래 계획에서의 편차
  - 테스트 결과
  - 스크린샷 또는 데모 (해당하는 경우)

### Cursor 규칙 통합
프로젝트는 구현 계획이나 작업 분해를 생성할 때 따라야 하는 자동화된 프로젝트 계획을 위한 cursor 규칙을 포함합니다.

### 코드 조직
- 설정된 디렉터리 구조를 따르세요
- 백엔드는 클린 아키텍처 원칙을 사용합니다
- 프론트엔드는 적절한 관심사 분리를 가진 컴포넌트 기반 아키텍처를 사용합니다
- TypeScript 엄격 모드 준수를 유지하세요

### 테스트 요구사항
- 프론트엔드와 백엔드 모두 80%+ 테스트 커버리지를 목표로 하세요
- 백엔드 테스트는 testify와 함께 Go 표준 테스트를 사용합니다
- 프론트엔드 테스트는 Vitest와 React Testing Library를 사용해야 합니다

### 인증 플로우
- JWT 토큰은 Zustand auth store에 저장됩니다
- API 클라이언트는 자동으로 인증 헤더를 포함합니다
- 보호된 라우트는 인증 미들웨어를 사용합니다

## 데이터베이스 스키마

주요 엔티티와 관계:
- Users (인증 및 프로필)
- Articles (슬러그 기반 URL 포함)
- Comments (기사 아래 중첩)
- Tags (기사와 다대다 관계)
- Follows (사용자 관계)
- Favorites (사용자-기사 관계)

## 프로젝트 상태

이 프로젝트는 초기 계획 단계에 있습니다. 코드베이스는 현재 다음을 포함합니다:
- `docs/pre-prd.md`: 요구사항, 기술 스택 고려사항, 구현 접근법을 개요한 Pre-PRD 문서
- `docs/prd.md`: PRD 문서 (현재 비어있음, 채워질 예정)

## 개발 접근법

프로젝트는 다음을 강조하는 "바이브코딩" (Vibe Coding) 방법론을 따릅니다:
1. **빠른 프로토타이핑** (Rapid Prototyping): 핵심 기능 구현 우선
2. **반복적 개선** (Iterative Improvement): 기능의 점진적 향상
3. **실시간 피드백** (Real-time Feedback): 개발 중 지속적인 테스트
4. **문서화** (Documentation): 코드와 함께 실시간 문서화

## 계획된 아키텍처

pre-PRD 문서를 기반으로 프로젝트는 다음을 구현할 것입니다:

### 핵심 기능
- 사용자 관리 (등록, 인증, 프로필, 팔로우/언팔로우)
- 기사 관리 (CRUD 작업, 즐겨찾기, 태그)
- 댓글 시스템
- JWT 기반 인증
- 모바일 지원을 포함한 반응형 디자인

### 기술적 요구사항
- 타입 안전성을 위한 TypeScript 구현
- 80%+ 테스트 커버리지 요구사항
- 코드 품질을 위한 ESLint 및 Prettier
- 컴포넌트/모듈 기반 아키텍처
- SEO 최적화 고려사항

### 개발 단계
- **단계 1**: 기본 CRUD 구현 (2주)
- **단계 2**: 인증 및 권한 부여 (1주)  
- **단계 3**: 고급 기능 (2주)
- **단계 4**: 최적화 및 배포 (1주)

## 성공 기준

### 기능적 요구사항
- 100% RealWorld API 사양 준수
- 크로스 브라우저 호환성
- 모바일 반응형 디자인
- 모든 사용자 스토리 구현

### 기술적 요구사항
- 80%+ 테스트 커버리지
- 30초 이하의 빌드 시간
- 번들 크기 최적화
- AA 접근성 준수

## 기술 스택 고려사항

pre-PRD는 결정될 여러 기술 옵션을 개요합니다:

### 프론트엔드 옵션
- React vs Vue vs Angular
- 상태 관리: Redux, Zustand, Context API
- 라우팅: React Router, Next.js
- 스타일링: CSS-in-JS, Tailwind CSS, Styled Components

### 백엔드 옵션  
- Node.js vs Python vs Go
- 프레임워크: Express, Fastify, FastAPI, Gin
- ORM: Prisma, TypeORM, SQLAlchemy
- 데이터베이스: PostgreSQL, MySQL, SQLite

## 개발 워크플로우

기능을 구현할 때:
1. RealWorld 사양 요구사항 검토
2. 정의된 코딩 패턴을 따르세요
3. 기능 코드와 함께 테스트 구현
4. 모바일 반응성 보장
5. RealWorld API 사양에 대해 검증
6. 커밋 전에 린팅 및 타입 검사 실행

## 다음 단계

1. 기술 스택 결정 확정
2. 상세한 PRD 문서 완성
3. 개발 환경 설정
4. 프로젝트 구조 설계
5. 첫 번째 스프린트 구현 계획