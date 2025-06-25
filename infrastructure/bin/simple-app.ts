#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { RealWorldStack } from '../lib/realworld-stack'

const app = new cdk.App()

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-2',
}

// Single stack with all components
const realWorldStack = new RealWorldStack(app, 'RealWorld', {
  env,
  description: 'RealWorld application infrastructure with VPC, ECS, ALB, and CloudFront',
})

// Add tags
cdk.Tags.of(app).add('Project', 'RealWorld')
cdk.Tags.of(app).add('ManagedBy', 'AWS-CDK')