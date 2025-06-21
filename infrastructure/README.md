# RealWorld Infrastructure

This directory contains AWS CDK infrastructure code for the RealWorld backend deployment.

## Overview

The infrastructure is organized into separate stacks for better modularity and resource management:

- **NetworkStack**: VPC, subnets, security groups, and NAT gateways
- **DatabaseStack**: RDS PostgreSQL instance with proper security and backup configuration
- **ECSStack**: ECS cluster, service, task definitions, and Application Load Balancer
- **MonitoringStack**: CloudWatch dashboards, alarms, and logging configuration

## Important Note: Frontend Deployment

**The frontend is NOT deployed using this infrastructure.** Instead, the frontend is deployed to GitHub Pages using GitHub Actions for the following benefits:

- **Cost Efficiency**: GitHub Pages is free for public repositories
- **Simplicity**: No need to manage CloudFront, S3, or related AWS resources
- **Fast Deployment**: Direct deployment from GitHub without additional infrastructure
- **Zero Maintenance**: No AWS resources to monitor or maintain for frontend

The `FrontendStack` in this repository is kept for reference but is not used in the actual deployment.

## Deployment Strategy

### Frontend (GitHub Pages)
- Deployed automatically via `.github/workflows/frontend-deploy.yml`
- Triggers on changes to `frontend/**` directory
- Builds and deploys to GitHub Pages
- URL: `https://dohyunjung.github.io/realworld-vibe-coding/`

### Backend (AWS ECS)
- Deployed using this CDK infrastructure
- Requires Docker images in ECR
- Automated via GitHub Actions (future implementation)

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Node.js 18+** and npm
3. **AWS CDK v2** installed globally
4. **Docker** for building backend images

## Setup

1. Install dependencies:
   ```bash
   cd infrastructure
   npm install
   ```

2. Configure your AWS credentials:
   ```bash
   aws configure
   ```

3. Bootstrap CDK in your AWS account (one-time setup):
   ```bash
   npx cdk bootstrap
   ```

## Deployment Commands

### Deploy All Stacks (Development)
```bash
npm run deploy:dev
```

### Deploy All Stacks (Production)
```bash
npm run deploy:prod
```

### Deploy Individual Stacks
```bash
# Network infrastructure
npx cdk deploy RealWorldNetworkStack-dev

# Database
npx cdk deploy RealWorldDatabaseStack-dev

# ECS and Application
npx cdk deploy RealWorldECSStack-dev

# Monitoring
npx cdk deploy RealWorldMonitoringStack-dev
```

### Useful CDK Commands

- `npm run build`: Compile TypeScript to JavaScript
- `npm run watch`: Watch for changes and compile
- `npx cdk diff`: Compare deployed stack with current state
- `npx cdk synth`: Emit the synthesized CloudFormation template
- `npx cdk destroy`: Destroy all stacks (careful with production!)

## Environment Configuration

The infrastructure supports multiple environments through the `environment` parameter:

- `development`: Smaller instance types, shorter backup retention
- `production`: Production-grade instances, enhanced security, longer backup retention

### Development Environment
- ECS Tasks: 512 CPU, 1024 Memory
- RDS Instance: db.t3.micro
- Backup Retention: 7 days
- Multi-AZ: Disabled

### Production Environment
- ECS Tasks: 1024 CPU, 2048 Memory
- RDS Instance: db.t3.small
- Backup Retention: 30 days
- Multi-AZ: Enabled

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   GitHub Pages  │    │      Users      │
│   (Frontend)    │◄───┤                 │
└─────────────────┘    └─────────────────┘
         │                       │
         │ API Calls             │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Application     │    │   CloudFront    │
│ Load Balancer   │◄───┤   (Optional)    │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   ECS Service   │    │   RDS PostgreSQL│
│   (Backend)     │───►│   (Database)    │
└─────────────────┘    └─────────────────┘
```

## Stack Dependencies

The stacks have the following dependencies and must be deployed in order:

1. **NetworkStack** - Creates VPC and networking resources
2. **DatabaseStack** - Creates RDS instance (depends on NetworkStack)
3. **ECSStack** - Creates application infrastructure (depends on NetworkStack and DatabaseStack)
4. **MonitoringStack** - Creates monitoring resources (depends on all other stacks)

## Resource Naming Convention

All resources follow the naming pattern: `realworld-{environment}-{resource-type}`

Examples:
- VPC: `realworld-dev-vpc`
- Database: `realworld-dev-database`
- ECS Cluster: `realworld-dev-cluster`

## Cost Optimization

### Development Environment
- Uses smallest possible instance types
- Single AZ deployment
- Minimal backup retention
- No enhanced monitoring

### Production Environment
- Right-sized instances for expected load
- Multi-AZ for high availability
- Extended backup retention
- Enhanced monitoring enabled

## Security Features

- **Network Isolation**: All resources deployed in private subnets
- **Security Groups**: Restrictive rules allowing only necessary traffic
- **Database Encryption**: RDS encryption at rest enabled
- **Secrets Management**: Database credentials stored in AWS Secrets Manager
- **IAM Roles**: Principle of least privilege for all services

## Monitoring

The MonitoringStack includes:

- **CloudWatch Dashboards**: Application and infrastructure metrics
- **CloudWatch Alarms**: Alerts for critical thresholds
- **Log Groups**: Centralized logging for ECS tasks
- **X-Ray Tracing**: Distributed tracing for performance analysis

## Environment Variables

The backend application expects these environment variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/realworld

# Application
PORT=8080
JWT_SECRET=your-jwt-secret
ENVIRONMENT=development

# AWS
AWS_REGION=us-east-1
```

These are automatically configured through ECS task definitions and AWS Secrets Manager.

## Troubleshooting

### Common Issues

1. **ECS Tasks Not Starting**
   - Check if Docker images exist in ECR
   - Verify task definition has correct image URI
   - Check CloudWatch logs for task failures

2. **Database Connection Issues**
   - Ensure security groups allow ECS to RDS communication
   - Verify database credentials in Secrets Manager
   - Check if RDS instance is in the correct subnet group

3. **Load Balancer Health Checks Failing**
   - Verify the backend health check endpoint (`/health`)
   - Check if the correct port is exposed in the container
   - Review ALB target group configuration

### Useful Commands for Debugging

```bash
# Check stack status
npx cdk list

# View stack outputs
aws cloudformation describe-stacks --stack-name RealWorldECSStack-dev

# Check ECS service status
aws ecs describe-services --cluster realworld-dev-cluster --services realworld-dev-service

# View ECS task logs
aws logs tail /aws/ecs/realworld-dev --follow
```

## Cleanup

To avoid unnecessary costs, destroy development resources when not needed:

```bash
# Destroy all stacks
npx cdk destroy --all

# Or destroy specific environment
npx cdk destroy RealWorldMonitoringStack-dev
npx cdk destroy RealWorldECSStack-dev
npx cdk destroy RealWorldDatabaseStack-dev
npx cdk destroy RealWorldNetworkStack-dev
```

**Warning**: Destroying the database stack will permanently delete all data. Use with caution!