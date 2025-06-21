import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'

export interface NetworkStackProps extends cdk.StackProps {
  environment: string
}

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props)

    const { environment } = props
    const isProd = environment === 'production'

    // Create VPC with public and private subnets
    this.vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: isProd ? 3 : 2, // Use 3 AZs for production, 2 for dev/staging
      natGateways: isProd ? 2 : 1, // Multiple NAT gateways for HA in production
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
        {
          cidrMask: 24,
          name: 'private-db',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    })

    // VPC Flow Logs for security monitoring
    if (isProd) {
      const flowLogRole = new cdk.aws_iam.Role(this, 'FlowLogRole', {
        assumedBy: new cdk.aws_iam.ServicePrincipal('vpc-flow-logs.amazonaws.com'),
      })

      const flowLogGroup = new cdk.aws_logs.LogGroup(this, 'VpcFlowLogGroup', {
        logGroupName: `/aws/vpc/flowlogs/${environment}`,
        retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      })

      flowLogRole.addToPolicy(
        new cdk.aws_iam.PolicyStatement({
          actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
            'logs:DescribeLogGroups',
            'logs:DescribeLogStreams',
          ],
          resources: [flowLogGroup.logGroupArn],
        })
      )

      new ec2.FlowLog(this, 'VpcFlowLog', {
        resourceType: ec2.FlowLogResourceType.fromVpc(this.vpc),
        destination: ec2.FlowLogDestination.toCloudWatchLogs(flowLogGroup, flowLogRole),
        trafficType: ec2.FlowLogTrafficType.ALL,
      })
    }

    // Security Group for ALB
    const albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    })

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from anywhere'
    )

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic from anywhere'
    )

    // Security Group for ECS
    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'ECSSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for ECS services',
      allowAllOutbound: true,
    })

    ecsSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.tcp(8080),
      'Allow traffic from ALB to backend service'
    )

    // Security Group for RDS
    const rdsSecurityGroup = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for RDS database',
      allowAllOutbound: false,
    })

    rdsSecurityGroup.addIngressRule(
      ecsSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow traffic from ECS to PostgreSQL'
    )

    // Export security groups for use in other stacks
    new cdk.CfnOutput(this, 'ALBSecurityGroupId', {
      value: albSecurityGroup.securityGroupId,
      exportName: `${environment}-ALBSecurityGroupId`,
      description: 'Security Group ID for Application Load Balancer',
    })

    new cdk.CfnOutput(this, 'ECSSecurityGroupId', {
      value: ecsSecurityGroup.securityGroupId,
      exportName: `${environment}-ECSSecurityGroupId`,
      description: 'Security Group ID for ECS services',
    })

    new cdk.CfnOutput(this, 'RDSSecurityGroupId', {
      value: rdsSecurityGroup.securityGroupId,
      exportName: `${environment}-RDSSecurityGroupId`,
      description: 'Security Group ID for RDS database',
    })

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      exportName: `${environment}-VpcId`,
      description: 'VPC ID for the RealWorld application',
    })

    // Store security groups as properties for easy access
    this.albSecurityGroup = albSecurityGroup
    this.ecsSecurityGroup = ecsSecurityGroup
    this.rdsSecurityGroup = rdsSecurityGroup
  }

  public readonly albSecurityGroup: ec2.SecurityGroup
  public readonly ecsSecurityGroup: ec2.SecurityGroup
  public readonly rdsSecurityGroup: ec2.SecurityGroup
}