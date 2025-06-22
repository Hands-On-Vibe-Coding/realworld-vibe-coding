# Git 훅 문서

이 문서는 RealWorld Vibe Coding 프로젝트의 git 훅 구성에 대해 설명하며, 커밋 전 자동화된 린팅 및 테스트를 통해 코드 품질을 보장합니다.

## 개요

프로젝트는 Husky를 사용하여 자동화된 린팅 및 테스트 워크플로우와 함께 git 훅을 관리합니다. pre-commit 훅은 변경사항을 커밋하려고 할 때마다 실행되어, 적절히 포맷팅되고 테스트된 코드만 저장소에 들어가도록 보장합니다.

## Pre-commit 훅 구성

### 위치
- **Husky 구성**: `.husky/pre-commit`
- **패키지 구성**: `package.json` (lint-staged 섹션)

### 워크플로우

Pre-commit 훅은 다음 순서를 따릅니다:

1. **린팅 및 포맷팅** (lint-staged를 통해)
   - 프론트엔드 파일 (`*.ts`, `*.tsx`, `*.js`, `*.jsx`): ESLint 자동 수정과 함께 실행
   - 백엔드 파일 (`*.go`): `go fmt` 및 `go vet` 실행

2. **조건부 테스트**
   - 코드베이스의 어떤 부분이 변경되었는지 감지
   - 프론트엔드 파일이 변경된 경우에만 프론트엔드 테스트 실행
   - 백엔드 파일이 변경된 경우에만 백엔드 테스트 실행
   - 코드 변경이 감지되지 않으면 테스트 건너뛰기

### 지원되는 파일 유형

#### 프론트엔드
- **확장자**: `.ts`, `.tsx`, `.js`, `.jsx`
- **경로**: `frontend/src/**/*`
- **작업**: 
  - 자동 수정과 함께 린팅: `npm run lint:fix`
  - 테스트: `npm run test` (Vitest)

#### 백엔드
- **확장자**: `.go`
- **경로**: `backend/**/*`
- **작업**:
  - 포맷팅: `go fmt`
  - 린팅: `go vet`
  - 테스트: `go test ./...`

## 명령어 참조

### 루트 레벨 명령어
```bash
# 모든 린팅 실행 (프론트엔드 + 백엔드)
npm run lint

# 모든 테스트 실행 (프론트엔드 + 백엔드)
npm run test

# 모든 빌드 실행 (프론트엔드 + 백엔드)
npm run build
```

### 프론트엔드 특화
```bash
cd frontend
npm run lint        # ESLint 검사
npm run lint:fix    # ESLint 자동 수정
npm run test        # Vitest 테스트
npm run build       # 운영용 빌드
```

### 백엔드 특화
```bash
cd backend
go fmt ./...        # Go 코드 포맷팅
go vet ./...        # Go 정적 분석
go test ./...       # Go 테스트 실행
go build -o server cmd/server/main.go  # 바이너리 빌드
```

## 훅 동작

### 성공적인 커밋 플로우
1. 🔍 Pre-commit 검사 시작
2. 📝 Lint-staged 실행 (포맷팅/린팅)
3. 🧪 테스트 실행 (코드 변경이 감지된 경우)
4. ✅ 커밋 진행

### 실패한 커밋 플로우
- 린팅 실패 시: 커밋 차단, 파일이 자동 수정될 수 있음
- 테스트 실패 시: 커밋 차단, 수동 수정 필요
- 포맷팅 실패 시: 커밋 차단, 수동 수정 필요

### 테스트 건너뛰기 시나리오
코드가 아닌 파일만 변경된 경우 (예: 문서, 구성), 테스트는 "ℹ️ 코드 변경이 감지되지 않아 테스트를 건너뜁니다." 메시지와 함께 건너뛰어집니다.

## 구성 파일

### package.json
```json
{
  "lint-staged": {
    "frontend/src/**/*.{js,jsx,ts,tsx}": [
      "cd frontend && npm run lint:fix"
    ],
    "backend/**/*.go": [
      "cd backend && go fmt ./...",
      "cd backend && go vet ./..."
    ]
  }
}
```

### .husky/pre-commit
```bash
#!/usr/bin/env sh
echo "🔍 Running pre-commit checks..."

# 린팅 및 포맷팅을 위한 lint-staged 실행
echo "📝 Running linting and formatting..."
npx lint-staged

# 변경된 파일을 기반으로 한 조건부 테스트
if git diff --cached --name-only | grep -E "(frontend/.*\.(ts|tsx|js|jsx)|backend/.*\.go)$" > /dev/null; then
  echo "🧪 Running tests..."
  
  # 프론트엔드 파일이 변경된 경우 프론트엔드 테스트
  if git diff --cached --name-only | grep "frontend/" > /dev/null; then
    echo "🔍 Running frontend tests..."
    npm run test:frontend
  fi
  
  # 백엔드 파일이 변경된 경우 백엔드 테스트
  if git diff --cached --name-only | grep "backend/" > /dev/null; then
    echo "🔍 Running backend tests..."
    npm run test:backend
  fi
else
  echo "ℹ️  No code changes detected, skipping tests."
fi

echo "✅ Pre-commit checks passed!"
```

## 문제 해결

### 일반적인 문제

1. **테스트 실패**: 커밋하기 전에 실패한 테스트를 수정하세요
2. **린팅 오류**: `npm run lint`를 실행하여 모든 문제를 확인하세요. 일부는 자동 수정될 수 있습니다
3. **Go 포맷팅 문제**: 백엔드 디렉터리에서 `go fmt ./...`를 실행하세요
4. **Husky가 설치되지 않음**: `npm run prepare`를 실행하여 Husky를 설정하세요

### 훅 우회하기 (권장하지 않음)
```bash
# pre-commit 훅 건너뛰기 (긴급 상황에만)
git commit --no-verify -m "commit message"
```

### 훅 재설치
```bash
# 훅 제거 및 재설치
rm -rf .husky
npm run prepare
```

## 모범 사례

1. **로컬에서 테스트 실행** - 문제를 조기에 발견하기 위해 커밋 전에 테스트를 실행하세요
2. **의미 있는 커밋 메시지 사용** - 변경사항을 설명하는 메시지를 작성하세요
3. **집중된 커밋 유지** - 단일 기능이나 수정에 집중하세요
4. **훅 건너뛰지 않기** - 절대적으로 필요한 경우가 아니면 훅을 건너뛰지 마세요
5. **린팅 문제 수정** - 우회하기보다는 린팅 문제를 수정하세요

## 성능 고려사항

- 테스트는 변경된 파일 유형(프론트엔드/백엔드)에 대해서만 실행됩니다
- Lint-staged는 스테이지된 파일만 처리합니다
- 가능한 경우 병렬 실행
- 코드 변경이 없을 때 조기 종료

이 구성은 지능적인 선택적 테스트 및 포맷팅을 통해 개발자 생산성을 유지하면서 높은 코드 품질을 보장합니다.