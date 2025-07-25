#!/bin/bash

# Update GitHub Actions Role with CDK Bootstrap Permissions
# This script updates the existing GitHubActionsRole with additional CloudFormation permissions

set -e

# Configuration
ROLE_NAME="GitHubActionsRole"
POLICY_NAME="GitHubActionsDeployPolicy"
ACCOUNT_ID="931016744724"

echo "🔄 Updating GitHub Actions Role permissions for CDK bootstrap..."
echo "Role: $ROLE_NAME"
echo "Account ID: $ACCOUNT_ID"

# Create updated deployment policy with CDK permissions
echo "📋 Creating updated deployment policy..."
cat > deployment-policy-update.json << EOF
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
        "sts:AssumeRole"
      ],
      "Resource": [
        "arn:aws:iam::${ACCOUNT_ID}:role/cdk-*"
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
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:DescribeStacks",
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack",
        "cloudformation:GetTemplate",
        "cloudformation:GetStackPolicy",
        "cloudformation:SetStackPolicy",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResources",
        "cloudformation:DescribeStackResource",
        "cloudformation:ValidateTemplate",
        "cloudformation:ListStacks",
        "cloudformation:ListStackResources",
        "cloudformation:CreateChangeSet",
        "cloudformation:DeleteChangeSet",
        "cloudformation:DescribeChangeSet",
        "cloudformation:ExecuteChangeSet"
      ],
      "Resource": [
        "arn:aws:cloudformation:*:${ACCOUNT_ID}:stack/CDKToolkit/*",
        "arn:aws:cloudformation:*:${ACCOUNT_ID}:stack/RealWorld-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:GetObjectVersion",
        "s3:PutObject",
        "s3:GetBucketVersioning",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::cdktoolkit-stagingbucket-*",
        "arn:aws:s3:::cdktoolkit-stagingbucket-*/*",
        "arn:aws:s3:::cdk-hnb659fds-assets-*",
        "arn:aws:s3:::cdk-hnb659fds-assets-*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:PutParameter"
      ],
      "Resource": [
        "arn:aws:ssm:*:${ACCOUNT_ID}:parameter/cdk-bootstrap/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:TagRole",
        "iam:UntagRole"
      ],
      "Resource": [
        "arn:aws:iam::${ACCOUNT_ID}:role/cdk-*",
        "arn:aws:iam::${ACCOUNT_ID}:role/realworld-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeAvailabilityZones",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeNetworkAcls",
        "ec2:DescribeRouteTables",
        "ec2:DescribeInternetGateways",
        "ec2:DescribeNatGateways",
        "ec2:DescribeVpcEndpoints",
        "ec2:CreateVpc",
        "ec2:CreateSubnet",
        "ec2:CreateSecurityGroup",
        "ec2:CreateRouteTable",
        "ec2:CreateInternetGateway",
        "ec2:CreateNatGateway",
        "ec2:CreateRoute",
        "ec2:CreateTags",
        "ec2:DeleteVpc",
        "ec2:DeleteSubnet",
        "ec2:DeleteSecurityGroup",
        "ec2:DeleteRouteTable",
        "ec2:DeleteInternetGateway",
        "ec2:DeleteNatGateway",
        "ec2:DeleteRoute",
        "ec2:AttachInternetGateway",
        "ec2:DetachInternetGateway",
        "ec2:AssociateRouteTable",
        "ec2:DisassociateRouteTable",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:AuthorizeSecurityGroupEgress",
        "ec2:RevokeSecurityGroupIngress",
        "ec2:RevokeSecurityGroupEgress",
        "ec2:ModifyVpcAttribute",
        "ec2:ModifySubnetAttribute",
        "ec2:AllocateAddress",
        "ec2:ReleaseAddress",
        "elasticloadbalancing:*",
        "rds:*"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Update the role policy
echo "🔄 Updating role policy..."
if aws iam get-role-policy --role-name $ROLE_NAME --policy-name $POLICY_NAME 2>/dev/null; then
  aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name $POLICY_NAME \
    --policy-document file://deployment-policy-update.json
  echo "✅ Policy updated successfully"
else
  echo "❌ Role or policy not found. Please run setup-oidc.sh first."
  exit 1
fi

# Clean up temporary file
rm deployment-policy-update.json

# Verify the update
echo "🔍 Verifying policy update..."
aws iam get-role-policy --role-name $ROLE_NAME --policy-name $POLICY_NAME --query 'PolicyDocument.Statement[?contains(Action, `cloudformation:DescribeStacks`)].Action' --output table

echo ""
echo "🎉 GitHub Actions Role permissions updated successfully!"
echo "The role now has the following CDK bootstrap permissions:"
echo "  - CloudFormation operations on CDKToolkit and RealWorld stacks"
echo "  - S3 operations on CDK staging buckets"
echo "  - SSM parameter operations for CDK bootstrap"
echo "  - IAM role operations for CDK and RealWorld roles"
echo ""
echo "You can now run CDK bootstrap and deploy commands in GitHub Actions."