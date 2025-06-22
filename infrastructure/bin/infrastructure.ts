#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { NetworkStack } from '../lib/network-stack'
import { DatabaseStack } from '../lib/database-stack'
import { EcsStack } from '../lib/ecs-stack'
import { FrontendStack } from '../lib/frontend-stack'
import { MonitoringStack } from '../lib/monitoring-stack'

const app = new cdk.App()

// Get environment from context or default to 'dev'
const environment = app.node.tryGetContext('environment') || 'dev'
const isProd = environment === 'production'

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
  description: `Network infrastructure for RealWorld application (${environment})`,
})

// Database Stack - RDS PostgreSQL
const databaseStack = new DatabaseStack(app, `${stackPrefix}-Database`, {
  env,
  environment,
  vpc: networkStack.vpc,
  description: `Database infrastructure for RealWorld application (${environment})`,
})

// ECS Stack - Container orchestration
const ecsStack = new EcsStack(app, `${stackPrefix}-ECS`, {
  env,
  environment,
  vpc: networkStack.vpc,
  database: databaseStack.database,
  description: `ECS infrastructure for RealWorld application (${environment})`,
})

// Frontend Stack - CloudFront and S3
const frontendStack = new FrontendStack(app, `${stackPrefix}-Frontend`, {
  env,
  environment,
  loadBalancer: ecsStack.loadBalancer,
  description: `Frontend infrastructure for RealWorld application (${environment})`,
})

// Monitoring Stack - CloudWatch dashboards and alarms
const monitoringStack = new MonitoringStack(app, `${stackPrefix}-Monitoring`, {
  env,
  environment,
  ecsService: ecsStack.backendService,
  database: databaseStack.database,
  loadBalancer: ecsStack.loadBalancer,
  description: `Monitoring infrastructure for RealWorld application (${environment})`,
})

// Add dependencies
databaseStack.addDependency(networkStack)
ecsStack.addDependency(networkStack)
ecsStack.addDependency(databaseStack)
frontendStack.addDependency(ecsStack)
monitoringStack.addDependency(ecsStack)
monitoringStack.addDependency(databaseStack)

// Add tags to all stacks
const commonTags = {
  Project: 'RealWorld',
  Environment: environment,
  ManagedBy: 'AWS-CDK',
}

Object.values(app.node.children).forEach((child) => {
  if (child instanceof cdk.Stack) {
    Object.entries(commonTags).forEach(([key, value]) => {
      cdk.Tags.of(child).add(key, value)
    })
  }
})