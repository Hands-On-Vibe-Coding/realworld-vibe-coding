# ECS 배포 문제 해결 계획

## 현재 상황 요약

### 문제점
1. **반복적인 배포 실패**: ECS 서비스가 3시간 타임아웃으로 실패
2. **태스크 시작 실패**: JWT_SECRET 누락으로 인한 ResourceInitializationError
3. **인프라 불일치**: CDK 코드와 실제 AWS 리소스 간 불일치
4. **복잡한 의존성**: 여러 스택 간 순환 의존성 문제

### 근본 원인
1. ECR 이미지가 없는 상태에서 ECS 서비스 시작 시도
2. Secrets Manager 설정과 애플리케이션 요구사항 불일치
3. 너무 짧은 헬스체크 유예 기간
4. 배포 순서 문제 (인프라 → 이미지 → 서비스)

## 해결 전략

### Phase 1: 즉시 수정 (30분)

#### 1.1 기존 리소스 정리
```bash
# 실패한 스택 수동 삭제
aws cloudformation delete-stack --stack-name RealWorld-dev-ECS --region ap-northeast-2

# ECR 리포지토리 확인 및 생성
aws ecr describe-repositories --repository-names realworld-backend-dev --region ap-northeast-2 || \
aws ecr create-repository --repository-name realworld-backend-dev --region ap-northeast-2
```

#### 1.2 더미 이미지 푸시
```bash
# nginx 이미지를 사용한 임시 이미지 푸시
docker pull nginx:alpine
docker tag nginx:alpine $ECR_REGISTRY/realworld-backend-dev:latest
docker push $ECR_REGISTRY/realworld-backend-dev:latest
```

#### 1.3 JWT Secret 추가
```bash
# 기존 시크릿 업데이트
aws secretsmanager update-secret \
  --secret-id dev/realworld/database \
  --secret-string '{"password":"...", "jwt_secret":"temporary-secret-key"}' \
  --region ap-northeast-2
```

### Phase 2: CDK 코드 수정 (1시간)

#### 2.1 ECS 스택 개선
```typescript
// ecs-stack.ts 수정사항
1. desiredCount를 조건부로 설정
2. 이미지 존재 여부 확인 로직 추가
3. 배포 circuit breaker 활성화
4. 명시적 의존성 설정
```

#### 2.2 배포 순서 개선
```typescript
// infrastructure.ts에서 명시적 의존성 추가
ecsStack.addDependency(databaseStack);
ecsStack.node.addDependency(networkStack);
```

#### 2.3 환경 변수 정리
```typescript
// 모든 필수 환경 변수를 명시적으로 설정
const requiredEnvVars = {
  DATABASE_URL: constructDatabaseUrl(),
  JWT_SECRET: getJwtSecret(),
  ENVIRONMENT: environment,
};
```

### Phase 3: 워크플로우 개선 (30분)

#### 3.1 단계별 배포 전략
```yaml
# backend-deploy.yml 수정
1. 인프라 배포 (ECR 포함)
2. 이미지 빌드 및 푸시
3. 서비스 업데이트 (desiredCount 설정)
4. 헬스체크 및 검증
```

#### 3.2 실패 시 롤백 전략
```yaml
# 자동 롤백 및 알림 추가
on-failure:
  - rollback-to-previous
  - notify-slack
  - create-issue
```

### Phase 4: 모니터링 및 디버깅 (30분)

#### 4.1 CloudWatch 대시보드 생성
- ECS 서비스 메트릭
- 태스크 실패 이유
- 컨테이너 로그

#### 4.2 디버깅 스크립트 작성
```bash
# debug-ecs.sh
#!/bin/bash
echo "=== ECS Service Status ==="
aws ecs describe-services --cluster $CLUSTER --services $SERVICE

echo "=== Recent Tasks ==="
aws ecs list-tasks --cluster $CLUSTER --service-name $SERVICE

echo "=== Task Failures ==="
# 실패한 태스크 상세 정보
```

## 실행 계획

### 즉시 실행 (우선순위 1)
1. [ ] 실패한 CloudFormation 스택 삭제
2. [ ] ECR에 더미 이미지 푸시
3. [ ] Secrets Manager에 JWT_SECRET 추가
4. [ ] CDK 재배포

### 단기 개선 (우선순위 2)
1. [ ] CDK 코드의 조건부 로직 개선
2. [ ] 헬스체크 설정 최적화
3. [ ] 배포 워크플로우 단계 분리

### 장기 개선 (우선순위 3)
1. [ ] 블루/그린 배포 전략 구현
2. [ ] 자동 롤백 메커니즘
3. [ ] 종합 모니터링 대시보드

## 검증 체크리스트

### 배포 전
- [ ] ECR 리포지토리 존재 확인
- [ ] Secrets Manager 키 확인
- [ ] VPC/서브넷 연결성 확인

### 배포 중
- [ ] CloudFormation 이벤트 모니터링
- [ ] ECS 태스크 상태 확인
- [ ] 컨테이너 로그 확인

### 배포 후
- [ ] 헬스 엔드포인트 응답 확인
- [ ] 데이터베이스 연결 확인
- [ ] API 기본 동작 테스트

## 대안 솔루션

### 옵션 1: 단순화된 배포
- EC2 + Docker Compose 사용
- 복잡도 감소, 디버깅 용이

### 옵션 2: App Runner 사용
- 완전 관리형 서비스
- 자동 스케일링 및 배포

### 옵션 3: EKS 마이그레이션
- Kubernetes 기반
- 더 많은 제어 및 유연성

## 성공 기준

1. **기술적 성공**
   - ECS 서비스가 ACTIVE 상태 유지
   - 태스크가 RUNNING 상태 유지
   - 헬스체크 통과

2. **운영적 성공**
   - 5분 이내 배포 완료
   - 자동 롤백 가능
   - 로그 기반 디버깅 가능

## 다음 단계

1. **즉시**: Phase 1 실행하여 배포 성공시키기
2. **오늘 중**: Phase 2-3 구현하여 안정성 확보
3. **이번 주**: Phase 4 구현하여 운영 준비 완료

## 참고 자료

- [AWS ECS Troubleshooting Guide](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/troubleshooting.html)
- [CDK Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)
- [Container Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights.html)