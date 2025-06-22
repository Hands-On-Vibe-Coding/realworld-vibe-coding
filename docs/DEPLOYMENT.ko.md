# 배포 가이드

이 문서는 RealWorld 애플리케이션 배포에 대한 상세한 지침을 제공합니다.

## 아키텍처 개요

애플리케이션은 하이브리드 배포 전략을 사용합니다:

- **프론트엔드**: GitHub Pages (정적 사이트)
- **백엔드**: AWS ECS with Fargate (컨테이너화된 API)
- **데이터베이스**: AWS RDS PostgreSQL
- **인프라**: AWS CDK (TypeScript)

## 필수 요구사항

### 1. GitHub 저장소 설정

저장소에 다음 시크릿이 구성되어 있는지 확인하세요:

```
AWS_ROLE_ARN: arn:aws:iam::931016744724:role/GitHubActionsRole
AWS_REGION: ap-northeast-2
```

### 2. AWS CLI 구성

적절한 자격 증명으로 AWS CLI를 설치하고 구성하세요:

```bash
aws configure
```

### 3. 필요한 도구

- **Node.js 18+** 및 npm
- **AWS CDK v2**: `npm install -g aws-cdk`
- **Docker** (로컬 테스트용)
- **Go 1.21+** (백엔드 개발용)

## 초기 설정

### 1. AWS OIDC 인증

제공된 스크립트를 실행하여 GitHub Actions 인증을 설정하세요:

```bash
./scripts/setup-oidc.sh
```

이는 다음을 생성합니다:
- OIDC Identity Provider
- GitHub Actions용 IAM 역할
- ECR, ECS 및 기타 AWS 서비스에 필요한 정책

### 2. 인프라 배포

AWS 인프라 스택을 순서대로 배포하세요:

```bash
cd infrastructure

# 의존성 설치
npm install

# CDK 부트스트랩 (일회성 설정)
npx cdk bootstrap

# 개발환경용 모든 스택 배포
npm run deploy:dev

# 또는 운영환경용 배포
npm run deploy:prod
```

배포는 다음을 생성합니다:
- **NetworkStack**: VPC, 서브넷, 보안 그룹
- **DatabaseStack**: RDS PostgreSQL 인스턴스
- **ECSStack**: ECS 클러스터, ALB, 태스크 정의
- **MonitoringStack**: CloudWatch 대시보드 및 알람

## 배포 워크플로우

### 프론트엔드 배포 (자동)

다음 경우에 프론트엔드가 GitHub Pages에 자동으로 배포됩니다:

- `main` 브랜치에 코드 푸시
- `frontend/**` 디렉터리 변경
- 워크플로우 파일 `.github/workflows/frontend-deploy.yml` 수정

**프로세스:**
1. 의존성 설치
2. 테스트 및 린팅 실행
3. 올바른 기본 경로로 운영용 빌드
4. GitHub Pages에 배포

**URL**: https://dohyunjung.github.io/realworld-vibe-coding/

### 백엔드 배포 (자동)

다음 경우에 백엔드가 AWS ECS에 자동으로 배포됩니다:

- `main` 브랜치에 코드 푸시
- `backend/**` 디렉터리 변경
- 인프라 변경
- 워크플로우 파일 `.github/workflows/backend-deploy.yml` 수정

**프로세스:**
1. Go 테스트 및 코드 품질 검사 실행
2. linux/amd64용 Docker 이미지 빌드
3. Amazon ECR에 이미지 푸시
4. ECS 태스크 정의 업데이트
5. ECS 서비스에 배포
6. 헬스 체크 검증
7. 오래된 ECR 이미지 정리

## 수동 배포

### 백엔드 수동 빌드 및 푸시

```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin \
  931016744724.dkr.ecr.ap-northeast-2.amazonaws.com

# 이미지 빌드
docker build -t realworld-backend ./backend

# ECR용 태그
docker tag realworld-backend:latest \
  931016744724.dkr.ecr.ap-northeast-2.amazonaws.com/realworld-backend:latest

# ECR에 푸시
docker push 931016744724.dkr.ecr.ap-northeast-2.amazonaws.com/realworld-backend:latest

# ECS 서비스 업데이트
aws ecs update-service \
  --cluster realworld-dev-cluster \
  --service realworld-dev-service \
  --force-new-deployment
```

### 프론트엔드 수동 빌드 및 배포

```bash
cd frontend

# 의존성 설치
npm install

# GitHub Pages용 빌드
VITE_BASE_URL=/realworld-vibe-coding/ npm run build

# 배포 (main 브랜치에 커밋하면 자동 배포됨)
git add dist/
git commit -m "feat: manual frontend deployment"
git push origin main
```

