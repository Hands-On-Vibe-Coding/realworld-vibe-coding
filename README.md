# RealWorld 바이브코딩 구현

![RealWorld](https://img.shields.io/badge/RealWorld-API-brightgreen)
![Go](https://img.shields.io/badge/Go-1.23+-blue)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)

RealWorld 애플리케이션을 바이브코딩(Vibe Coding) 방식으로 구현한 프로젝트입니다. Go 백엔드와 React 프론트엔드로 구성된 완전한 풀스택 애플리케이션입니다.

## 🚀 빠른 시작

### 필수 요구사항
- Go 1.23 이상
- Node.js 18 이상
- make 명령어 지원

### 개발 환경 설정
```bash
# 저장소 클론
git clone <repository-url>
cd realworld-vibe-coding

# 의존성 설치 및 환경 설정
make setup

# 개발 서버 실행 (백엔드 + 프론트엔드)
make dev
```

### 개별 서버 실행
```bash
# 백엔드만 실행 (http://localhost:8080)
make dev-back

# 프론트엔드만 실행 (http://localhost:5173)
make dev-front
```

## 🏗️ 아키텍처

이 프로젝트는 모던 풀스택 아키텍처를 따릅니다:

### 백엔드 (Go)
- **언어**: Go 1.23+ (표준 라이브러리 중심)
- **HTTP 서버**: 표준 net/http + Gorilla Mux
- **데이터베이스**: SQLite (개발), PostgreSQL (운영)
- **인증**: JWT 기반 인증
- **아키텍처**: 클린 아키텍처 패턴

```
backend/
├── cmd/server/main.go          # 애플리케이션 진입점
├── internal/
│   ├── handler/                # HTTP 핸들러
│   ├── service/                # 비즈니스 로직
│   ├── repository/             # 데이터 액세스
│   ├── middleware/             # HTTP 미들웨어
│   ├── model/                  # 데이터 모델
│   ├── config/                 # 설정 관리
│   └── utils/                  # 유틸리티 함수
└── migrations/                 # 데이터베이스 마이그레이션
```

### 프론트엔드 (React + TypeScript)
- **프레임워크**: React 19 + Vite
- **언어**: TypeScript (strict 모드)
- **라우팅**: Tanstack Router
- **상태 관리**: Tanstack Query (서버 상태) + Zustand (클라이언트 상태)
- **스타일링**: Tailwind CSS
- **폼 관리**: React Hook Form + Zod

```
frontend/
├── src/
│   ├── pages/                  # 페이지 컴포넌트
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── Article/           # 게시글 관련 컴포넌트
│   │   ├── Layout/            # 레이아웃 컴포넌트
│   │   └── Common/            # 공통 컴포넌트
│   ├── stores/                 # Zustand 스토어
│   └── lib/                    # API 클라이언트 및 유틸리티
└── public/                     # 정적 파일
```

## 🛠️ 개발 명령어

### 프로젝트 관리
```bash
make setup          # 개발 환경 설정
make dev            # 개발 서버 실행 (백엔드 + 프론트엔드)
make build          # 프로덕션 빌드
make test           # 모든 테스트 실행
make lint           # 코드 품질 검사
make clean          # 빌드 파일 정리
```

### 백엔드 명령어
```bash
make dev-back       # 백엔드 개발 서버
make test-back      # 백엔드 테스트
cd backend && go run cmd/server/main.go  # 직접 실행
```

### 프론트엔드 명령어
```bash
make dev-front      # 프론트엔드 개발 서버
make test-front     # 프론트엔드 테스트
cd frontend && npm run dev      # 직접 실행
```

### 데이터베이스
```bash
make db-init        # 데이터베이스 초기화
```

## 📋 API 엔드포인트

이 프로젝트는 [RealWorld API 명세](https://realworld-docs.netlify.app/implementation-creation/api-implementation/)를 완전히 구현합니다:

### 인증
- `POST /api/users` - 사용자 등록
- `POST /api/users/login` - 로그인
- `GET /api/user` - 현재 사용자 조회
- `PUT /api/user` - 사용자 정보 수정

### 게시글
- `GET /api/articles` - 게시글 목록
- `GET /api/articles/feed` - 사용자 피드
- `GET /api/articles/{slug}` - 게시글 상세
- `POST /api/articles` - 게시글 작성
- `PUT /api/articles/{slug}` - 게시글 수정
- `DELETE /api/articles/{slug}` - 게시글 삭제
- `POST /api/articles/{slug}/favorite` - 좋아요
- `DELETE /api/articles/{slug}/favorite` - 좋아요 취소

### 댓글
- `GET /api/articles/{slug}/comments` - 댓글 목록
- `POST /api/articles/{slug}/comments` - 댓글 작성
- `DELETE /api/articles/{slug}/comments/{id}` - 댓글 삭제

### 프로필
- `GET /api/profiles/{username}` - 프로필 조회
- `POST /api/profiles/{username}/follow` - 팔로우
- `DELETE /api/profiles/{username}/follow` - 언팔로우

### 태그
- `GET /api/tags` - 태그 목록

## 🧪 테스트

이 프로젝트는 포괄적인 테스트 전략을 따릅니다:

### 백엔드 테스트
```bash
# 모든 백엔드 테스트 실행
make test-back

# 특정 패키지 테스트
cd backend && go test ./internal/handler/...

# 커버리지 포함 테스트
cd backend && go test -cover ./...
```

### 프론트엔드 테스트
```bash
# 모든 프론트엔드 테스트 실행
make test-front

# 감시 모드로 테스트
cd frontend && npm run test:watch
```

### 테스트 커버리지 목표
- 백엔드: 80% 이상
- 프론트엔드: 80% 이상

## 🎨 바이브코딩 원칙

이 프로젝트는 바이브코딩 방법론을 적용하여 개발되었습니다:

1. **빠른 프로토타이핑**: 핵심 기능 우선 구현
2. **반복적 개선**: 기능별 점진적 완성도 향상
3. **실시간 피드백**: 개발 과정 중 지속적 테스트
4. **문서화**: 코드와 함께 실시간 문서 작성
5. **단순함 우선**: 복잡한 패턴보다 명확하고 단순한 구조
6. **AI 협업 친화적**: 예측 가능하고 안정적인 생태계 활용

## 📊 프로젝트 현황

### 구현 완료
- ✅ 프로젝트 구조 설정
- ✅ 데이터베이스 스키마 설계
- ✅ 기본 HTTP 서버 및 미들웨어
- ✅ 사용자 인증 시스템 (JWT)
- ✅ 기본 사용자 API

### 진행 중
- 🚧 게시글 시스템 구현
- 🚧 댓글 시스템 구현
- 🚧 프론트엔드 컴포넌트 개발

### 예정
- 📋 프로필 및 팔로우 시스템
- 📋 UI/UX 완성 및 반응형 디자인
- 📋 테스트 구현 (80% 커버리지)
- 📋 성능 최적화
- 📋 CI/CD 파이프라인 구축

## 🚀 배포

### 개발 환경
- 백엔드: http://localhost:8080
- 프론트엔드: http://localhost:5173
- 데이터베이스: SQLite (로컬 파일)

### 프로덕션 배포 (계획)
- 플랫폼: AWS ECS + Fargate
- 데이터베이스: AWS RDS PostgreSQL
- CDN: AWS CloudFront
- CI/CD: GitHub Actions

## 📈 성능 목표

### 기능적 지표
- [x] RealWorld API 명세 준수
- [ ] 모든 사용자 스토리 구현
- [ ] 크로스 브라우저 호환성
- [ ] 모바일 반응형 완성도

### 기술적 지표
- [ ] 테스트 커버리지 80% 이상
- [ ] 빌드 시간 30초 이하
- [ ] 초기 로딩 시간 3초 이하
- [ ] 번들 크기 최적화

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📚 참고 자료

- [RealWorld 공식 문서](https://realworld-docs.netlify.app/)
- [Go 공식 문서](https://golang.org/doc/)
- [React 공식 문서](https://react.dev/)
- [바이브코딩 방법론](docs/pre-prd.md)

---

**바이브코딩으로 만들어진 RealWorld 구현체** ✨