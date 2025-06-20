#!/bin/bash

# RealWorld Application Production Deployment Script
# This script builds Docker images and pushes them to ECR

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
AWS_REGION=${AWS_REGION:-"us-east-1"}
ECR_REGISTRY=${ECR_REGISTRY:-""}
IMAGE_TAG=${IMAGE_TAG:-"latest"}
BUILD_TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker daemon."
        exit 1
    fi
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        log_error "jq is not installed. Please install it first."
        exit 1
    fi
    
    log_info "All prerequisites are met."
}

setup_aws_credentials() {
    log_info "Setting up AWS credentials..."
    
    # Check if AWS credentials are configured
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    log_info "AWS credentials are configured."
}

create_ecr_repositories() {
    log_info "Creating ECR repositories if they don't exist..."
    
    local repositories=("realworld-backend" "realworld-frontend")
    
    for repo in "${repositories[@]}"; do
        if ! aws ecr describe-repositories --repository-names "$repo" --region "$AWS_REGION" &> /dev/null; then
            log_info "Creating ECR repository: $repo"
            aws ecr create-repository \
                --repository-name "$repo" \
                --region "$AWS_REGION" \
                --image-scanning-configuration scanOnPush=true \
                --encryption-configuration encryptionType=AES256
        else
            log_info "ECR repository $repo already exists."
        fi
    done
}

get_ecr_login() {
    log_info "Logging in to ECR..."
    
    # Get ECR registry URI
    ECR_REGISTRY=$(aws ecr describe-registry --region "$AWS_REGION" --query 'registryId' --output text).dkr.ecr.${AWS_REGION}.amazonaws.com
    
    # Login to ECR
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
    
    log_info "Successfully logged in to ECR: $ECR_REGISTRY"
}

build_and_push_backend() {
    log_info "Building backend Docker image..."
    
    local backend_image="$ECR_REGISTRY/realworld-backend:$IMAGE_TAG"
    local backend_image_with_timestamp="$ECR_REGISTRY/realworld-backend:$BUILD_TIMESTAMP"
    
    # Build the backend image
    docker build -t realworld-backend:$IMAGE_TAG ./backend
    
    # Tag for ECR
    docker tag realworld-backend:$IMAGE_TAG "$backend_image"
    docker tag realworld-backend:$IMAGE_TAG "$backend_image_with_timestamp"
    
    # Push to ECR
    log_info "Pushing backend image to ECR..."
    docker push "$backend_image"
    docker push "$backend_image_with_timestamp"
    
    log_info "Backend image pushed successfully!"
}

build_and_push_frontend() {
    log_info "Building frontend Docker image..."
    
    local frontend_image="$ECR_REGISTRY/realworld-frontend:$IMAGE_TAG"
    local frontend_image_with_timestamp="$ECR_REGISTRY/realworld-frontend:$BUILD_TIMESTAMP"
    
    # Build the frontend image (production target)
    docker build -t realworld-frontend:$IMAGE_TAG --target production ./frontend
    
    # Tag for ECR
    docker tag realworld-frontend:$IMAGE_TAG "$frontend_image"
    docker tag realworld-frontend:$IMAGE_TAG "$frontend_image_with_timestamp"
    
    # Push to ECR
    log_info "Pushing frontend image to ECR..."
    docker push "$frontend_image"
    docker push "$frontend_image_with_timestamp"
    
    log_info "Frontend image pushed successfully!"
}

run_tests() {
    log_info "Running tests before deployment..."
    
    # Run backend tests
    log_info "Running backend tests..."
    cd backend
    go test ./... || {
        log_error "Backend tests failed!"
        exit 1
    }
    cd ..
    
    # Run frontend tests
    log_info "Running frontend tests..."
    cd frontend
    npm test -- --run || {
        log_error "Frontend tests failed!"
        exit 1
    }
    cd ..
    
    log_info "All tests passed!"
}

cleanup_local_images() {
    log_info "Cleaning up local images..."
    
    # Remove local images to save space
    docker rmi realworld-backend:$IMAGE_TAG 2>/dev/null || true
    docker rmi realworld-frontend:$IMAGE_TAG 2>/dev/null || true
    
    # Remove dangling images
    docker image prune -f
    
    log_info "Local cleanup completed."
}

