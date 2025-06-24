# Frontend Development Scripts 🚀

프론트엔드 개발 시 기존 프로세스를 정리하고 새로운 개발 서버를 시작하는 스크립트 모음입니다.

## 📋 사용 가능한 명령어

### 🚀 개발 서버 시작

#### `npm run dev:fresh` ⭐ (추천)
기존 프로세스 정리 후 새로운 개발 서버 시작
```bash
npm run dev:fresh
```

#### `npm run dev:quick` ⚡
가장 빠른 정리 후 서버 시작 (minimal cleanup)
```bash
npm run dev:quick
```

#### `npm run dev:clean`
기존 스크립트 (구버전 호환성)
```bash
npm run dev:clean
```

### 🧹 프로세스 정리만

#### `npm run cleanup` ⭐ (추천)
기본 정리 (서버 시작 안 함)
```bash
npm run cleanup
```

#### `npm run cleanup:status`
상태 정보와 함께 정리
```bash
npm run cleanup:status
```

#### `npm run cleanup:verbose`
상세한 정보와 함께 정리
```bash
npm run cleanup:verbose
```

## 📁 스크립트 파일들

| 파일 | 용도 | 특징 |
|------|------|------|
| `dev-start.sh` | 종합 개발 서버 시작 | 정리 + 의존성 확인 + 서버 시작 |
| `quick-start.sh` | 빠른 서버 시작 | 최소한의 정리 + 서버 시작 |
| `cleanup.sh` | 프로세스 정리 전용 | 다양한 옵션 지원 |
| `cleanup-and-start.sh` | 기존 스크립트 | 호환성 유지 |
| `cleanup-only.sh` | 기존 스크립트 | 호환성 유지 |

## 🎯 정리되는 대상

### 포트별 정리
- **5173**: Vite 기본 개발 서버
- **5174**: Vite 대체 개발 서버  
- **3000**: 일반 개발 서버
- **4173**: Vite 프리뷰 서버
- **8080**: 백엔드 API 서버 (옵션)

### 프로세스별 정리
- Vite 개발 서버 프로세스
- npm/yarn dev 프로세스
- ESBuild 프로세스
- 기타 Node.js 프론트엔드 프로세스

## 🚀 사용 시나리오

### 일반적인 개발 시작
```bash
# 가장 추천하는 방법
npm run dev:fresh

# 빠른 시작이 필요한 경우
npm run dev:quick
```

### 포트 충돌 해결
```bash
# 상태 확인 후 정리
npm run cleanup:status

# 그 후 서버 시작
npm run dev
```

### 디버깅이 필요한 경우
```bash
# 상세한 정보와 함께 정리
npm run cleanup:verbose
```

### CI/CD 환경
```bash
# 기본 정리
npm run cleanup

# 서버 시작
npm run dev
```

## 🔧 스크립트 옵션

### cleanup.sh 옵션
```bash
# 기본 사용
./scripts/cleanup.sh

# 상태 정보 포함
./scripts/cleanup.sh --status

# 상세 정보 포함  
./scripts/cleanup.sh --verbose

# 도움말
./scripts/cleanup.sh --help
```

### dev-start.sh 옵션
```bash
# 기본 사용 (정리 + 서버 시작)
./scripts/dev-start.sh

# 정리만 실행
./scripts/dev-start.sh --cleanup-only
```

## 📊 출력 예시

### 성공적인 정리
```
🧹 Frontend Process Cleanup
============================
🔍 Checking port 5173 (Vite default)...
⚠️  Found processes on port 5173
✅ Successfully killed all processes on port 5173
🔍 Checking port 5174 (Vite alternative)...
✅ Port 5174 is free
🎉 Cleanup completed!

🚀 Starting development server...
   URL: http://localhost:5173
   Press Ctrl+C to stop
```

### 상태 정보 포함
```
📊 Current process status:
==========================
Port status:
  Port 5173: 2 process(es) ❌
  Port 5174: free ✅
  Port 3000: free ✅
  Port 4173: free ✅

Process status:
  Vite/Dev processes: 3
  ESBuild processes: 0
```

## ⚠️ 주의사항

1. **강제 종료**: `kill -9` 명령을 사용하므로 프로세스가 강제 종료됩니다
2. **데이터 저장**: 중요한 작업은 저장 후 실행하세요
3. **권한**: 실행 권한이 필요합니다 (`chmod +x scripts/*.sh`)
4. **플랫폼**: macOS/Linux 환경에 최적화되어 있습니다

## 🔍 트러블슈팅

### 권한 오류
```bash
chmod +x scripts/*.sh
```

### 수동 프로세스 확인
```bash
# 포트 사용 확인
lsof -i :5173

# 프로세스 확인
ps aux | grep vite
```

### 스크립트 실행 안됨
```bash
# 직접 실행
bash scripts/dev-start.sh

# 또는
./scripts/dev-start.sh
```

## 🛠️ 커스터마이징

### 추가 포트 정리
`cleanup.sh`나 `dev-start.sh`에서 포트 추가:
```bash
kill_port 3001 "Custom server"
```

### 추가 프로세스 패턴
```bash
kill_pattern "webpack|next" "Webpack/Next.js"
```

### 새로운 스크립트 추가
1. `scripts/` 디렉토리에 `.sh` 파일 생성
2. 실행 권한 부여: `chmod +x scripts/new-script.sh`
3. `package.json`에 스크립트 추가

## 📈 성능 비교

| 명령어 | 속도 | 정리 범위 | 추천 용도 |
|--------|------|-----------|-----------|
| `dev:quick` | ⚡⚡⚡ | 기본 | 빠른 재시작 |
| `dev:fresh` | ⚡⚡ | 포괄적 | 일반적 사용 |
| `cleanup:verbose` | ⚡ | 완전한 | 디버깅 |

## 💡 팁

1. **별칭 설정**: 자주 사용하는 명령어는 별칭으로 설정
   ```bash
   alias fdev="npm run dev:fresh"
   alias fclean="npm run cleanup"
   ```

2. **IDE 통합**: VS Code 등에서 Task로 등록하여 사용

3. **Git 훅**: pre-commit 훅에 cleanup 스크립트 포함 가능