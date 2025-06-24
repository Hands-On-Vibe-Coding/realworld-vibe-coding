#!/bin/bash

# ECS 배포 문제 즉시 해결 스크립트
# 이 스크립트는 deployment-fix-plan.md의 Phase 1을 구현합니다

set -euo pipefail

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 변수 설정
REGION="ap-northeast-2"
ENVIRONMENT="dev"
STACK_NAME="RealWorld-${ENVIRONMENT}-ECS"
ECR_REPO="realworld-backend-${ENVIRONMENT}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

echo -e "${YELLOW}🔧 ECS 배포 문제 해결 스크립트 시작${NC}"

# 1. CloudFormation 스택 상태 확인
echo -e "\n${YELLOW}1. CloudFormation 스택 상태 확인${NC}"
STACK_STATUS=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${REGION} --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")

if [[ "$STACK_STATUS" == "ROLLBACK_COMPLETE" || "$STACK_STATUS" == "CREATE_FAILED" || "$STACK_STATUS" == "UPDATE_FAILED" ]]; then
    echo -e "${RED}❌ 스택이 실패 상태입니다: $STACK_STATUS${NC}"
    echo -e "${YELLOW}🗑️  스택 삭제 시작...${NC}"
    aws cloudformation delete-stack --stack-name ${STACK_NAME} --region ${REGION}
    
    echo -e "${YELLOW}⏳ 스택 삭제 대기 중...${NC}"
    aws cloudformation wait stack-delete-complete --stack-name ${STACK_NAME} --region ${REGION} || true
    echo -e "${GREEN}✅ 스택 삭제 완료${NC}"
else
    echo -e "${GREEN}✅ 스택 상태: $STACK_STATUS${NC}"
fi

# 2. ECR 리포지토리 확인 및 생성
echo -e "\n${YELLOW}2. ECR 리포지토리 확인${NC}"
if aws ecr describe-repositories --repository-names ${ECR_REPO} --region ${REGION} >/dev/null 2>&1; then
    echo -e "${GREEN}✅ ECR 리포지토리가 이미 존재합니다${NC}"
else
    echo -e "${YELLOW}📦 ECR 리포지토리 생성 중...${NC}"
    aws ecr create-repository \
        --repository-name ${ECR_REPO} \
        --region ${REGION} \
        --image-scanning-configuration scanOnPush=true
    echo -e "${GREEN}✅ ECR 리포지토리 생성 완료${NC}"
fi

# 3. ECR 로그인
echo -e "\n${YELLOW}3. ECR 로그인${NC}"
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
echo -e "${GREEN}✅ ECR 로그인 성공${NC}"

# 4. 더미 이미지 푸시
echo -e "\n${YELLOW}4. 초기 이미지 푸시${NC}"
echo -e "${YELLOW}📥 nginx:alpine 이미지 다운로드 중...${NC}"
docker pull nginx:alpine

echo -e "${YELLOW}🏷️  이미지 태깅 중...${NC}"
docker tag nginx:alpine ${ECR_REGISTRY}/${ECR_REPO}:initial
docker tag nginx:alpine ${ECR_REGISTRY}/${ECR_REPO}:latest

echo -e "${YELLOW}📤 이미지 푸시 중...${NC}"
docker push ${ECR_REGISTRY}/${ECR_REPO}:initial
docker push ${ECR_REGISTRY}/${ECR_REPO}:latest
echo -e "${GREEN}✅ 초기 이미지 푸시 완료${NC}"

# 5. Secrets Manager 업데이트
echo -e "\n${YELLOW}5. Secrets Manager 업데이트${NC}"
SECRET_NAME="${ENVIRONMENT}/realworld/database"

# 현재 시크릿 값 가져오기
CURRENT_SECRET=$(aws secretsmanager get-secret-value --secret-id ${SECRET_NAME} --region ${REGION} --query SecretString --output text)

# JWT_SECRET 추가
if echo "$CURRENT_SECRET" | jq -e '.jwt_secret' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ JWT_SECRET이 이미 존재합니다${NC}"
else
    echo -e "${YELLOW}🔐 JWT_SECRET 추가 중...${NC}"
    # 임시 JWT 시크릿 생성
    JWT_SECRET=$(openssl rand -base64 32)
    
    # 기존 시크릿에 jwt_secret 추가
    UPDATED_SECRET=$(echo "$CURRENT_SECRET" | jq --arg jwt "$JWT_SECRET" '. + {jwt_secret: $jwt}')
    
    # 시크릿 업데이트
    aws secretsmanager update-secret \
        --secret-id ${SECRET_NAME} \
        --secret-string "$UPDATED_SECRET" \
        --region ${REGION}
    
    echo -e "${GREEN}✅ JWT_SECRET 추가 완료${NC}"
fi

# 6. 현재 서비스 상태 확인
echo -e "\n${YELLOW}6. ECS 서비스 상태 확인${NC}"
if aws ecs describe-services --cluster realworld-${ENVIRONMENT} --services realworld-backend-${ENVIRONMENT} --region ${REGION} >/dev/null 2>&1; then
    SERVICE_STATUS=$(aws ecs describe-services \
        --cluster realworld-${ENVIRONMENT} \
        --services realworld-backend-${ENVIRONMENT} \
        --region ${REGION} \
        --query 'services[0].status' \
        --output text)
    
    echo -e "서비스 상태: ${SERVICE_STATUS}"
    
    if [[ "$SERVICE_STATUS" == "ACTIVE" ]]; then
        echo -e "${YELLOW}🔄 서비스를 일시적으로 중지합니다...${NC}"
        aws ecs update-service \
            --cluster realworld-${ENVIRONMENT} \
            --service realworld-backend-${ENVIRONMENT} \
            --desired-count 0 \
            --region ${REGION}
        
        sleep 10
        echo -e "${GREEN}✅ 서비스 중지 완료${NC}"
    fi
fi

# 7. 디버깅 정보 출력
echo -e "\n${YELLOW}7. 디버깅 정보${NC}"
echo -e "${GREEN}📋 다음 정보를 확인하세요:${NC}"
echo -e "- ECR 리포지토리: ${ECR_REGISTRY}/${ECR_REPO}"
echo -e "- 초기 이미지: ${ECR_REGISTRY}/${ECR_REPO}:initial"
echo -e "- CloudFormation 스택: ${STACK_NAME}"
echo -e "- Secrets Manager: ${SECRET_NAME}"

echo -e "\n${GREEN}✅ 스크립트 실행 완료!${NC}"
echo -e "${YELLOW}📌 다음 단계:${NC}"
echo -e "1. CDK를 다시 배포하세요: cd infrastructure && cdk deploy RealWorld-${ENVIRONMENT}-ECS"
echo -e "2. GitHub Actions를 다시 실행하세요"
echo -e "3. 문제가 지속되면 docs/deployment-fix-plan.md의 Phase 2를 진행하세요"

# 8. 추가 디버깅 명령어 제공
echo -e "\n${YELLOW}🔍 유용한 디버깅 명령어:${NC}"
cat << 'EOF'
# ECS 태스크 로그 확인
aws logs tail /ecs/realworld-backend-dev --follow

# 최근 실패한 태스크 확인
aws ecs list-tasks --cluster realworld-dev --desired-status STOPPED --region ap-northeast-2

# 태스크 실패 이유 확인
TASK_ARN=$(aws ecs list-tasks --cluster realworld-dev --desired-status STOPPED --region ap-northeast-2 --query 'taskArns[0]' --output text)
aws ecs describe-tasks --cluster realworld-dev --tasks $TASK_ARN --region ap-northeast-2 --query 'tasks[0].stoppedReason'
EOF