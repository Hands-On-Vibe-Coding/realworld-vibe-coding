#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { NetworkStack } from '../lib/network-stack'
import { SimpleEcsStack } from '../lib/simple-ecs-stack'
import { FrontendStack } from '../lib/frontend-stack'

const app = new cdk.App()

// Get environment from context or default to 'dev'
const environment = app.node.tryGetContext('environment') || 'dev'

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
}

// Stack naming convention
const stackPrefix = `RealWorld-${environment}`

// Network Stack - VPC and networking components
const networkStack = new NetworkStack(app, `${stackPrefix}-Network`, {
  env,
  environment,
  description: `Network infrastructure for RealWorld application (${environment}) - Educational SQLite version`,
})

// Simple ECS Stack - Fargate Spot with SQLite
const ecsStack = new SimpleEcsStack(app, `${stackPrefix}-ECS`, {
  env,
  environment,
  vpc: networkStack.vpc,
  description: `ECS infrastructure for RealWorld application (${environment}) - Educational SQLite version`,
})

// Frontend Stack - GitHub Pages (CloudFront not needed for education)
const frontendStack = new FrontendStack(app, `${stackPrefix}-Frontend`, {
  env,
  environment,
  loadBalancer: ecsStack.loadBalancer,
  description: `Frontend infrastructure for RealWorld application (${environment}) - Educational version`,
})

// Add dependencies
ecsStack.addDependency(networkStack)
frontendStack.addDependency(ecsStack)

// Add tags to all stacks
const commonTags = {
  Project: 'RealWorld-Educational',
  Environment: environment,
  ManagedBy: 'AWS-CDK',
  Purpose: 'Education',
  CostOptimized: 'true',
}

Object.values(app.node.children).forEach((child) => {
  if (child instanceof cdk.Stack) {
    Object.entries(commonTags).forEach(([key, value]) => {
      cdk.Tags.of(child).add(key, value)
    })
  }
})