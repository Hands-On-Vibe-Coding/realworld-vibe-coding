import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins'
import { Construct } from 'constructs'

export class RealWorldStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster
  public readonly backendService: ecs.FargateService
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer
  public readonly backendRepository: ecr.Repository
  public readonly distribution: cloudfront.Distribution

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Create VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
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

    // Security Group for ALB (Allow HTTP/HTTPS from anywhere)
    const albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    })

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP from anywhere'
    )

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS from anywhere'
    )

    // Security Group for ECS (Allow traffic from ALB only)
    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'ECSSecurityGroup', {
      vpc,
      description: 'Security group for ECS tasks',
      allowAllOutbound: true,
    })

    ecsSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.tcp(8080),
      'Allow traffic from ALB'
    )

    // ECR Repository for backend container images
    this.backendRepository = new ecr.Repository(this, 'BackendRepository', {
      repositoryName: 'realworld-backend',
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      lifecycleRules: [
        {
          description: 'Keep last 5 images only',
          maxImageCount: 5,
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Educational project - always destroy
    })

    // ECS Cluster
    this.cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: 'realworld',
      vpc,
      containerInsights: false, // Disable for cost savings
    })

    // CloudWatch Log Group for ECS
    const logGroup = new logs.LogGroup(this, 'ECSLogGroup', {
      logGroupName: '/ecs/realworld-backend',
      retention: logs.RetentionDays.ONE_WEEK, // Short retention for cost savings
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Task Execution Role - minimal permissions
    const executionRole = new iam.Role(this, 'ExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    })

    // Allow execution role to pull images from ECR
    this.backendRepository.grantPull(executionRole)

    // Task Definition with minimal resources
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'BackendTaskDefinition', {
      memoryLimitMiB: 512, // Minimal memory for education
      cpu: 256, // 0.25 vCPU - minimal CPU
      executionRole,
      // No task role needed for SQLite-based app
    })

    // Backend Container
    const backendContainer = taskDefinition.addContainer('backend', {
      image: ecs.ContainerImage.fromEcrRepository(this.backendRepository, 'latest'),
      memoryLimitMiB: 512,
      cpu: 256,
      environment: {
        PORT: '8080',
        DATABASE_URL: '/data/realworld.db', // SQLite file path
        JWT_SECRET: 'educational-jwt-secret-change-in-prod', // Simple secret for education
        ENVIRONMENT: 'production',
      },
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

    // Expose port 8080
    backendContainer.addPortMappings({
      containerPort: 8080,
      protocol: ecs.Protocol.TCP,
    })

    // Application Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      loadBalancerName: 'realworld-alb',
    })

    // Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      port: 8080,
      protocol: elbv2.ApplicationProtocol.HTTP,
      vpc,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/health',
        healthyHttpCodes: '200',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
    })

    // ALB Listener
    this.loadBalancer.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [targetGroup],
    })

    // Fargate Service (will use Spot pricing when available)
    this.backendService = new ecs.FargateService(this, 'BackendService', {
      cluster: this.cluster,
      taskDefinition,
      serviceName: 'realworld-backend',
      desiredCount: 0, // Start with 0, will be updated by deployment
      minHealthyPercent: 0, // Allow complete replacement for cost savings
      maxHealthyPercent: 200,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 1,
        },
      ],
      enableExecuteCommand: false, // Disable for security and cost
    })

    // Attach target group to service
    this.backendService.attachToApplicationTargetGroup(targetGroup)

    // CloudFront Distribution for HTTPS
    this.distribution = new cloudfront.Distribution(this, 'BackendDistribution', {
      defaultBehavior: {
        origin: new cloudfrontOrigins.LoadBalancerV2Origin(this.loadBalancer, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          httpPort: 80,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // Disable caching for API
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe for cost savings
      comment: 'RealWorld Backend CloudFront Distribution',
    })

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: this.loadBalancer.loadBalancerDnsName,
      exportName: 'LoadBalancerDNS',
      description: 'Application Load Balancer DNS name',
    })

    new cdk.CfnOutput(this, 'BackendRepositoryURI', {
      value: this.backendRepository.repositoryUri,
      exportName: 'BackendRepositoryURI',
      description: 'ECR repository URI for backend images',
    })

    new cdk.CfnOutput(this, 'ClusterName', {
      value: this.cluster.clusterName,
      exportName: 'ClusterName',
      description: 'ECS cluster name',
    })

    new cdk.CfnOutput(this, 'ServiceName', {
      value: this.backendService.serviceName,
      exportName: 'ServiceName',
      description: 'ECS service name',
    })

    new cdk.CfnOutput(this, 'BackendURL', {
      value: `http://${this.loadBalancer.loadBalancerDnsName}`,
      exportName: 'BackendURL',
      description: 'Backend application URL',
    })

    new cdk.CfnOutput(this, 'BackendHTTPSURL', {
      value: `https://${this.distribution.distributionDomainName}`,
      exportName: 'BackendHTTPSURL',
      description: 'Backend HTTPS URL via CloudFront',
    })

    new cdk.CfnOutput(this, 'CloudFrontDomain', {
      value: this.distribution.distributionDomainName,
      exportName: 'CloudFrontDomain',
      description: 'CloudFront distribution domain name',
    })
  }
}