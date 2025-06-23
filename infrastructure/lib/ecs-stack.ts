import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import { Construct } from 'constructs'

export interface EcsStackProps extends cdk.StackProps {
  environment: string
  vpc: ec2.Vpc
  database: rds.DatabaseInstance
}

export class EcsStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster
  public readonly backendService: ecs.FargateService
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer
  public readonly backendRepository: ecr.Repository

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props)

    const { environment, vpc, database } = props
    const isProd = environment === 'production'

    // Import security groups from Network stack
    const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'ALBSecurityGroup',
      cdk.Fn.importValue(`${environment}-ALBSecurityGroupId`)
    )

    const ecsSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'ECSSecurityGroup',
      cdk.Fn.importValue(`${environment}-ECSSecurityGroupId`)
    )

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
    })

    // ECS Cluster
    this.cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: `realworld-${environment}`,
      vpc,
      containerInsights: isProd,
    })

    // CloudWatch Log Group for ECS
    const logGroup = new logs.LogGroup(this, 'ECSLogGroup', {
      logGroupName: `/ecs/realworld-backend-${environment}`,
      retention: isProd ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Task Role - permissions for the application
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Role for RealWorld backend ECS tasks',
    })

    // Allow task to read database secrets
    const databaseSecret = secretsmanager.Secret.fromSecretCompleteArn(
      this,
      'DatabaseSecret',
      cdk.Fn.importValue(`${environment}-DatabaseSecretArn`)
    )
    databaseSecret.grantRead(taskRole)

    // Task Execution Role - permissions for ECS to manage the task
    const executionRole = new iam.Role(this, 'ExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    })

    // Allow execution role to pull images from ECR
    this.backendRepository.grantPull(executionRole)

    // Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'BackendTaskDefinition', {
      memoryLimitMiB: isProd ? 1024 : 512,
      cpu: isProd ? 512 : 256,
      taskRole,
      executionRole,
      family: `realworld-backend-${environment}`,
    })

    // Environment variables for the backend container
    const environment_vars = {
      NODE_ENV: environment === 'production' ? 'production' : 'development',
      PORT: '8080',
      DATABASE_HOST: database.instanceEndpoint.hostname,
      DATABASE_PORT: database.instanceEndpoint.port.toString(),
      DATABASE_NAME: 'realworld',
      DATABASE_USER: 'postgres',
    }

    // Secrets for the backend container
    const secrets = {
      DATABASE_PASSWORD: ecs.Secret.fromSecretsManager(databaseSecret, 'password'),
      JWT_SECRET: ecs.Secret.fromSecretsManager(databaseSecret, 'jwt_secret'),
    }

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
    })

    backendContainer.addPortMappings({
      containerPort: 8080,
      protocol: ecs.Protocol.TCP,
    })

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
    })

    // Auto Scaling for ECS service in production
    if (isProd) {
      const scaling = this.backendService.autoScaleTaskCount({
        minCapacity: 2,
        maxCapacity: 10,
      })

      scaling.scaleOnCpuUtilization('CpuScaling', {
        targetUtilizationPercent: 70,
        scaleInCooldown: cdk.Duration.seconds(300),
        scaleOutCooldown: cdk.Duration.seconds(300),
      })

      scaling.scaleOnMemoryUtilization('MemoryScaling', {
        targetUtilizationPercent: 80,
        scaleInCooldown: cdk.Duration.seconds(300),
        scaleOutCooldown: cdk.Duration.seconds(300),
      })
    }

    // Application Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      loadBalancerName: `realworld-alb-${environment}`,
    })

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
    })

    // HTTP Listener
    const httpListener = this.loadBalancer.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultAction: elbv2.ListenerAction.forward([targetGroup]),
    })

    // Route API requests to backend
    httpListener.addAction('ApiRouting', {
      priority: 100,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/api/*', '/health']),
      ],
      action: elbv2.ListenerAction.forward([targetGroup]),
    })

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
    })

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: this.loadBalancer.loadBalancerDnsName,
      exportName: `${environment}-LoadBalancerDNS`,
      description: 'DNS name of the Application Load Balancer',
    })

    new cdk.CfnOutput(this, 'LoadBalancerArn', {
      value: this.loadBalancer.loadBalancerArn,
      exportName: `${environment}-LoadBalancerArn`,
      description: 'ARN of the Application Load Balancer',
    })

    new cdk.CfnOutput(this, 'ClusterName', {
      value: this.cluster.clusterName,
      exportName: `${environment}-ClusterName`,
      description: 'Name of the ECS cluster',
    })

    new cdk.CfnOutput(this, 'BackendRepositoryUri', {
      value: this.backendRepository.repositoryUri,
      exportName: `${environment}-BackendRepositoryUri`,
      description: 'URI of the backend ECR repository',
    })

    new cdk.CfnOutput(this, 'BackendServiceName', {
      value: this.backendService.serviceName,
      exportName: `${environment}-BackendServiceName`,
      description: 'Name of the backend ECS service',
    })
  }
}