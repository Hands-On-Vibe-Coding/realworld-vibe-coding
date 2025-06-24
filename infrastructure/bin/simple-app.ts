#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { SimpleEcsStack } from '../lib/simple-ecs-stack'

const app = new cdk.App()

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-2',
}

// Create VPC
const vpc = new ec2.Vpc(app, 'RealWorldVPC', {
  maxAzs: 2,
  natGateways: 1, // Cost optimization - single NAT gateway
  subnetConfiguration: [
    {
      cidrMask: 24,
      name: 'public',
      subnetType: ec2.SubnetType.PUBLIC,
    },
    {
      cidrMask: 24,
      name: 'private-app',
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    },
  ],
})

// ECS Stack with all required components
const ecsStack = new SimpleEcsStack(app, 'RealWorld', {
  env,
  vpc,
  description: 'RealWorld application infrastructure with ECS, ALB, and CloudFront',
})

// Add tags
cdk.Tags.of(app).add('Project', 'RealWorld')
cdk.Tags.of(app).add('ManagedBy', 'AWS-CDK')