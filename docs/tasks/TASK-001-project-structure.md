# TASK-001: 프로젝트 구조 설정

**Status**: `pending`
**Priority**: `high`
**Estimated Time**: 4-6 hours
**Sprint**: Sprint 1

## Description
Go 백엔드와 React 프론트엔드의 기본 프로젝트 구조를 생성하고 개발 환경을 설정합니다.

## Background
RealWorld 애플리케이션 구현을 위한 기반 구조를 마련해야 합니다. 백엔드는 Go 표준 라이브러리를 사용하고, 프론트엔드는 React + Vite를 사용하여 모던한 개발 환경을 구축합니다.

## Acceptance Criteria
- [ ] 백엔드 Go 프로젝트 구조 생성
- [ ] 프론트엔드 React + Vite 프로젝트 구조 생성
- [ ] Makefile 개발 환경 설정
- [ ] 기본 패키지 의존성 설정
- [ ] 개발 서버 실행 확인
- [ ] 프로젝트 문서 업데이트

## Technical Details

### 백엔드 구조
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

### 프론트엔드 구조
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── Layout/
│   │   ├── Article/
│   │   ├── Comment/
│   │   ├── Profile/
│   │   └── Common/
│   ├── pages/
│   ├── stores/
│   ├── lib/
│   ├── hooks/
│   └── types/
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Makefile 구조
```makefile
# 개발 환경 설정
setup:
	cd backend && go mod init realworld-backend
	cd frontend && npm create vite@latest . --template react-ts

# 개발 서버 실행
dev:
	make dev-back & make dev-front

dev-back:
	cd backend && go run cmd/server/main.go

dev-front:
	cd frontend && npm run dev
```

## Dependencies
- None

## Notes
- Go 1.21+ 사용
- Node.js 18+ 사용
- 바이브코딩 원칙에 따라 단순한 구조로 시작

## Definition of Done
- [ ] 백엔드 프로젝트 구조 생성 완료
- [ ] 프론트엔드 프로젝트 구조 생성 완료
- [ ] Makefile 개발 명령어 동작 확인
- [ ] 개발 서버 실행 및 접속 확인
- [ ] README.md 업데이트