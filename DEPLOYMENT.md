# Deployment Guide

This document provides detailed instructions for deploying the RealWorld application.

## Architecture Overview

The application uses a hybrid deployment strategy:

- **Frontend**: GitHub Pages (Static Site)
- **Backend**: AWS ECS with Fargate (Containerized API)
- **Database**: AWS RDS PostgreSQL
- **Infrastructure**: AWS CDK (TypeScript)

## Prerequisites

### 1. GitHub Repository Setup

Ensure your repository has the following secrets configured:

```
AWS_ROLE_ARN: arn:aws:iam::931016744724:role/GitHubActionsRole
AWS_REGION: us-east-1
```

### 2. AWS CLI Configuration

Install and configure AWS CLI with appropriate credentials:

```bash
aws configure
```

### 3. Required Tools

- **Node.js 18+** and npm
- **AWS CDK v2**: `npm install -g aws-cdk`
- **Docker** (for local testing)
- **Go 1.21+** (for backend development)

## Initial Setup

### 1. AWS OIDC Authentication

Run the provided script to set up GitHub Actions authentication:

```bash
./scripts/setup-oidc.sh
```

This creates:
- OIDC Identity Provider
- IAM Role for GitHub Actions
- Required policies for ECR, ECS, and other AWS services

### 2. Infrastructure Deployment

Deploy the AWS infrastructure stacks in order:

```bash
cd infrastructure

# Install dependencies
npm install

# Bootstrap CDK (one-time setup)
npx cdk bootstrap

# Deploy all stacks for development
npm run deploy:dev

# Or deploy for production
npm run deploy:prod
```

The deployment creates:
- **NetworkStack**: VPC, subnets, security groups
- **DatabaseStack**: RDS PostgreSQL instance
- **ECSStack**: ECS cluster, ALB, task definitions
- **MonitoringStack**: CloudWatch dashboards and alarms

## Deployment Workflows

### Frontend Deployment (Automatic)

The frontend deploys automatically to GitHub Pages when:

- Code is pushed to `main` branch
- Changes are made to `frontend/**` directory
- Workflow file `.github/workflows/frontend-deploy.yml` is modified

**Process:**
1. Install dependencies
2. Run tests and linting
3. Build for production with correct base path
4. Deploy to GitHub Pages

**URL**: https://dohyunjung.github.io/realworld-vibe-coding/

### Backend Deployment (Automatic)

The backend deploys automatically to AWS ECS when:

- Code is pushed to `main` branch
- Changes are made to `backend/**` directory
- Infrastructure changes are made
- Workflow file `.github/workflows/backend-deploy.yml` is modified

**Process:**
1. Run Go tests and code quality checks
2. Build Docker image for linux/amd64
3. Push image to Amazon ECR
4. Update ECS task definition
5. Deploy to ECS service
6. Verify health checks
7. Clean up old ECR images

## Manual Deployment

### Backend Manual Build and Push

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  931016744724.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t realworld-backend ./backend

# Tag for ECR
docker tag realworld-backend:latest \
  931016744724.dkr.ecr.us-east-1.amazonaws.com/realworld-backend:latest

# Push to ECR
docker push 931016744724.dkr.ecr.us-east-1.amazonaws.com/realworld-backend:latest

# Update ECS service
aws ecs update-service \
  --cluster realworld-dev-cluster \
  --service realworld-dev-service \
  --force-new-deployment
```

### Frontend Manual Build and Deploy

```bash
cd frontend

# Install dependencies
npm install

# Build for GitHub Pages
VITE_BASE_URL=/realworld-vibe-coding/ npm run build

# Deploy (committed to main branch will auto-deploy)
git add dist/
git commit -m "feat: manual frontend deployment"
git push origin main
```

## Environment Configuration

### Development Environment

**Frontend:**
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_BASE_URL=/
```

**Backend:**
```bash
PORT=8080
DATABASE_URL=realworld.db
JWT_SECRET=dev-secret-key
ENVIRONMENT=development
```

### Production Environment

**Frontend:**
```bash
VITE_API_BASE_URL=http://realworld-dev-alb-123456789.us-east-1.elb.amazonaws.com
VITE_BASE_URL=/realworld-vibe-coding/
```

**Backend (via ECS Task Definition):**
```bash
PORT=8080
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/realworld
JWT_SECRET=<from-secrets-manager>
ENVIRONMENT=production
```

## Monitoring and Debugging

### CloudWatch Logs

```bash
# View ECS task logs
aws logs tail /aws/ecs/realworld-dev --follow

# View specific log group
aws logs describe-log-groups --log-group-name-prefix "/aws/ecs/realworld"
```

### Health Checks

**Frontend:** https://dohyunjung.github.io/realworld-vibe-coding/

**Backend:** http://ALB_DNS_NAME/health

### Common Issues

1. **ECS Tasks Not Starting**
   - Check if ECR images exist
   - Verify task definition configuration
   - Review CloudWatch logs

2. **Database Connection Issues**
   - Ensure security groups allow ECS → RDS communication
   - Verify database credentials in Secrets Manager
   - Check VPC and subnet configuration

3. **Frontend API Calls Failing**
   - Verify CORS configuration in backend
   - Check VITE_API_BASE_URL environment variable
   - Ensure ALB security group allows HTTP traffic

## Cost Management

### Development Environment

- ECS: 2 tasks × t3.micro equivalent
- RDS: db.t3.micro instance
- ALB: Standard load balancer
- **Estimated Cost**: ~$50-70/month

### Production Environment

- ECS: 2-4 tasks × t3.small equivalent
- RDS: db.t3.small with Multi-AZ
- ALB: Standard load balancer with higher traffic
- **Estimated Cost**: ~$120-150/month

### Cost Optimization

1. **Auto-scaling**: ECS tasks scale based on CPU/memory
2. **Image Cleanup**: Old ECR images automatically deleted
3. **Development Shutdown**: Use `npx cdk destroy` for dev environment when not needed

## Security Considerations

1. **IAM Roles**: Minimal permissions using OIDC
2. **VPC Security**: All resources in private subnets
3. **Database**: Encryption at rest, credentials in Secrets Manager
4. **Container Security**: Non-root user, minimal Alpine image
5. **HTTPS**: CloudFront/ALB handle SSL termination

## Rollback Procedures

### Backend Rollback

```bash
# List recent task definitions
aws ecs list-task-definitions --family-prefix realworld-dev-task

# Update service to previous task definition
aws ecs update-service \
  --cluster realworld-dev-cluster \
  --service realworld-dev-service \
  --task-definition realworld-dev-task:PREVIOUS_REVISION
```

### Frontend Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# GitHub Actions will automatically redeploy
```

## Troubleshooting Commands

```bash
# Check ECS service status
aws ecs describe-services \
  --cluster realworld-dev-cluster \
  --services realworld-dev-service

# List running tasks
aws ecs list-tasks \
  --cluster realworld-dev-cluster \
  --service-name realworld-dev-service

# Describe task details
aws ecs describe-tasks \
  --cluster realworld-dev-cluster \
  --tasks TASK_ID

# Check ALB target health
aws elbv2 describe-target-health \
  --target-group-arn TARGET_GROUP_ARN

# View database status
aws rds describe-db-instances \
  --db-instance-identifier realworld-dev
```

## Support

For deployment issues:

1. Check GitHub Actions logs
2. Review CloudWatch logs
3. Verify AWS resource status
4. Consult this documentation
5. Check the infrastructure README for detailed troubleshooting