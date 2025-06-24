# Deployment Guide

This document provides detailed instructions for deploying the RealWorld application in an educational environment optimized for cost and simplicity.

## Architecture Overview

The application uses a simplified deployment strategy designed for education:

- **Frontend**: GitHub Pages (Static Site)
- **Backend**: AWS ECS with Fargate Spot (Containerized API)
- **Database**: SQLite (In-container, file-based)
- **Infrastructure**: AWS CDK (TypeScript)
- **Estimated Cost**: $5-10/month

## Key Benefits

### Cost Optimization
- **Fargate Spot**: ~70% savings compared to regular Fargate
- **No RDS**: Eliminates database server costs
- **Minimal Resources**: 0.25 vCPU, 512MB RAM
- **Short Log Retention**: 1 week CloudWatch logs

### Educational Focus
- **Simple Architecture**: Easy to understand and debug
- **Rapid Deployment**: Minutes not hours
- **Self-Contained**: SQLite eliminates external dependencies
- **Reset-Friendly**: Container restarts provide clean state

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
- IAM OIDC provider for GitHub Actions
- Role with appropriate permissions for ECS and ECR
- Trust policy for secure authentication

### 2. Bootstrap CDK (First Time Only)

```bash
cd infrastructure
npm install
cdk bootstrap
```

## Deployment Process

### Automatic Deployment

Push to the `main` branch automatically triggers deployment:

```bash
git add .
git commit -m "Deploy changes"
git push origin main
```

The deployment process:

1. **Build Frontend**: Creates optimized React build
2. **Build Backend**: Compiles Go binary with SQLite
3. **Deploy Infrastructure**: Creates/updates AWS resources
4. **Push Docker Image**: Builds and pushes to ECR
5. **Update Service**: Deploys new container with health checks

### Manual Deployment

For manual control or troubleshooting:

```bash
# 1. Deploy infrastructure
cd infrastructure
npm run deploy

# 2. Build and test locally (optional)
cd ../backend
docker build -t realworld-backend .
docker run -p 8080:8080 realworld-backend

# 3. Push to ECR (normally done by GitHub Actions)
# This step is typically automated
```

## Infrastructure Components

### Network Stack
- **VPC**: Isolated network environment
- **Subnets**: Public and private subnets across AZs
- **Internet Gateway**: Public internet access
- **NAT Gateway**: Outbound internet for private subnets

### ECS Stack (Simplified)
- **ECS Cluster**: Container orchestration
- **Fargate Tasks**: 0.25 vCPU, 512MB RAM
- **Spot Instances**: 70% cost reduction
- **Auto Scaling**: Disabled for cost (educational use)

### Load Balancer
- **Application Load Balancer**: HTTP traffic distribution
- **Health Checks**: `/health` endpoint monitoring
- **Target Groups**: Container service integration

### Container Configuration
- **Base Image**: Debian (SQLite compatible)
- **Database**: SQLite file at `/data/realworld.db`
- **Environment**: Production-ready Go binary
- **Logging**: CloudWatch with 1-week retention

## Database Management

### SQLite Benefits for Education
- **No Setup**: Works immediately without configuration
- **File-Based**: Simple backup and inspection
- **Zero Cost**: No database server charges
- **Reset-Friendly**: Container restart = fresh database

### Data Persistence
- **Development**: Data persists during container lifecycle
- **Reset**: Stopping/starting service resets data
- **Migrations**: Automatic on startup
- **Backup**: Not implemented (educational use)

### Migration Process
```sql
-- Migrations run automatically on startup
-- Located in backend/migrations/
-- SQLite-compatible syntax
-- Example: 001_create_users_table.sql
```

## Monitoring and Debugging

### CloudWatch Logs
```bash
# View logs via AWS CLI
aws logs describe-log-groups --log-group-name-prefix "/ecs/realworld"

# Stream logs in real-time
aws logs tail /ecs/realworld-backend-dev --follow
```

### Health Checks
- **Endpoint**: `GET /health`
- **Response**: `{"status":"ok","service":"realworld-backend"}`
- **Frequency**: Every 30 seconds
- **Failure Threshold**: 3 consecutive failures

### ECS Service Management
```bash
# Check service status
aws ecs describe-services --cluster realworld-dev --services realworld-backend-dev

# Force new deployment
aws ecs update-service --cluster realworld-dev --service realworld-backend-dev --force-new-deployment

# Scale service (educational use: 0 or 1)
aws ecs update-service --cluster realworld-dev --service realworld-backend-dev --desired-count 1
```

## Cost Management

### Current Costs (Monthly Estimates)
- **Fargate Spot**: $3-5 (0.25 vCPU, 512MB)
- **Application Load Balancer**: $2-3
- **Data Transfer**: $0-1
- **CloudWatch Logs**: $0-1
- **Total**: $5-10/month

### Cost Optimization Tips
1. **Stop When Not Needed**: Set desired count to 0
2. **Use Spot**: Already configured for maximum savings
3. **Monitor Usage**: Check AWS Cost Explorer regularly
4. **Clean Up**: Remove unused resources promptly

## Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs for startup errors
aws logs tail /ecs/realworld-backend-dev --follow

# Common causes:
# - SQLite permissions
# - Missing environment variables
# - Port binding conflicts
```

#### 2. Health Check Failures
```bash
# Test health endpoint directly
curl http://your-alb-url/health

# Check ECS service events
aws ecs describe-services --cluster realworld-dev --services realworld-backend-dev
```

#### 3. Database Migration Errors
```bash
# Migrations run automatically, check logs for:
# - SQL syntax errors
# - File permission issues
# - SQLite version compatibility
```

#### 4. Deployment Stuck
```bash
# Check GitHub Actions logs
# Common issues:
# - AWS permissions
# - ECR authentication
# - CDK deployment errors
```

### Recovery Procedures

#### Reset Everything
```bash
# Destroy and recreate infrastructure
cd infrastructure
npm run destroy
npm run deploy
```

#### Database Reset
```bash
# Force new deployment (resets SQLite)
aws ecs update-service --cluster realworld-dev --service realworld-backend-dev --force-new-deployment
```

## Security Considerations

### Educational Environment
- **JWT Secret**: Hardcoded for simplicity (change in production)
- **Database**: No encryption (SQLite in container)
- **Network**: Basic security groups
- **Logging**: Limited sensitive data filtering

### Production Recommendations
- Use AWS Secrets Manager for JWT secret
- Implement database encryption
- Add WAF protection
- Enable detailed CloudWatch monitoring
- Implement backup strategies

## Frontend Deployment

The frontend is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Configuration
- **Build Command**: `npm run build`
- **Deploy**: GitHub Actions automatically updates GitHub Pages
- **API Integration**: Uses ALB URL from backend deployment

### Custom Domain (Optional)
To use a custom domain:
1. Configure CNAME in your DNS provider
2. Update GitHub Pages settings
3. Update CORS settings in backend

## Conclusion

This deployment strategy prioritizes educational value over production robustness. It provides:

- **Cost-effective** learning environment
- **Simple** architecture for easy understanding
- **Rapid** deployment and iteration
- **Reset-friendly** for experimentation

For production use, consider upgrading to:
- Managed PostgreSQL (RDS)
- Multiple availability zones
- Comprehensive monitoring
- Backup and disaster recovery
- Enhanced security measures