## 환경 구성

### 개발 환경

**프론트엔드:**
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_BASE_URL=/
```

**백엔드:**
```bash
PORT=8080
DATABASE_URL=realworld.db
JWT_SECRET=dev-secret-key
ENVIRONMENT=development
```

### 운영 환경

**프론트엔드:**
```bash
VITE_API_BASE_URL=http://realworld-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
VITE_BASE_URL=/realworld-vibe-coding/
```

**백엔드 (ECS 태스크 정의를 통해):**
```bash
PORT=8080
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/realworld
JWT_SECRET=<from-secrets-manager>
ENVIRONMENT=production
```

## 모니터링 및 디버깅

### CloudWatch 로그

```bash
# ECS 태스크 로그 보기
aws logs tail /aws/ecs/realworld-dev --follow

# 특정 로그 그룹 보기
aws logs describe-log-groups --log-group-name-prefix "/aws/ecs/realworld"
```

### 헬스 체크

**프론트엔드:** https://dohyunjung.github.io/realworld-vibe-coding/

**백엔드:** http://ALB_DNS_NAME/health

### 일반적인 문제

1. **ECS 태스크가 시작되지 않음**
   - ECR 이미지가 존재하는지 확인
   - 태스크 정의 구성 검증
   - CloudWatch 로그 검토

2. **데이터베이스 연결 문제**
   - 보안 그룹이 ECS → RDS 통신을 허용하는지 확인
   - Secrets Manager에서 데이터베이스 자격 증명 검증
   - VPC 및 서브넷 구성 확인

3. **프론트엔드 API 호출 실패**
   - 백엔드의 CORS 구성 검증
   - VITE_API_BASE_URL 환경 변수 확인
   - ALB 보안 그룹이 HTTP 트래픽을 허용하는지 확인

## 비용 관리

### 개발 환경

- ECS: 2개 태스크 × t3.micro 상당
- RDS: db.t3.micro 인스턴스
- ALB: 표준 로드 밸런서
- **예상 비용**: ~월 $50-70

### 운영 환경

- ECS: 2-4개 태스크 × t3.small 상당
- RDS: Multi-AZ를 사용한 db.t3.small
- ALB: 높은 트래픽을 가진 표준 로드 밸런서
- **예상 비용**: ~월 $120-150

### 비용 최적화

1. **자동 스케일링**: CPU/메모리 기반 ECS 태스크 스케일
2. **이미지 정리**: 오래된 ECR 이미지 자동 삭제
3. **개발 환경 종료**: 필요하지 않을 때 개발 환경에 `npx cdk destroy` 사용

## 보안 고려사항

1. **IAM 역할**: OIDC를 사용한 최소 권한
2. **VPC 보안**: 모든 리소스가 프라이빗 서브넷에 위치
3. **데이터베이스**: 저장 시 암호화, Secrets Manager의 자격 증명
4. **컨테이너 보안**: 비루트 사용자, 최소 Alpine 이미지
5. **HTTPS**: CloudFront/ALB가 SSL 종료 처리

## 롤백 절차

### 백엔드 롤백

```bash
# 최근 태스크 정의 목록
aws ecs list-task-definitions --family-prefix realworld-dev-task

# 이전 태스크 정의로 서비스 업데이트
aws ecs update-service \
  --cluster realworld-dev-cluster \
  --service realworld-dev-service \
  --task-definition realworld-dev-task:PREVIOUS_REVISION
```

### 프론트엔드 롤백

```bash
# 이전 커밋으로 되돌리기
git revert HEAD
git push origin main

# GitHub Actions가 자동으로 재배포
```

## 문제 해결 명령어

```bash
# ECS 서비스 상태 확인
aws ecs describe-services \
  --cluster realworld-dev-cluster \
  --services realworld-dev-service

# 실행 중인 태스크 목록
aws ecs list-tasks \
  --cluster realworld-dev-cluster \
  --service-name realworld-dev-service

# 태스크 세부 정보 설명
aws ecs describe-tasks \
  --cluster realworld-dev-cluster \
  --tasks TASK_ID

# ALB 대상 헬스 확인
aws elbv2 describe-target-health \
  --target-group-arn TARGET_GROUP_ARN

# 데이터베이스 상태 보기
aws rds describe-db-instances \
  --db-instance-identifier realworld-dev
```

## 지원

배포 문제에 대해서는:

1. GitHub Actions 로그 확인
2. CloudWatch 로그 검토
3. AWS 리소스 상태 확인
4. 이 문서 참조
5. 자세한 문제 해결을 위해 인프라 README 확인