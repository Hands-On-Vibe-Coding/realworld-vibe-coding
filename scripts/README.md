# Infrastructure Scripts

This directory contains scripts for setting up and managing the AWS infrastructure for the RealWorld application.

## Scripts Overview

### `setup-oidc.sh`
Creates the complete OIDC identity provider and GitHub Actions role with all necessary permissions for deploying the RealWorld application to AWS.

**Permissions included:**
- ECR operations (for Docker image management)
- ECS operations (for container deployment)
- CloudFormation operations (for CDK bootstrap and stack management)
- S3 operations (for CDK staging buckets)
- IAM operations (for managing CDK and application roles)
- SSM Parameter Store operations (for CDK bootstrap parameters)
- CloudWatch Logs operations
- Secrets Manager operations

**Usage:**
```bash
./scripts/setup-oidc.sh
```

**Prerequisites:**
- AWS CLI configured with administrative permissions
- Correct AWS account ID (931016744724) set in the script

### `update-github-actions-permissions.sh`
Updates the existing GitHubActionsRole with additional CDK bootstrap permissions. Use this script if you already have a GitHub Actions role but need to add CDK permissions.

**Usage:**
```bash
./scripts/update-github-actions-permissions.sh
```

**Prerequisites:**
- AWS CLI configured with administrative permissions
- Existing GitHubActionsRole in your AWS account

### `deploy.sh`
Deployment script for the RealWorld application (if exists).

### `ssl-setup.sh`
SSL certificate setup script (if exists).

## GitHub Actions Integration

After running the OIDC setup script, you'll need to add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following repository secrets:
   - `AWS_ROLE_ARN`: The ARN of the GitHubActionsRole (provided by the setup script)
   - `AWS_REGION`: `us-east-1` (or your preferred region)

## CDK Bootstrap Permissions

The GitHub Actions role includes comprehensive permissions for CDK bootstrap operations:

### CloudFormation Permissions
- `cloudformation:DescribeStacks`
- `cloudformation:CreateStack`
- `cloudformation:UpdateStack`
- `cloudformation:DeleteStack`
- `cloudformation:GetTemplate`
- `cloudformation:GetStackPolicy`
- `cloudformation:SetStackPolicy`
- `cloudformation:DescribeStackEvents`
- `cloudformation:DescribeStackResources`
- `cloudformation:DescribeStackResource`
- `cloudformation:ValidateTemplate`
- `cloudformation:ListStacks`
- `cloudformation:ListStackResources`

### S3 Permissions (for CDK staging buckets)
- `s3:GetObject`
- `s3:GetObjectVersion`
- `s3:PutObject`
- `s3:GetBucketVersioning`
- `s3:ListBucket`
- `s3:GetBucketLocation`
- `s3:PutObjectAcl`

### SSM Permissions (for CDK bootstrap parameters)
- `ssm:GetParameter`
- `ssm:GetParameters`
- `ssm:PutParameter`

### IAM Permissions (for CDK and application roles)
- `iam:CreateRole`
- `iam:DeleteRole`
- `iam:AttachRolePolicy`
- `iam:DetachRolePolicy`
- `iam:PutRolePolicy`
- `iam:DeleteRolePolicy`
- `iam:GetRole`
- `iam:GetRolePolicy`
- `iam:ListRolePolicies`
- `iam:ListAttachedRolePolicies`
- `iam:TagRole`
- `iam:UntagRole`

## Resource Scope

The permissions are scoped to specific resources to follow the principle of least privilege:

- **CloudFormation stacks**: Limited to `CDKToolkit/*` and `RealWorld-*` stacks
- **S3 buckets**: Limited to `cdktoolkit-stagingbucket-*` buckets
- **SSM parameters**: Limited to `/cdk-bootstrap/*` parameters
- **IAM roles**: Limited to `cdk-*` and `realworld-*` roles

## Troubleshooting

### Common Issues

1. **"User is not authorized to perform cloudformation:DescribeStacks"**
   - Solution: Run the `update-github-actions-permissions.sh` script to add CDK permissions

2. **"Cannot assume role"**
   - Check that the AWS_ROLE_ARN secret is correctly set in GitHub
   - Verify the OIDC identity provider exists in your AWS account
   - Ensure the trust policy allows your GitHub repository

3. **"CDK bootstrap fails"**
   - Verify that all CloudFormation, S3, SSM, and IAM permissions are properly configured
   - Check that the AWS account ID (931016744724) matches your target account

### Verification Commands

Check if OIDC provider exists:
```bash
aws iam get-open-id-connect-provider --open-id-connect-provider-arn "arn:aws:iam::931016744724:oidc-provider/token.actions.githubusercontent.com"
```

Check if GitHub Actions role exists:
```bash
aws iam get-role --role-name GitHubActionsRole
```

List role policies:
```bash
aws iam list-role-policies --role-name GitHubActionsRole
```

Get role policy details:
```bash
aws iam get-role-policy --role-name GitHubActionsRole --policy-name GitHubActionsDeployPolicy
```