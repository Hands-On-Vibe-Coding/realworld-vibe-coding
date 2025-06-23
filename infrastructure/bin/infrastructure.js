#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const network_stack_1 = require("../lib/network-stack");
const database_stack_1 = require("../lib/database-stack");
const ecs_stack_1 = require("../lib/ecs-stack");
const frontend_stack_1 = require("../lib/frontend-stack");
const monitoring_stack_1 = require("../lib/monitoring-stack");
const app = new cdk.App();
// Get environment from context or default to 'dev'
const environment = app.node.tryGetContext('environment') || 'dev';
const isProd = environment === 'production';
// Environment configuration
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};
// Stack naming convention
const stackPrefix = `RealWorld-${environment}`;
// Network Stack - VPC and networking components
const networkStack = new network_stack_1.NetworkStack(app, `${stackPrefix}-Network`, {
    env,
    environment,
    description: `Network infrastructure for RealWorld application (${environment})`,
});
// Database Stack - RDS PostgreSQL
const databaseStack = new database_stack_1.DatabaseStack(app, `${stackPrefix}-Database`, {
    env,
    environment,
    vpc: networkStack.vpc,
    description: `Database infrastructure for RealWorld application (${environment})`,
});
// ECS Stack - Container orchestration
const ecsStack = new ecs_stack_1.EcsStack(app, `${stackPrefix}-ECS`, {
    env,
    environment,
    vpc: networkStack.vpc,
    database: databaseStack.database,
    description: `ECS infrastructure for RealWorld application (${environment})`,
});
// Frontend Stack - CloudFront and S3
const frontendStack = new frontend_stack_1.FrontendStack(app, `${stackPrefix}-Frontend`, {
    env,
    environment,
    loadBalancer: ecsStack.loadBalancer,
    description: `Frontend infrastructure for RealWorld application (${environment})`,
});
// Monitoring Stack - CloudWatch dashboards and alarms
const monitoringStack = new monitoring_stack_1.MonitoringStack(app, `${stackPrefix}-Monitoring`, {
    env,
    environment,
    ecsService: ecsStack.backendService,
    database: databaseStack.database,
    loadBalancer: ecsStack.loadBalancer,
    description: `Monitoring infrastructure for RealWorld application (${environment})`,
});
// Add dependencies
databaseStack.addDependency(networkStack);
ecsStack.addDependency(networkStack);
ecsStack.addDependency(databaseStack);
frontendStack.addDependency(ecsStack);
monitoringStack.addDependency(ecsStack);
monitoringStack.addDependency(databaseStack);
// Add tags to all stacks
const commonTags = {
    Project: 'RealWorld',
    Environment: environment,
    ManagedBy: 'AWS-CDK',
};
Object.values(app.node.children).forEach((child) => {
    if (child instanceof cdk.Stack) {
        Object.entries(commonTags).forEach(([key, value]) => {
            cdk.Tags.of(child).add(key, value);
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmFzdHJ1Y3R1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmZyYXN0cnVjdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSx1Q0FBb0M7QUFDcEMsaURBQWtDO0FBQ2xDLHdEQUFtRDtBQUNuRCwwREFBcUQ7QUFDckQsZ0RBQTJDO0FBQzNDLDBEQUFxRDtBQUNyRCw4REFBeUQ7QUFFekQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7QUFFekIsbURBQW1EO0FBQ25ELE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQTtBQUNsRSxNQUFNLE1BQU0sR0FBRyxXQUFXLEtBQUssWUFBWSxDQUFBO0FBRTNDLDRCQUE0QjtBQUM1QixNQUFNLEdBQUcsR0FBRztJQUNWLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtJQUN4QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxXQUFXO0NBQ3RELENBQUE7QUFFRCwwQkFBMEI7QUFDMUIsTUFBTSxXQUFXLEdBQUcsYUFBYSxXQUFXLEVBQUUsQ0FBQTtBQUU5QyxnREFBZ0Q7QUFDaEQsTUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLFdBQVcsVUFBVSxFQUFFO0lBQ25FLEdBQUc7SUFDSCxXQUFXO0lBQ1gsV0FBVyxFQUFFLHFEQUFxRCxXQUFXLEdBQUc7Q0FDakYsQ0FBQyxDQUFBO0FBRUYsa0NBQWtDO0FBQ2xDLE1BQU0sYUFBYSxHQUFHLElBQUksOEJBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxXQUFXLFdBQVcsRUFBRTtJQUN0RSxHQUFHO0lBQ0gsV0FBVztJQUNYLEdBQUcsRUFBRSxZQUFZLENBQUMsR0FBRztJQUNyQixXQUFXLEVBQUUsc0RBQXNELFdBQVcsR0FBRztDQUNsRixDQUFDLENBQUE7QUFFRixzQ0FBc0M7QUFDdEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQkFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLFdBQVcsTUFBTSxFQUFFO0lBQ3ZELEdBQUc7SUFDSCxXQUFXO0lBQ1gsR0FBRyxFQUFFLFlBQVksQ0FBQyxHQUFHO0lBQ3JCLFFBQVEsRUFBRSxhQUFhLENBQUMsUUFBUTtJQUNoQyxXQUFXLEVBQUUsaURBQWlELFdBQVcsR0FBRztDQUM3RSxDQUFDLENBQUE7QUFFRixxQ0FBcUM7QUFDckMsTUFBTSxhQUFhLEdBQUcsSUFBSSw4QkFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLFdBQVcsV0FBVyxFQUFFO0lBQ3RFLEdBQUc7SUFDSCxXQUFXO0lBQ1gsWUFBWSxFQUFFLFFBQVEsQ0FBQyxZQUFZO0lBQ25DLFdBQVcsRUFBRSxzREFBc0QsV0FBVyxHQUFHO0NBQ2xGLENBQUMsQ0FBQTtBQUVGLHNEQUFzRDtBQUN0RCxNQUFNLGVBQWUsR0FBRyxJQUFJLGtDQUFlLENBQUMsR0FBRyxFQUFFLEdBQUcsV0FBVyxhQUFhLEVBQUU7SUFDNUUsR0FBRztJQUNILFdBQVc7SUFDWCxVQUFVLEVBQUUsUUFBUSxDQUFDLGNBQWM7SUFDbkMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxRQUFRO0lBQ2hDLFlBQVksRUFBRSxRQUFRLENBQUMsWUFBWTtJQUNuQyxXQUFXLEVBQUUsd0RBQXdELFdBQVcsR0FBRztDQUNwRixDQUFDLENBQUE7QUFFRixtQkFBbUI7QUFDbkIsYUFBYSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN6QyxRQUFRLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ3BDLFFBQVEsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDckMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNyQyxlQUFlLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ3ZDLGVBQWUsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUE7QUFFNUMseUJBQXlCO0FBQ3pCLE1BQU0sVUFBVSxHQUFHO0lBQ2pCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFdBQVcsRUFBRSxXQUFXO0lBQ3hCLFNBQVMsRUFBRSxTQUFTO0NBQ3JCLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDakQsSUFBSSxLQUFLLFlBQVksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtZQUNsRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ3BDLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztBQUNILENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBOZXR3b3JrU3RhY2sgfSBmcm9tICcuLi9saWIvbmV0d29yay1zdGFjaydcbmltcG9ydCB7IERhdGFiYXNlU3RhY2sgfSBmcm9tICcuLi9saWIvZGF0YWJhc2Utc3RhY2snXG5pbXBvcnQgeyBFY3NTdGFjayB9IGZyb20gJy4uL2xpYi9lY3Mtc3RhY2snXG5pbXBvcnQgeyBGcm9udGVuZFN0YWNrIH0gZnJvbSAnLi4vbGliL2Zyb250ZW5kLXN0YWNrJ1xuaW1wb3J0IHsgTW9uaXRvcmluZ1N0YWNrIH0gZnJvbSAnLi4vbGliL21vbml0b3Jpbmctc3RhY2snXG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKClcblxuLy8gR2V0IGVudmlyb25tZW50IGZyb20gY29udGV4dCBvciBkZWZhdWx0IHRvICdkZXYnXG5jb25zdCBlbnZpcm9ubWVudCA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoJ2Vudmlyb25tZW50JykgfHwgJ2RldidcbmNvbnN0IGlzUHJvZCA9IGVudmlyb25tZW50ID09PSAncHJvZHVjdGlvbidcblxuLy8gRW52aXJvbm1lbnQgY29uZmlndXJhdGlvblxuY29uc3QgZW52ID0ge1xuICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxuICByZWdpb246IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTiB8fCAndXMtZWFzdC0xJyxcbn1cblxuLy8gU3RhY2sgbmFtaW5nIGNvbnZlbnRpb25cbmNvbnN0IHN0YWNrUHJlZml4ID0gYFJlYWxXb3JsZC0ke2Vudmlyb25tZW50fWBcblxuLy8gTmV0d29yayBTdGFjayAtIFZQQyBhbmQgbmV0d29ya2luZyBjb21wb25lbnRzXG5jb25zdCBuZXR3b3JrU3RhY2sgPSBuZXcgTmV0d29ya1N0YWNrKGFwcCwgYCR7c3RhY2tQcmVmaXh9LU5ldHdvcmtgLCB7XG4gIGVudixcbiAgZW52aXJvbm1lbnQsXG4gIGRlc2NyaXB0aW9uOiBgTmV0d29yayBpbmZyYXN0cnVjdHVyZSBmb3IgUmVhbFdvcmxkIGFwcGxpY2F0aW9uICgke2Vudmlyb25tZW50fSlgLFxufSlcblxuLy8gRGF0YWJhc2UgU3RhY2sgLSBSRFMgUG9zdGdyZVNRTFxuY29uc3QgZGF0YWJhc2VTdGFjayA9IG5ldyBEYXRhYmFzZVN0YWNrKGFwcCwgYCR7c3RhY2tQcmVmaXh9LURhdGFiYXNlYCwge1xuICBlbnYsXG4gIGVudmlyb25tZW50LFxuICB2cGM6IG5ldHdvcmtTdGFjay52cGMsXG4gIGRlc2NyaXB0aW9uOiBgRGF0YWJhc2UgaW5mcmFzdHJ1Y3R1cmUgZm9yIFJlYWxXb3JsZCBhcHBsaWNhdGlvbiAoJHtlbnZpcm9ubWVudH0pYCxcbn0pXG5cbi8vIEVDUyBTdGFjayAtIENvbnRhaW5lciBvcmNoZXN0cmF0aW9uXG5jb25zdCBlY3NTdGFjayA9IG5ldyBFY3NTdGFjayhhcHAsIGAke3N0YWNrUHJlZml4fS1FQ1NgLCB7XG4gIGVudixcbiAgZW52aXJvbm1lbnQsXG4gIHZwYzogbmV0d29ya1N0YWNrLnZwYyxcbiAgZGF0YWJhc2U6IGRhdGFiYXNlU3RhY2suZGF0YWJhc2UsXG4gIGRlc2NyaXB0aW9uOiBgRUNTIGluZnJhc3RydWN0dXJlIGZvciBSZWFsV29ybGQgYXBwbGljYXRpb24gKCR7ZW52aXJvbm1lbnR9KWAsXG59KVxuXG4vLyBGcm9udGVuZCBTdGFjayAtIENsb3VkRnJvbnQgYW5kIFMzXG5jb25zdCBmcm9udGVuZFN0YWNrID0gbmV3IEZyb250ZW5kU3RhY2soYXBwLCBgJHtzdGFja1ByZWZpeH0tRnJvbnRlbmRgLCB7XG4gIGVudixcbiAgZW52aXJvbm1lbnQsXG4gIGxvYWRCYWxhbmNlcjogZWNzU3RhY2subG9hZEJhbGFuY2VyLFxuICBkZXNjcmlwdGlvbjogYEZyb250ZW5kIGluZnJhc3RydWN0dXJlIGZvciBSZWFsV29ybGQgYXBwbGljYXRpb24gKCR7ZW52aXJvbm1lbnR9KWAsXG59KVxuXG4vLyBNb25pdG9yaW5nIFN0YWNrIC0gQ2xvdWRXYXRjaCBkYXNoYm9hcmRzIGFuZCBhbGFybXNcbmNvbnN0IG1vbml0b3JpbmdTdGFjayA9IG5ldyBNb25pdG9yaW5nU3RhY2soYXBwLCBgJHtzdGFja1ByZWZpeH0tTW9uaXRvcmluZ2AsIHtcbiAgZW52LFxuICBlbnZpcm9ubWVudCxcbiAgZWNzU2VydmljZTogZWNzU3RhY2suYmFja2VuZFNlcnZpY2UsXG4gIGRhdGFiYXNlOiBkYXRhYmFzZVN0YWNrLmRhdGFiYXNlLFxuICBsb2FkQmFsYW5jZXI6IGVjc1N0YWNrLmxvYWRCYWxhbmNlcixcbiAgZGVzY3JpcHRpb246IGBNb25pdG9yaW5nIGluZnJhc3RydWN0dXJlIGZvciBSZWFsV29ybGQgYXBwbGljYXRpb24gKCR7ZW52aXJvbm1lbnR9KWAsXG59KVxuXG4vLyBBZGQgZGVwZW5kZW5jaWVzXG5kYXRhYmFzZVN0YWNrLmFkZERlcGVuZGVuY3kobmV0d29ya1N0YWNrKVxuZWNzU3RhY2suYWRkRGVwZW5kZW5jeShuZXR3b3JrU3RhY2spXG5lY3NTdGFjay5hZGREZXBlbmRlbmN5KGRhdGFiYXNlU3RhY2spXG5mcm9udGVuZFN0YWNrLmFkZERlcGVuZGVuY3koZWNzU3RhY2spXG5tb25pdG9yaW5nU3RhY2suYWRkRGVwZW5kZW5jeShlY3NTdGFjaylcbm1vbml0b3JpbmdTdGFjay5hZGREZXBlbmRlbmN5KGRhdGFiYXNlU3RhY2spXG5cbi8vIEFkZCB0YWdzIHRvIGFsbCBzdGFja3NcbmNvbnN0IGNvbW1vblRhZ3MgPSB7XG4gIFByb2plY3Q6ICdSZWFsV29ybGQnLFxuICBFbnZpcm9ubWVudDogZW52aXJvbm1lbnQsXG4gIE1hbmFnZWRCeTogJ0FXUy1DREsnLFxufVxuXG5PYmplY3QudmFsdWVzKGFwcC5ub2RlLmNoaWxkcmVuKS5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBjZGsuU3RhY2spIHtcbiAgICBPYmplY3QuZW50cmllcyhjb21tb25UYWdzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgIGNkay5UYWdzLm9mKGNoaWxkKS5hZGQoa2V5LCB2YWx1ZSlcbiAgICB9KVxuICB9XG59KSJdfQ==