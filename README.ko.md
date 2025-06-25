# RealWorld 애플리케이션 - 바이브 코딩 구현

**🌐 Language / 言語 / 언어**
- **한국어** | [日本語](README.jp.md) | [English](README.md)

> 바이브 코딩 방법론을 사용하여 Go 백엔드와 React 프론트엔드로 구축된 풀스택 RealWorld 애플리케이션입니다.

## 개요

이 프로젝트는 [RealWorld](https://github.com/gothinkster/realworld) 애플리케이션 사양을 구현합니다 - 현대 웹 기술의 실제 사용법을 보여주는 Medium.com 클론입니다. **이는 Armin Ronacher의 ["Agentic Coding Recommendations"](https://lucumr.pocoo.org/2025/6/12/agentic-coding/) 방법론을 따르는 바이브 코딩 학습 프로젝트입니다.**

### 프로젝트 개발 여정

이 프로젝트는 완전한 **바이브 코딩** 구현 과정을 보여줍니다:

1. **📋 [규칙 및 가이드라인](CLAUDE.md) 생성** - Armin Ronacher의 권장사항을 기반으로 한 프로젝트 규칙과 코딩 표준 수립
2. **📝 [Pre-PRD](/docs/pre-prd.md) 개발** - 초기 요구사항 수집 및 기술 스택 평가
3. **📊 [PRD (제품 요구사항 문서)](/docs/prd.md)** - 상세한 사양 및 기능 계획
4. **🗺️ [프로젝트 계획](/docs/plan.md)** - 작업 분해 및 구현 로드맵
5. **⚡ [신속한 구현](https://github.com/Hands-On-Vibe-Coding/realworld-vibe-coding/issues?q=is%3Aissue)** - 바이브 코딩 원칙을 사용한 핵심 기능 개발

### 적용된 바이브 코딩 원칙

Armin Ronacher의 방법론에 따라 이 프로젝트는 다음을 강조합니다:

- **복잡함보다 단순함**: 검증되고 신뢰할 수 있는 기술 사용
- **AI 친화적 개발**: 명확한 문서화와 구조화된 코드 패턴
- **신속한 프로토타이핑**: 즉각적인 피드백을 통한 빠른 반복
- **교육적 초점**: 학습에 적합한 비용 최적화 배포
- **실시간 문서화**: 코드와 함께 발전하는 살아있는 문서

## 기술 스택

이 프로젝트는 Armin Ronacher의 블로그 포스트 ["Agentic Coding Recommendations"](https://lucumr.pocoo.org/2025/6/12/agentic-coding/)에서 권장하는 기술 스택을 사용하여 구축되었으며, 단순성, 신뢰성, AI 친화적 개발 패턴을 강조합니다.

### 백엔드
- **언어**: Go 1.21+ 
- **프레임워크**: Gorilla Mux를 사용한 표준 net/http
- **데이터베이스**: SQLite (개발환경) / PostgreSQL (운영환경)
- **인증**: JWT 기반 인증
- **아키텍처**: 의존성 주입을 사용한 클린 아키텍처

### 프론트엔드
- **프레임워크**: TypeScript를 사용한 React 19
- **빌드 도구**: Vite
- **UI 라이브러리**: Mantine v8
- **라우팅**: TanStack Router (타입 안전)
- **상태 관리**: 
  - Zustand (클라이언트 상태)
  - TanStack Query (서버 상태)
- **폼**: Zod 검증을 사용한 React Hook Form
- **스타일링**: Tailwind CSS

## 빠른 시작

### 필수 요구사항
- Go 1.21+
- Node.js 18+
- npm 또는 yarn

### 개발 환경 설정

1. **저장소 클론**
   ```bash
   git clone https://github.com/hands-on-vibe-coding/realworld-vibe-coding.git
   cd realworld-vibe-coding
   ```

2. **개발 환경 설정**
   ```bash
   make setup
   ```

3. **개발 서버 시작**
   ```bash
   make dev
   ```
   
   다음이 시작됩니다:
   - 백엔드 서버: http://localhost:8080
   - 프론트엔드 서버: http://localhost:5173

## 사용 가능한 명령어

### 프로젝트 레벨 명령어
```bash
make setup          # 초기 개발 환경 설정
make dev            # 프론트엔드와 백엔드 서버 모두 실행
make build          # 프론트엔드와 백엔드 모두 빌드
make test           # 모든 테스트 실행
make lint           # 두 프로젝트에 대한 린팅 실행
make clean          # 빌드 아티팩트 정리
```

### 백엔드 명령어
```bash
make dev-back       # 백엔드 서버만 실행
make test-back      # 백엔드 테스트 실행
make build-back     # 백엔드 바이너리 빌드

# 직접 Go 명령어 (backend/ 디렉터리에서)
go run cmd/server/main.go    # 서버 직접 실행
go test ./...                # 테스트 실행
go vet ./...                 # 코드 린팅
```

### 프론트엔드 명령어  
```bash
make dev-front      # 프론트엔드 개발 서버만 실행
make test-front     # 프론트엔드 테스트 실행
make build-front    # 프론트엔드 운영용 빌드

# 직접 npm 명령어 (frontend/ 디렉터리에서)
npm run dev         # 개발 서버
npm run build       # 운영용 빌드
npm run test        # 테스트 실행
npm run lint        # ESLint 검사
```

## 프로젝트 구조

```
├── backend/                 # Go 백엔드
│   ├── cmd/server/         # 애플리케이션 진입점
│   ├── internal/           # 내부 패키지
│   │   ├── config/         # 설정 관리
│   │   ├── db/            # 데이터베이스 연결 및 마이그레이션
│   │   ├── handler/       # HTTP 핸들러
│   │   ├── middleware/    # HTTP 미들웨어
│   │   ├── model/         # 데이터 모델
│   │   ├── repository/    # 데이터 접근 레이어
│   │   ├── service/       # 비즈니스 로직 레이어
│   │   └── utils/         # 유틸리티 함수
│   ├── migrations/        # 데이터베이스 마이그레이션 파일
│   └── pkg/              # 공개 패키지
├── frontend/              # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── stores/       # Zustand 스토어
│   │   ├── lib/          # API 클라이언트 및 유틸리티
│   │   ├── types/        # TypeScript 타입 정의
│   │   └── theme/        # Mantine 테마 설정
│   └── public/           # 정적 자산
└── docs/                 # 프로젝트 문서
```

## 데이터베이스 스키마

애플리케이션은 다음 엔티티들을 포함한 관계형 데이터베이스를 사용합니다:

- **Users**: 인증을 포함한 사용자 계정
- **Articles**: 슬러그 기반 URL을 가진 블로그 포스트
- **Comments**: 기사에 대한 중첩 댓글
- **Tags**: 기사 분류
- **Follows**: 사용자 관계 관리
- **Favorites**: 기사 북마킹

데이터베이스 마이그레이션은 서버 시작 시 자동으로 적용됩니다.

## API 엔드포인트

백엔드는 완전한 [RealWorld API 사양](https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints)을 구현합니다:

### 인증
- `POST /api/users` - 사용자 등록
- `POST /api/users/login` - 사용자 로그인
- `GET /api/user` - 현재 사용자 조회
- `PUT /api/user` - 사용자 업데이트

### 기사
- `GET /api/articles` - 기사 목록 (페이지네이션 포함)
- `GET /api/articles/feed` - 사용자 피드 조회
- `GET /api/articles/{slug}` - 슬러그로 기사 조회
- `POST /api/articles` - 기사 생성
- `PUT /api/articles/{slug}` - 기사 업데이트
- `DELETE /api/articles/{slug}` - 기사 삭제

### 프로필 & 소셜 기능
- `GET /api/profiles/{username}` - 사용자 프로필 조회
- `POST /api/profiles/{username}/follow` - 사용자 팔로우
- `DELETE /api/profiles/{username}/follow` - 사용자 언팔로우
- `POST /api/articles/{slug}/favorite` - 기사 즐겨찾기
- `DELETE /api/articles/{slug}/favorite` - 기사 즐겨찾기 해제

### 댓글 & 태그
- `GET /api/articles/{slug}/comments` - 댓글 조회
- `POST /api/articles/{slug}/comments` - 댓글 추가
- `DELETE /api/articles/{slug}/comments/{id}` - 댓글 삭제
- `GET /api/tags` - 인기 태그 조회

## 개발 방법론

이 프로젝트는 "바이브 코딩" 원칙을 따릅니다:

1. **빠른 프로토타이핑**: 핵심 기능 우선
2. **반복적 개선**: 점진적 기능 향상
3. **실시간 피드백**: 개발 중 지속적인 테스트
4. **문서화**: 코드와 함께 실시간 문서화

## 테스트

### 백엔드 테스트
- 비즈니스 로직을 위한 단위 테스트
- API 엔드포인트를 위한 통합 테스트
- 데이터베이스 마이그레이션 테스트
- 목표: 80%+ 코드 커버리지

### 프론트엔드 테스트
- React Testing Library를 사용한 컴포넌트 단위 테스트
- 사용자 워크플로우를 위한 통합 테스트
- Playwright를 사용한 End-to-End 테스트
- TypeScript strict 모드로 타입 안전성

### Git 훅
프로젝트는 코드 품질을 보장하기 위해 자동화된 pre-commit 훅을 사용합니다:
- **린팅 및 포맷팅**: 스테이지된 파일에 대해 자동 실행
- **테스트**: 변경된 부분(프론트엔드/백엔드)에 대한 테스트만 실행
- **Go 품질 검사**: 백엔드 코드에 대한 `go fmt` 및 `go vet`

자세한 정보는 [Git 훅 문서](./docs/git-hooks.ko.md)를 참조하세요.

## 기여하기

1. 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 코딩 표준을 따르고 테스트를 실행하세요
4. 변경사항을 커밋하세요 (`git commit -m 'Add amazing feature'`)
5. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
6. Pull Request를 열어주세요

## 배포

이 애플리케이션은 자동화된 CI/CD 파이프라인과 함께 하이브리드 배포 전략을 사용합니다:

- **프론트엔드**: 자동화된 배포와 함께 GitHub Pages
- **백엔드**: Fargate 컨테이너를 사용한 AWS ECS
- **데이터베이스**: AWS RDS PostgreSQL
- **인프라**: 코드형 인프라를 위한 AWS CDK

### 빠른 시작 배포

1. **프론트엔드**: 모든 푸시에서 https://dohyunjung.github.io/realworld-vibe-coding/ 에 자동 배포
2. **백엔드**: AWS 인프라 설정 및 GitHub secrets 구성이 필요합니다

### 상세한 배포 가이드

다음을 포함한 포괄적인 배포 지침은:

- CDK를 사용한 AWS 인프라 설정
- GitHub Actions CI/CD 구성
- 환경 변수 및 시크릿 관리
- 모니터링 및 문제 해결
- 비용 최적화 전략
- 보안 고려사항

**📖 전체 지침은 [배포 가이드](docs/DEPLOYMENT.ko.md)를 참조하세요.**

### 로컬 개발

```bash
# 백엔드
PORT=8080
DATABASE_URL=realworld.db
JWT_SECRET=your-secret-key
ENVIRONMENT=development

# 프론트엔드
VITE_API_BASE_URL=http://localhost:8080
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 감사의 말

- [RealWorld](https://github.com/gothinkster/realworld) - 사양 및 커뮤니티
- [Mantine](https://mantine.dev/) - React 컴포넌트 라이브러리
- [TanStack](https://tanstack.com/) - 현대적인 React 도구
- 훌륭한 표준 라이브러리와 생태계를 위한 Go 커뮤니티

---

❤️를 담아 바이브코딩 방법론으로 구축되었습니다