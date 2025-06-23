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
exports.EcsStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const ecs = __importStar(require("aws-cdk-lib/aws-ecs"));
const ecr = __importStar(require("aws-cdk-lib/aws-ecr"));
const elbv2 = __importStar(require("aws-cdk-lib/aws-elasticloadbalancingv2"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const secretsmanager = __importStar(require("aws-cdk-lib/aws-secretsmanager"));
class EcsStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { environment, vpc, database } = props;
        const isProd = environment === 'production';
        // Import security groups from Network stack
        const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'ALBSecurityGroup', cdk.Fn.importValue(`${environment}-ALBSecurityGroupId`));
        const ecsSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'ECSSecurityGroup', cdk.Fn.importValue(`${environment}-ECSSecurityGroupId`));
        // ECR Repository for backend container images
        this.backendRepository = new ecr.Repository(this, 'BackendRepository', {
            repositoryName: `realworld-backend-${environment}`,
            imageScanOnPush: true,
            imageTagMutability: ecr.TagMutability.MUTABLE,
            lifecycleRules: [
                {
                    description: 'Keep last 10 images',
                    maxImageCount: 10,
                },
            ],
            removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
        });
        // ECS Cluster
        this.cluster = new ecs.Cluster(this, 'Cluster', {
            clusterName: `realworld-${environment}`,
            vpc,
            containerInsights: isProd,
        });
        // CloudWatch Log Group for ECS
        const logGroup = new logs.LogGroup(this, 'ECSLogGroup', {
            logGroupName: `/ecs/realworld-backend-${environment}`,
            retention: isProd ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // Task Role - permissions for the application
        const taskRole = new iam.Role(this, 'TaskRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            description: 'Role for RealWorld backend ECS tasks',
        });
        // Allow task to read database secrets
        const databaseSecret = secretsmanager.Secret.fromSecretCompleteArn(this, 'DatabaseSecret', cdk.Fn.importValue(`${environment}-DatabaseSecretArn`));
        databaseSecret.grantRead(taskRole);
        // Task Execution Role - permissions for ECS to manage the task
        const executionRole = new iam.Role(this, 'ExecutionRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
            ],
        });
        // Allow execution role to pull images from ECR
        this.backendRepository.grantPull(executionRole);
        // Task Definition
        const taskDefinition = new ecs.FargateTaskDefinition(this, 'BackendTaskDefinition', {
            memoryLimitMiB: isProd ? 1024 : 512,
            cpu: isProd ? 512 : 256,
            taskRole,
            executionRole,
            family: `realworld-backend-${environment}`,
        });
        // Environment variables for the backend container
        const environment_vars = {
            NODE_ENV: environment === 'production' ? 'production' : 'development',
            PORT: '8080',
            DATABASE_HOST: database.instanceEndpoint.hostname,
            DATABASE_PORT: database.instanceEndpoint.port.toString(),
            DATABASE_NAME: 'realworld',
            DATABASE_USER: 'postgres',
            JWT_SECRET: 'temporary-jwt-secret-for-dev', // TODO: Move to proper secret management for production
            ENVIRONMENT: environment,
        };
        // Secrets for the backend container
        const secrets = {
            DATABASE_PASSWORD: ecs.Secret.fromSecretsManager(databaseSecret, 'password'),
        };
        // Backend container
        const backendContainer = taskDefinition.addContainer('backend', {
            image: ecs.ContainerImage.fromEcrRepository(this.backendRepository, 'latest'),
            environment: environment_vars,
            secrets,
            logging: ecs.LogDrivers.awsLogs({
                streamPrefix: 'backend',
                logGroup,
            }),
            healthCheck: {
                command: ['CMD-SHELL', 'curl -f http://localhost:8080/health || exit 1'],
                interval: cdk.Duration.seconds(30),
                timeout: cdk.Duration.seconds(5),
                retries: 3,
                startPeriod: cdk.Duration.seconds(60),
            },
        });
        backendContainer.addPortMappings({
            containerPort: 8080,
            protocol: ecs.Protocol.TCP,
        });
        // ECS Service
        this.backendService = new ecs.FargateService(this, 'BackendService', {
            cluster: this.cluster,
            taskDefinition,
            serviceName: `realworld-backend-${environment}`,
            desiredCount: 0, // Start with 0 to prevent failures when no image exists
            minHealthyPercent: isProd ? 50 : 0,
            maxHealthyPercent: 200,
            assignPublicIp: false,
            securityGroups: [ecsSecurityGroup],
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            enableExecuteCommand: !isProd, // Enable for debugging in non-prod
            healthCheckGracePeriod: cdk.Duration.seconds(300), // Increase from default 60s
        });
        // Auto Scaling for ECS service in production
        if (isProd) {
            const scaling = this.backendService.autoScaleTaskCount({
                minCapacity: 2,
                maxCapacity: 10,
            });
            scaling.scaleOnCpuUtilization('CpuScaling', {
                targetUtilizationPercent: 70,
                scaleInCooldown: cdk.Duration.seconds(300),
                scaleOutCooldown: cdk.Duration.seconds(300),
            });
            scaling.scaleOnMemoryUtilization('MemoryScaling', {
                targetUtilizationPercent: 80,
                scaleInCooldown: cdk.Duration.seconds(300),
                scaleOutCooldown: cdk.Duration.seconds(300),
            });
        }
        // Application Load Balancer
        this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
            vpc,
            internetFacing: true,
            securityGroup: albSecurityGroup,
            loadBalancerName: `realworld-alb-${environment}`,
        });
        // Target Group for backend service
        const targetGroup = new elbv2.ApplicationTargetGroup(this, 'BackendTargetGroup', {
            vpc,
            port: 8080,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [this.backendService],
            targetGroupName: `realworld-backend-${environment}`,
            healthCheck: {
                enabled: true,
                healthyHttpCodes: '200',
                interval: cdk.Duration.seconds(30),
                path: '/health',
                protocol: elbv2.Protocol.HTTP,
                timeout: cdk.Duration.seconds(5),
                unhealthyThresholdCount: 3,
                healthyThresholdCount: 2,
            },
            deregistrationDelay: cdk.Duration.seconds(30),
        });
        // HTTP Listener
        const httpListener = this.loadBalancer.addListener('HttpListener', {
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            defaultAction: elbv2.ListenerAction.forward([targetGroup]),
        });
        // Route API requests to backend
        httpListener.addAction('ApiRouting', {
            priority: 100,
            conditions: [
                elbv2.ListenerCondition.pathPatterns(['/api/*', '/health']),
            ],
            action: elbv2.ListenerAction.forward([targetGroup]),
        });
        // Default action for non-API requests (will be updated by frontend stack)
        httpListener.addAction('DefaultRouting', {
            priority: 200,
            conditions: [
                elbv2.ListenerCondition.pathPatterns(['/*']),
            ],
            action: elbv2.ListenerAction.fixedResponse(404, {
                contentType: 'text/plain',
                messageBody: 'Not Found',
            }),
        });
        // Outputs
        new cdk.CfnOutput(this, 'LoadBalancerDNS', {
            value: this.loadBalancer.loadBalancerDnsName,
            exportName: `${environment}-LoadBalancerDNS`,
            description: 'DNS name of the Application Load Balancer',
        });
        new cdk.CfnOutput(this, 'LoadBalancerArn', {
            value: this.loadBalancer.loadBalancerArn,
            exportName: `${environment}-LoadBalancerArn`,
            description: 'ARN of the Application Load Balancer',
        });
        new cdk.CfnOutput(this, 'ClusterName', {
            value: this.cluster.clusterName,
            exportName: `${environment}-ClusterName`,
            description: 'Name of the ECS cluster',
        });
        new cdk.CfnOutput(this, 'BackendRepositoryUri', {
            value: this.backendRepository.repositoryUri,
            exportName: `${environment}-BackendRepositoryUri`,
            description: 'URI of the backend ECR repository',
        });
        new cdk.CfnOutput(this, 'BackendServiceName', {
            value: this.backendService.serviceName,
            exportName: `${environment}-BackendServiceName`,
            description: 'Name of the backend ECS service',
        });
    }
}
exports.EcsStack = EcsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZWNzLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFrQztBQUNsQyx5REFBMEM7QUFDMUMseURBQTBDO0FBQzFDLHlEQUEwQztBQUMxQyw4RUFBK0Q7QUFDL0QseURBQTBDO0FBQzFDLDJEQUE0QztBQUU1QywrRUFBZ0U7QUFTaEUsTUFBYSxRQUFTLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFNckMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFvQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUV2QixNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUE7UUFDNUMsTUFBTSxNQUFNLEdBQUcsV0FBVyxLQUFLLFlBQVksQ0FBQTtRQUUzQyw0Q0FBNEM7UUFDNUMsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUM1RCxJQUFJLEVBQ0osa0JBQWtCLEVBQ2xCLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsV0FBVyxxQkFBcUIsQ0FBQyxDQUN4RCxDQUFBO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUM1RCxJQUFJLEVBQ0osa0JBQWtCLEVBQ2xCLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsV0FBVyxxQkFBcUIsQ0FBQyxDQUN4RCxDQUFBO1FBRUQsOENBQThDO1FBQzlDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3JFLGNBQWMsRUFBRSxxQkFBcUIsV0FBVyxFQUFFO1lBQ2xELGVBQWUsRUFBRSxJ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QUFrQjtZQUM1QyxXQUFXLEVBQUUsMkNBQTJDO1NBQ3pELENBQUMsQ0FBQTtRQUVGLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDekMsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZTtZQUN4QyxVQUFVLEVBQUUsR0FBRyxXQUFXLGtCQUFrQjtZQUM1QyxXQUFXLEVBQUUsc0NBQXNDO1NBQ3BELENBQUMsQ0FBQTtRQUVGLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ3JDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDL0IsVUFBVSxFQUFFLEdBQUcsV0FBVyxjQUFjO1lBQ3hDLFdBQVcsRUFBRSx5QkFBeUI7U0FDdkMsQ0FBQyxDQUFBO1FBRUYsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUM5QyxLQUFLLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWE7WUFDM0MsVUFBVSxFQUFFLEdBQUcsV0FBVyx1QkFBdUI7WUFDakQsV0FBVyxFQUFFLG1DQUFtQztTQUNqRCxDQUFDLENBQUE7UUFFRixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQzVDLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVc7WUFDdEMsVUFBVSxFQUFFLEdBQUcsV0FBVyxxQkFBcUI7WUFDL0MsV0FBVyxFQUFFLGlDQUFpQztTQUMvQyxDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0Y7QUEzUEQsNEJBMlBDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInXG5pbXBvcnQgKiBhcyBlY3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcydcbmltcG9ydCAqIGFzIGVjciBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNyJ1xuaW1wb3J0ICogYXMgZWxidjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSdcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnXG5pbXBvcnQgKiBhcyByZHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJkcydcbmltcG9ydCAqIGFzIHNlY3JldHNtYW5hZ2VyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zZWNyZXRzbWFuYWdlcidcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgRWNzU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgZW52aXJvbm1lbnQ6IHN0cmluZ1xuICB2cGM6IGVjMi5WcGNcbiAgZGF0YWJhc2U6IHJkcy5EYXRhYmFzZUluc3RhbmNlXG59XG5cbmV4cG9ydCBjbGFzcyBFY3NTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSBjbHVzdGVyOiBlY3MuQ2x1c3RlclxuICBwdWJsaWMgcmVhZG9ubHkgYmFja2VuZFNlcnZpY2U6IGVjcy5GYXJnYXRlU2VydmljZVxuICBwdWJsaWMgcmVhZG9ubHkgbG9hZEJhbGFuY2VyOiBlbGJ2Mi5BcHBsaWNhdGlvbkxvYWRCYWxhbmNlclxuICBwdWJsaWMgcmVhZG9ubHkgYmFja2VuZFJlcG9zaXRvcnk6IGVjci5SZXBvc2l0b3J5XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEVjc1N0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKVxuXG4gICAgY29uc3QgeyBlbnZpcm9ubWVudCwgdnBjLCBkYXRhYmFzZSB9ID0gcHJvcHNcbiAgICBjb25zdCBpc1Byb2QgPSBlbnZpcm9ubWVudCA9PT0gJ3Byb2R1Y3Rpb24nXG5cbiAgICAvLyBJbXBvcnQgc2VjdXJpdHkgZ3JvdXBzIGZyb20gTmV0d29yayBzdGFja1xuICAgIGNvbnN0IGFsYlNlY3VyaXR5R3JvdXAgPSBlYzIuU2VjdXJpdHlHcm91cC5mcm9tU2VjdXJpdHlHcm91cElkKFxuICAgICAgdGhpcyxcbiAgICAgICdBTEJTZWN1cml0eUdyb3VwJyxcbiAgICAgIGNkay5Gbi5pbXBvcnRWYWx1ZShgJHtlbnZpcm9ubWVudH0tQUxCU2VjdXJpdHlHcm91cElkYClcbiAgICApXG5cbiAgICBjb25zdCBlY3NTZWN1cml0eUdyb3VwID0gZWMyLlNlY3VyaXR5R3JvdXAuZnJvbVNlY3VyaXR5R3JvdXBJZChcbiAgICAgIHRoaXMsXG4gICAgICAnRUNTU2VjdXJpdHlHcm91cCcsXG4gICAgICBjZGsuRm4uaW1wb3J0VmFsdWUoYCR7ZW52aXJvbm1lbnR9LUVDU1NlY3VyaXR5R3JvdXBJZGApXG4gICAgKVxuXG4gICAgLy8gRUNSIFJlcG9zaXRvcnkgZm9yIGJhY2tlbmQgY29udGFpbmVyIGltYWdlc1xuICAgIHRoaXMuYmFja2VuZFJlcG9zaXRvcnkgPSBuZXcgZWNyLlJlcG9zaXRvcnkodGhpcywgJ0JhY2tlbmRSZXBvc2l0b3J5Jywge1xuICAgICAgcmVwb3NpdG9yeU5hbWU6IGByZWFsd29ybGQtYmFja2VuZC0ke2Vudmlyb25tZW50fWAsXG4gICAgICBpbWFnZVNjYW5PblB1c2g6IHRydWUsXG4gICAgICBpbWFnZVRhZ011dGFiaWxpdHk6IGVjci5UYWdNdXRhYmlsaXR5Lk1VVEFCTEUsXG4gICAgICBsaWZlY3ljbGVSdWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgZGVzY3JpcHRpb246ICdLZWVwIGxhc3QgMTAgaW1hZ2VzJyxcbiAgICAgICAgICBtYXhJbWFnZUNvdW50OiAxMCxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICByZW1vdmFsUG9saWN5OiBpc1Byb2QgPyBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4gOiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pXG5cbiAgICAvLyBFQ1MgQ2x1c3RlclxuICAgIHRoaXMuY2x1c3RlciA9IG5ldyBlY3MuQ2x1c3Rlcih0aGlzLCAnQ2x1c3RlcicsIHtcbiAgICAgIGNsdXN0ZXJOYW1lOiBgcmVhbHdvcmxkLSR7ZW52aXJvbm1lbnR9YCxcbiAgICAgIHZwYyxcbiAgICAgIGNvbnRhaW5lckluc2lnaHRzOiBpc1Byb2QsXG4gICAgfSlcblxuICAgIC8vIENsb3VkV2F0Y2ggTG9nIEdyb3VwIGZvciBFQ1NcbiAgICBjb25zdCBsb2dHcm91cCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsICdFQ1NMb2dHcm91cCcsIHtcbiAgICAgIGxvZ0dyb3VwTmFtZTogYC9lY3MvcmVhbHdvcmxkLWJhY2tlbmQtJHtlbnZpcm9ubWVudH1gLFxuICAgICAgcmV0ZW50aW9uOiBpc1Byb2QgPyBsb2dzLlJldGVudGlvbkRheXMuT05FX01PTlRIIDogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9XRUVLLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KVxuXG4gICAgLy8gVGFzayBSb2xlIC0gcGVybWlzc2lvbnMgZm9yIHRoZSBhcHBsaWNhdGlvblxuICAgIGNvbnN0IHRhc2tSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdUYXNrUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlY3MtdGFza3MuYW1hem9uYXdzLmNvbScpLFxuICAgICAgZGVzY3JpcHRpb246ICdSb2xlIGZvciBSZWFsV29ybGQgYmFja2VuZCBFQ1MgdGFza3MnLFxuICAgIH0pXG5cbiAgICAvLyBBbGxvdyB0YXNrIHRvIHJlYWQgZGF0YWJhc2Ugc2VjcmV0c1xuICAgIGNvbnN0IGRhdGFiYXNlU2VjcmV0ID0gc2VjcmV0c21hbmFnZXIuU2VjcmV0LmZyb21TZWNyZXRDb21wbGV0ZUFybihcbiAgICAgIHRoaXMsXG4gICAgICAnRGF0YWJhc2VTZWNyZXQnLFxuICAgICAgY2RrLkZuLmltcG9ydFZhbHVlKGAke2Vudmlyb25tZW50fS1EYXRhYmFzZVNlY3JldEFybmApXG4gICAgKVxuICAgIGRhdGFiYXNlU2VjcmV0LmdyYW50UmVhZCh0YXNrUm9sZSlcblxuICAgIC8vIFRhc2sgRXhlY3V0aW9uIFJvbGUgLSBwZXJtaXNzaW9ucyBmb3IgRUNTIHRvIG1hbmFnZSB0aGUgdGFza1xuICAgIGNvbnN0IGV4ZWN1dGlvblJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0V4ZWN1dGlvblJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnZWNzLXRhc2tzLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BbWF6b25FQ1NUYXNrRXhlY3V0aW9uUm9sZVBvbGljeScpLFxuICAgICAgXSxcbiAgICB9KVxuXG4gICAgLy8gQWxsb3cgZXhlY3V0aW9uIHJvbGUgdG8gcHVsbCBpbWFnZXMgZnJvbSBFQ1JcbiAgICB0aGlzLmJhY2tlbmRSZXBvc2l0b3J5LmdyYW50UHVsbChleGVjdXRpb25Sb2xlKVxuXG4gICAgLy8gVGFzayBEZWZpbml0aW9uXG4gICAgY29uc3QgdGFza0RlZmluaXRpb24gPSBuZXcgZWNzLkZhcmdhdGVUYXNrRGVmaW5pdGlvbih0aGlzLCAnQmFja2VuZFRhc2tEZWZpbml0aW9uJywge1xuICAgICAgbWVtb3J5TGltaXRNaUI6IGlzUHJvZCA/IDEwMjQgOiA1MTIsXG4gICAgICBjcHU6IGlzUHJvZCA/IDUxMiA6IDI1NixcbiAgICAgIHRhc2tSb2xlLFxuICAgICAgZXhlY3V0aW9uUm9sZSxcbiAgICAgIGZhbWlseTogYHJlYWx3b3JsZC1iYWNrZW5kLSR7ZW52aXJvbm1lbnR9YCxcbiAgICB9KVxuXG4gICAgLy8gRW52aXJvbm1lbnQgdmFyaWFibGVzIGZvciB0aGUgYmFja2VuZCBjb250YWluZXJcbiAgICBjb25zdCBlbnZpcm9ubWVudF92YXJzID0ge1xuICAgICAgTk9ERV9FTlY6IGVudmlyb25tZW50ID09PSAncHJvZHVjdGlvbicgPyAncHJvZHVjdGlvbicgOiAnZGV2ZWxvcG1lbnQnLFxuICAgICAgUE9SVDogJzgwODAnLFxuICAgICAgREFUQUJBU0VfSE9TVDogZGF0YWJhc2UuaW5zdGFuY2VFbmRwb2ludC5ob3N0bmFtZSxcbiAgICAgIERBVEFCQVNFX1BPUlQ6IGRhdGFiYXNlLmluc3RhbmNlRW5kcG9pbnQucG9ydC50b1N0cmluZygpLFxuICAgICAgREFUQUJBU0VfTkFNRTogJ3JlYWx3b3JsZCcsXG4gICAgICBEQVRBQkFTRV9VU0VSOiAncG9zdGdyZXMnLFxuICAgICAgSldUX1NFQ1JFVDogJ3RlbXBvcmFyeS1qd3Qtc2VjcmV0LWZvci1kZXYnLCAvLyBUT0RPOiBNb3ZlIHRvIHByb3BlciBzZWNyZXQgbWFuYWdlbWVudCBmb3IgcHJvZHVjdGlvblxuICAgICAgRU5WSVJPTk1FTlQ6IGVudmlyb25tZW50LFxuICAgIH1cblxuICAgIC8vIFNlY3JldHMgZm9yIHRoZSBiYWNrZW5kIGNvbnRhaW5lclxuICAgIGNvbnN0IHNlY3JldHMgPSB7XG4gICAgICBEQVRBQkFTRV9QQVNTV09SRDogZWNzLlNlY3JldC5mcm9tU2VjcmV0c01hbmFnZXIoZGF0YWJhc2VTZWNyZXQsICdwYXNzd29yZCcpLFxuICAgIH1cblxuICAgIC8vIEJhY2tlbmQgY29udGFpbmVyXG4gICAgY29uc3QgYmFja2VuZENvbnRhaW5lciA9IHRhc2tEZWZpbml0aW9uLmFkZENvbnRhaW5lcignYmFja2VuZCcsIHtcbiAgICAgIGltYWdlOiBlY3MuQ29udGFpbmVySW1hZ2UuZnJvbUVjclJlcG9zaXRvcnkodGhpcy5iYWNrZW5kUmVwb3NpdG9yeSwgJ2xhdGVzdCcpLFxuICAgICAgZW52aXJvbm1lbnQ6IGVudmlyb25tZW50X3ZhcnMsXG4gICAgICBzZWNyZXRzLFxuICAgICAgbG9nZ2luZzogZWNzLkxvZ0RyaXZlcnMuYXdzTG9ncyh7XG4gICAgICAgIHN0cmVhbVByZWZpeDogJ2JhY2tlbmQnLFxuICAgICAgICBsb2dHcm91cCxcbiAgICAgIH0pLFxuICAgICAgaGVhbHRoQ2hlY2s6IHtcbiAgICAgICAgY29tbWFuZDogWydDTUQtU0hFTEwnLCAnY3VybCAtZiBodHRwOi8vbG9jYWxob3N0OjgwODAvaGVhbHRoIHx8IGV4aXQgMSddLFxuICAgICAgICBpbnRlcnZhbDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg1KSxcbiAgICAgICAgcmV0cmllczogMyxcbiAgICAgICAgc3RhcnRQZXJpb2Q6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIGJhY2tlbmRDb250YWluZXIuYWRkUG9ydE1hcHBpbmdzKHtcbiAgICAgIGNvbnRhaW5lclBvcnQ6IDgwODAsXG4gICAgICBwcm90b2NvbDogZWNzLlByb3RvY29sLlRDUCxcbiAgICB9KVxuXG4gICAgLy8gRUNTIFNlcnZpY2VcbiAgICB0aGlzLmJhY2tlbmRTZXJ2aWNlID0gbmV3IGVjcy5GYXJnYXRlU2VydmljZSh0aGlzLCAnQmFja2VuZFNlcnZpY2UnLCB7XG4gICAgICBjbHVzdGVyOiB0aGlzLmNsdXN0ZXIsXG4gICAgICB0YXNrRGVmaW5pdGlvbixcbiAgICAgIHNlcnZpY2VOYW1lOiBgcmVhbHdvcmxkLWJhY2tlbmQtJHtlbnZpcm9ubWVudH1gLFxuICAgICAgZGVzaXJlZENvdW50OiAwLCAvLyBTdGFydCB3aXRoIDAgdG8gcHJldmVudCBmYWlsdXJlcyB3aGVuIG5vIGltYWdlIGV4aXN0c1xuICAgICAgbWluSGVhbHRoeVBlcmNlbnQ6IGlzUHJvZCA/IDUwIDogMCxcbiAgICAgIG1heEhlYWx0aHlQZXJjZW50OiAyMDAsXG4gICAgICBhc3NpZ25QdWJsaWNJcDogZmFsc2UsXG4gICAgICBzZWN1cml0eUdyb3VwczogW2Vjc1NlY3VyaXR5R3JvdXBdLFxuICAgICAgdnBjU3VibmV0czoge1xuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfRUdSRVNTLFxuICAgICAgfSxcbiAgICAgIGVuYWJsZUV4ZWN1dGVDb21tYW5kOiAhaXNQcm9kLCAvLyBFbmFibGUgZm9yIGRlYnVnZ2luZyBpbiBub24tcHJvZFxuICAgICAgaGVhbHRoQ2hlY2tHcmFjZVBlcmlvZDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzAwKSwgLy8gSW5jcmVhc2UgZnJvbSBkZWZhdWx0IDYwc1xuICAgIH0pXG5cbiAgICAvLyBBdXRvIFNjYWxpbmcgZm9yIEVDUyBzZXJ2aWNlIGluIHByb2R1Y3Rpb25cbiAgICBpZiAoaXNQcm9kKSB7XG4gICAgICBjb25zdCBzY2FsaW5nID0gdGhpcy5iYWNrZW5kU2VydmljZS5hdXRvU2NhbGVUYXNrQ291bnQoe1xuICAgICAgICBtaW5DYXBhY2l0eTogMixcbiAgICAgICAgbWF4Q2FwYWNpdHk6IDEwLFxuICAgICAgfSlcblxuICAgICAgc2NhbGluZy5zY2FsZU9uQ3B1VXRpbGl6YXRpb24oJ0NwdVNjYWxpbmcnLCB7XG4gICAgICAgIHRhcmdldFV0aWxpemF0aW9uUGVyY2VudDogNzAsXG4gICAgICAgIHNjYWxlSW5Db29sZG93bjogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzAwKSxcbiAgICAgICAgc2NhbGVPdXRDb29sZG93bjogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzAwKSxcbiAgICAgIH0pXG5cbiAgICAgIHNjYWxpbmcuc2NhbGVPbk1lbW9yeVV0aWxpemF0aW9uKCdNZW1vcnlTY2FsaW5nJywge1xuICAgICAgICB0YXJnZXRVdGlsaXphdGlvblBlcmNlbnQ6IDgwLFxuICAgICAgICBzY2FsZUluQ29vbGRvd246IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwMCksXG4gICAgICAgIHNjYWxlT3V0Q29vbGRvd246IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwMCksXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIEFwcGxpY2F0aW9uIExvYWQgQmFsYW5jZXJcbiAgICB0aGlzLmxvYWRCYWxhbmNlciA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvbkxvYWRCYWxhbmNlcih0aGlzLCAnTG9hZEJhbGFuY2VyJywge1xuICAgICAgdnBjLFxuICAgICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsXG4gICAgICBzZWN1cml0eUdyb3VwOiBhbGJTZWN1cml0eUdyb3VwLFxuICAgICAgbG9hZEJhbGFuY2VyTmFtZTogYHJlYWx3b3JsZC1hbGItJHtlbnZpcm9ubWVudH1gLFxuICAgIH0pXG5cbiAgICAvLyBUYXJnZXQgR3JvdXAgZm9yIGJhY2tlbmQgc2VydmljZVxuICAgIGNvbnN0IHRhcmdldEdyb3VwID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXAodGhpcywgJ0JhY2tlbmRUYXJnZXRHcm91cCcsIHtcbiAgICAgIHZwYyxcbiAgICAgIHBvcnQ6IDgwODAsXG4gICAgICBwcm90b2NvbDogZWxidjIuQXBwbGljYXRpb25Qcm90b2NvbC5IVFRQLFxuICAgICAgdGFyZ2V0czogW3RoaXMuYmFja2VuZFNlcnZpY2VdLFxuICAgICAgdGFyZ2V0R3JvdXBOYW1lOiBgcmVhbHdvcmxkLWJhY2tlbmQtJHtlbnZpcm9ubWVudH1gLFxuICAgICAgaGVhbHRoQ2hlY2s6IHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgaGVhbHRoeUh0dHBDb2RlczogJzIwMCcsXG4gICAgICAgIGludGVydmFsOiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICAgIHBhdGg6ICcvaGVhbHRoJyxcbiAgICAgICAgcHJvdG9jb2w6IGVsYnYyLlByb3RvY29sLkhUVFAsXG4gICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDUpLFxuICAgICAgICB1bmhlYWx0aHlUaHJlc2hvbGRDb3VudDogMyxcbiAgICAgICAgaGVhbHRoeVRocmVzaG9sZENvdW50OiAyLFxuICAgICAgfSxcbiAgICAgIGRlcmVnaXN0cmF0aW9uRGVsYXk6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICB9KVxuXG4gICAgLy8gSFRUUCBMaXN0ZW5lclxuICAgIGNvbnN0IGh0dHBMaXN0ZW5lciA9IHRoaXMubG9hZEJhbGFuY2VyLmFkZExpc3RlbmVyKCdIdHRwTGlzdGVuZXInLCB7XG4gICAgICBwb3J0OiA4MCxcbiAgICAgIHByb3RvY29sOiBlbGJ2Mi5BcHBsaWNhdGlvblByb3RvY29sLkhUVFAsXG4gICAgICBkZWZhdWx0QWN0aW9uOiBlbGJ2Mi5MaXN0ZW5lckFjdGlvbi5mb3J3YXJkKFt0YXJnZXRHcm91cF0pLFxuICAgIH0pXG5cbiAgICAvLyBSb3V0ZSBBUEkgcmVxdWVzdHMgdG8gYmFja2VuZFxuICAgIGh0dHBMaXN0ZW5lci5hZGRBY3Rpb24oJ0FwaVJvdXRpbmcnLCB7XG4gICAgICBwcmlvcml0eTogMTAwLFxuICAgICAgY29uZGl0aW9uczogW1xuICAgICAgICBlbGJ2Mi5MaXN0ZW5lckNvbmRpdGlvbi5wYXRoUGF0dGVybnMoWycvYXBpLyonLCAnL2hlYWx0aCddKSxcbiAgICAgIF0sXG4gICAgICBhY3Rpb246IGVsYnYyLkxpc3RlbmVyQWN0aW9uLmZvcndhcmQoW3RhcmdldEdyb3VwXSksXG4gICAgfSlcblxuICAgIC8vIERlZmF1bHQgYWN0aW9uIGZvciBub24tQVBJIHJlcXVlc3RzICh3aWxsIGJlIHVwZGF0ZWQgYnkgZnJvbnRlbmQgc3RhY2spXG4gICAgaHR0cExpc3RlbmVyLmFkZEFjdGlvbignRGVmYXVsdFJvdXRpbmcnLCB7XG4gICAgICBwcmlvcml0eTogMjAwLFxuICAgICAgY29uZGl0aW9uczogW1xuICAgICAgICBlbGJ2Mi5MaXN0ZW5lckNvbmRpdGlvbi5wYXRoUGF0dGVybnMoWycvKiddKSxcbiAgICAgIF0sXG4gICAgICBhY3Rpb246IGVsYnYyLkxpc3RlbmVyQWN0aW9uLmZpeGVkUmVzcG9uc2UoNDA0LCB7XG4gICAgICAgIGNvbnRlbnRUeXBlOiAndGV4dC9wbGFpbicsXG4gICAgICAgIG1lc3NhZ2VCb2R5OiAnTm90IEZvdW5kJyxcbiAgICAgIH0pLFxuICAgIH0pXG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xvYWRCYWxhbmNlckROUycsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmxvYWRCYWxhbmNlci5sb2FkQmFsYW5jZXJEbnNOYW1lLFxuICAgICAgZXhwb3J0TmFtZTogYCR7ZW52aXJvbm1lbnR9LUxvYWRCYWxhbmNlckROU2AsXG4gICAgICBkZXNjcmlwdGlvbjogJ0ROUyBuYW1lIG9mIHRoZSBBcHBsaWNhdGlvbiBMb2FkIEJhbGFuY2VyJyxcbiAgICB9KVxuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xvYWRCYWxhbmNlckFybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmxvYWRCYWxhbmNlci5sb2FkQmFsYW5jZXJBcm4sXG4gICAgICBleHBvcnROYW1lOiBgJHtlbnZpcm9ubWVudH0tTG9hZEJhbGFuY2VyQXJuYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVJOIG9mIHRoZSBBcHBsaWNhdGlvbiBMb2FkIEJhbGFuY2VyJyxcbiAgICB9KVxuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0NsdXN0ZXJOYW1lJywge1xuICAgICAgdmFsdWU6IHRoaXMuY2x1c3Rlci5jbHVzdGVyTmFtZSxcbiAgICAgIGV4cG9ydE5hbWU6IGAke2Vudmlyb25tZW50fS1DbHVzdGVyTmFtZWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgdGhlIEVDUyBjbHVzdGVyJyxcbiAgICB9KVxuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0JhY2tlbmRSZXBvc2l0b3J5VXJpJywge1xuICAgICAgdmFsdWU6IHRoaXMuYmFja2VuZFJlcG9zaXRvcnkucmVwb3NpdG9yeVVyaSxcbiAgICAgIGV4cG9ydE5hbWU6IGAke2Vudmlyb25tZW50fS1CYWNrZW5kUmVwb3NpdG9yeVVyaWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ1VSSSBvZiB0aGUgYmFja2VuZCBFQ1IgcmVwb3NpdG9yeScsXG4gICAgfSlcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdCYWNrZW5kU2VydmljZU5hbWUnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5iYWNrZW5kU2VydmljZS5zZXJ2aWNlTmFtZSxcbiAgICAgIGV4cG9ydE5hbWU6IGAke2Vudmlyb25tZW50fS1CYWNrZW5kU2VydmljZU5hbWVgLFxuICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIHRoZSBiYWNrZW5kIEVDUyBzZXJ2aWNlJyxcbiAgICB9KVxuICB9XG59Il19