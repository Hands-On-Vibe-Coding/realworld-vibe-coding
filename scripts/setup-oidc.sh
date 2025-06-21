#!/bin/bash

# GitHub Actions OIDC Setup for AWS
# This script creates the necessary IAM roles and policies for GitHub Actions to deploy to AWS

set -e

# Configuration
GITHUB_REPO="dohyunjung/realworld-vibe-coding"
ROLE_NAME="GitHubActionsRole"
POLICY_NAME="GitHubActionsDeployPolicy"
ACCOUNT_ID="931016744724"

echo "🔐 Setting up AWS OIDC for GitHub Actions..."
echo "Repository: $GITHUB_REPO"
echo "Account ID: $ACCOUNT_ID"

# Create OIDC Identity Provider (if it doesn't exist)
echo "📋 Creating OIDC Identity Provider..."
if ! aws iam get-open-id-connect-provider --open-id-connect-provider-arn "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com" 2>/dev/null; then
  aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
    --client-id-list sts.amazonaws.com
  echo "✅ OIDC Provider created"
else
  echo "✅ OIDC Provider already exists"
fi

# Create trust policy for GitHub Actions
echo "📝 Creating trust policy..."
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_REPO}:*"
        }
      }
    }
  ]
}
EOF

# Create IAM role for GitHub Actions
echo "👤 Creating IAM role..."
if aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
  echo "⚠️  Role $ROLE_NAME already exists, updating trust policy..."
  aws iam update-assume-role-policy \
    --role-name $ROLE_NAME \
    --policy-document file://trust-policy.json
else
  aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file://trust-policy.json \
    --description "Role for GitHub Actions to deploy RealWorld application"
  echo "✅ IAM role created"
fi

# Create deployment policy
echo "📋 Creating deployment policy..."
cat > deployment-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeClusters",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:ListTasks",
        "ecs:DescribeTasks"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::${ACCOUNT_ID}:role/realworld-*-ecs-task-role",
        "arn:aws:iam::${ACCOUNT_ID}:role/realworld-*-ecs-execution-role"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:*:${ACCOUNT_ID}:secret:*/realworld/database*"
      ]
    }
  ]
}
EOF

# Attach policy to role
if aws iam get-role-policy --role-name $ROLE_NAME --policy-name $POLICY_NAME 2>/dev/null; then
  echo "⚠️  Policy $POLICY_NAME already exists, updating..."
  aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name $POLICY_NAME \
    --policy-document file://deployment-policy.json
else
  aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name $POLICY_NAME \
    --policy-document file://deployment-policy.json
  echo "✅ Deployment policy attached"
fi

# Clean up temporary files
rm trust-policy.json deployment-policy.json

# Output the role ARN
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
echo ""
echo "🎉 Setup complete!"
echo "📋 Add this to your GitHub repository secrets:"
echo "   AWS_ROLE_ARN: $ROLE_ARN"
echo "   AWS_REGION: us-east-1"
echo ""
echo "🔗 Role ARN: $ROLE_ARN"