update_ecs_services() {
    log_info "Updating ECS services..."
    
    # Check if ECS cluster exists
    if ! aws ecs describe-clusters --clusters realworld-cluster --region "$AWS_REGION" &> /dev/null; then
        log_warn "ECS cluster 'realworld-cluster' not found. Skipping ECS update."
        return
    fi
    
    # Update backend service
    if aws ecs describe-services --cluster realworld-cluster --services realworld-backend --region "$AWS_REGION" &> /dev/null; then
        log_info "Updating backend ECS service..."
        aws ecs update-service \
            --cluster realworld-cluster \
            --service realworld-backend \
            --force-new-deployment \
            --region "$AWS_REGION" > /dev/null
    else
        log_warn "Backend ECS service not found. Skipping backend service update."
    fi
    
    # Update frontend service
    if aws ecs describe-services --cluster realworld-cluster --services realworld-frontend --region "$AWS_REGION" &> /dev/null; then
        log_info "Updating frontend ECS service..."
        aws ecs update-service \
            --cluster realworld-cluster \
            --service realworld-frontend \
            --force-new-deployment \
            --region "$AWS_REGION" > /dev/null
    else
        log_warn "Frontend ECS service not found. Skipping frontend service update."
    fi
    
    log_info "ECS services update initiated."
}

wait_for_deployment() {
    log_info "Waiting for deployment to complete..."
    
    # Check if services exist before waiting
    local services=()
    
    if aws ecs describe-services --cluster realworld-cluster --services realworld-backend --region "$AWS_REGION" &> /dev/null; then
        services+=("realworld-backend")
    fi
    
    if aws ecs describe-services --cluster realworld-cluster --services realworld-frontend --region "$AWS_REGION" &> /dev/null; then
        services+=("realworld-frontend")
    fi
    
    if [ ${#services[@]} -eq 0 ]; then
        log_warn "No ECS services found. Skipping deployment wait."
        return
    fi
    
    for service in "${services[@]}"; do
        log_info "Waiting for $service to be stable..."
        aws ecs wait services-stable \
            --cluster realworld-cluster \
            --services "$service" \
            --region "$AWS_REGION"
        log_info "$service deployment completed!"
    done
}

show_deployment_status() {
    log_info "Deployment Summary:"
    echo "===================="
    echo "Build Timestamp: $BUILD_TIMESTAMP"
    echo "Image Tag: $IMAGE_TAG"
    echo "ECR Registry: $ECR_REGISTRY"
    echo "AWS Region: $AWS_REGION"
    echo ""
    
    if aws ecs describe-services --cluster realworld-cluster --services realworld-backend realworld-frontend --region "$AWS_REGION" &> /dev/null; then
        log_info "ECS Services Status:"
        aws ecs describe-services \
            --cluster realworld-cluster \
            --services realworld-backend realworld-frontend \
            --region "$AWS_REGION" \
            --query 'services[*].{Name:serviceName,Status:status,Running:runningCount,Desired:desiredCount}' \
            --output table
    else
        log_warn "ECS cluster not found or services not configured."
    fi
}

main() {
    log_info "Starting RealWorld application deployment..."
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --region)
                AWS_REGION="$2"
                shift 2
                ;;
            --tag)
                IMAGE_TAG="$2"
                shift 2
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --region REGION    AWS region (default: us-east-1)"
                echo "  --tag TAG         Docker image tag (default: latest)"
                echo "  --skip-tests      Skip running tests"
                echo "  --help            Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_prerequisites
    setup_aws_credentials
    
    if [[ "$SKIP_TESTS" != "true" ]]; then
        run_tests
    fi
    
    get_ecr_login
    create_ecr_repositories
    
    build_and_push_backend
    build_and_push_frontend
    
    cleanup_local_images
    
    update_ecs_services
    wait_for_deployment
    
    show_deployment_status
    
    log_info "Deployment completed successfully! 🎉"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi