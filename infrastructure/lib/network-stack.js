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
exports.NetworkStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
class NetworkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { environment } = props;
        const isProd = environment === 'production';
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
        });
        // VPC Flow Logs for security monitoring
        if (isProd) {
            const flowLogRole = new cdk.aws_iam.Role(this, 'FlowLogRole', {
                assumedBy: new cdk.aws_iam.ServicePrincipal('vpc-flow-logs.amazonaws.com'),
            });
            const flowLogGroup = new cdk.aws_logs.LogGroup(this, 'VpcFlowLogGroup', {
                logGroupName: `/aws/vpc/flowlogs/${environment}`,
                retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
            });
            flowLogRole.addToPolicy(new cdk.aws_iam.PolicyStatement({
                actions: [
                    'logs:CreateLogGroup',
                    'logs:CreateLogStream',
                    'logs:PutLogEvents',
                    'logs:DescribeLogGroups',
                    'logs:DescribeLogStreams',
                ],
                resources: [flowLogGroup.logGroupArn],
            }));
            new ec2.FlowLog(this, 'VpcFlowLog', {
                resourceType: ec2.FlowLogResourceType.fromVpc(this.vpc),
                destination: ec2.FlowLogDestination.toCloudWatchLogs(flowLogGroup, flowLogRole),
                trafficType: ec2.FlowLogTrafficType.ALL,
            });
        }
        // Security Group for ALB
        const albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for Application Load Balancer',
            allowAllOutbound: true,
        });
        albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic from anywhere');
        albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic from anywhere');
        // Security Group for ECS
        const ecsSecurityGroup = new ec2.SecurityGroup(this, 'ECSSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for ECS services',
            allowAllOutbound: true,
        });
        ecsSecurityGroup.addIngressRule(albSecurityGroup, ec2.Port.tcp(8080), 'Allow traffic from ALB to backend service');
        // Security Group for RDS
        const rdsSecurityGroup = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for RDS database',
            allowAllOutbound: false,
        });
        rdsSecurityGroup.addIngressRule(ecsSecurityGroup, ec2.Port.tcp(5432), 'Allow traffic from ECS to PostgreSQL');
        // Export security groups for use in other stacks
        new cdk.CfnOutput(this, 'ALBSecurityGroupId', {
            value: albSecurityGroup.securityGroupId,
            exportName: `${environment}-ALBSecurityGroupId`,
            description: 'Security Group ID for Application Load Balancer',
        });
        new cdk.CfnOutput(this, 'ECSSecurityGroupId', {
            value: ecsSecurityGroup.securityGroupId,
            exportName: `${environment}-ECSSecurityGroupId`,
            description: 'Security Group ID for ECS services',
        });
        new cdk.CfnOutput(this, 'RDSSecurityGroupId', {
            value: rdsSecurityGroup.securityGroupId,
            exportName: `${environment}-RDSSecurityGroupId`,
            description: 'Security Group ID for RDS database',
        });
        new cdk.CfnOutput(this, 'VpcId', {
            value: this.vpc.vpcId,
            exportName: `${environment}-VpcId`,
            description: 'VPC ID for the RealWorld application',
        });
        // Store security groups as properties for easy access
        this.albSecurityGroup = albSecurityGroup;
        this.ecsSecurityGroup = ecsSecurityGroup;
        this.rdsSecurityGroup = rdsSecurityGroup;
    }
}
exports.NetworkStack = NetworkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5ldHdvcmstc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQWtDO0FBQ2xDLHlEQUEwQztBQU8xQyxNQUFhLFlBQWEsU0FBUSxHQUFHLENBQUMsS0FBSztJQUd6QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXdCO1FBQ2hFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBRXZCLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxLQUFLLENBQUE7UUFDN0IsTUFBTSxNQUFNLEdBQUcsV0FBVyxLQUFLLFlBQVksQ0FBQTtRQUUzQyw2Q0FBNkM7UUFDN0MsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUNsQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSw4Q0FBOEM7WUFDdEUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsNkNBQTZDO1lBQzFFLG1CQUFtQixFQUFFO2dCQUNuQjtvQkFDRSxRQUFRLEVBQUUsRUFBRTtvQkFDWixJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNO2lCQUNsQztnQkFDRDtvQkFDRSxRQUFRLEVBQUUsRUFBRTtvQkFDWixJQUFJLEVBQUUsYUFBYTtvQkFDbkIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CO2lCQUMvQztnQkFDRDtvQkFDRSxRQUFRLEVBQUUsRUFBRTtvQkFDWixJQUFJLEVBQUUsWUFBWTtvQkFDbEIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFV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QUE7UUFDeEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFBO0lBQzFDLENBQUM7Q0FLRjtBQWpKRCxvQ0FpSkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMidcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgTmV0d29ya1N0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIGVudmlyb25tZW50OiBzdHJpbmdcbn1cblxuZXhwb3J0IGNsYXNzIE5ldHdvcmtTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSB2cGM6IGVjMi5WcGNcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogTmV0d29ya1N0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKVxuXG4gICAgY29uc3QgeyBlbnZpcm9ubWVudCB9ID0gcHJvcHNcbiAgICBjb25zdCBpc1Byb2QgPSBlbnZpcm9ubWVudCA9PT0gJ3Byb2R1Y3Rpb24nXG5cbiAgICAvLyBDcmVhdGUgVlBDIHdpdGggcHVibGljIGFuZCBwcml2YXRlIHN1Ym5ldHNcbiAgICB0aGlzLnZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsICdWUEMnLCB7XG4gICAgICBtYXhBenM6IGlzUHJvZCA/IDMgOiAyLCAvLyBVc2UgMyBBWnMgZm9yIHByb2R1Y3Rpb24sIDIgZm9yIGRldi9zdGFnaW5nXG4gICAgICBuYXRHYXRld2F5czogaXNQcm9kID8gMiA6IDEsIC8vIE11bHRpcGxlIE5BVCBnYXRld2F5cyBmb3IgSEEgaW4gcHJvZHVjdGlvblxuICAgICAgc3VibmV0Q29uZmlndXJhdGlvbjogW1xuICAgICAgICB7XG4gICAgICAgICAgY2lkck1hc2s6IDI0LFxuICAgICAgICAgIG5hbWU6ICdwdWJsaWMnLFxuICAgICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGNpZHJNYXNrOiAyNCxcbiAgICAgICAgICBuYW1lOiAncHJpdmF0ZS1hcHAnLFxuICAgICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBSSVZBVEVfV0lUSF9FR1JFU1MsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgICAgbmFtZTogJ3ByaXZhdGUtZGInLFxuICAgICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBSSVZBVEVfSVNPTEFURUQsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZW5hYmxlRG5zSG9zdG5hbWVzOiB0cnVlLFxuICAgICAgZW5hYmxlRG5zU3VwcG9ydDogdHJ1ZSxcbiAgICB9KVxuXG4gICAgLy8gVlBDIEZsb3cgTG9ncyBmb3Igc2VjdXJpdHkgbW9uaXRvcmluZ1xuICAgIGlmIChpc1Byb2QpIHtcbiAgICAgIGNvbnN0IGZsb3dMb2dSb2xlID0gbmV3IGNkay5hd3NfaWFtLlJvbGUodGhpcywgJ0Zsb3dMb2dSb2xlJywge1xuICAgICAgICBhc3N1bWVkQnk6IG5ldyBjZGsuYXdzX2lhbS5TZXJ2aWNlUHJpbmNpcGFsKCd2cGMtZmxvdy1sb2dzLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGZsb3dMb2dHcm91cCA9IG5ldyBjZGsuYXdzX2xvZ3MuTG9nR3JvdXAodGhpcywgJ1ZwY0Zsb3dMb2dHcm91cCcsIHtcbiAgICAgICAgbG9nR3JvdXBOYW1lOiBgL2F3cy92cGMvZmxvd2xvZ3MvJHtlbnZpcm9ubWVudH1gLFxuICAgICAgICByZXRlbnRpb246IGNkay5hd3NfbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9NT05USCxcbiAgICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIH0pXG5cbiAgICAgIGZsb3dMb2dSb2xlLmFkZFRvUG9saWN5KFxuICAgICAgICBuZXcgY2RrLmF3c19pYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAnbG9nczpDcmVhdGVMb2dHcm91cCcsXG4gICAgICAgICAgICAnbG9nczpDcmVhdGVMb2dTdHJlYW0nLFxuICAgICAgICAgICAgJ2xvZ3M6UHV0TG9nRXZlbnRzJyxcbiAgICAgICAgICAgICdsb2dzOkRlc2NyaWJlTG9nR3JvdXBzJyxcbiAgICAgICAgICAgICdsb2dzOkRlc2NyaWJlTG9nU3RyZWFtcycsXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFtmbG93TG9nR3JvdXAubG9nR3JvdXBBcm5dLFxuICAgICAgICB9KVxuICAgICAgKVxuXG4gICAgICBuZXcgZWMyLkZsb3dMb2codGhpcywgJ1ZwY0Zsb3dMb2cnLCB7XG4gICAgICAgIHJlc291cmNlVHlwZTogZWMyLkZsb3dMb2dSZXNvdXJjZVR5cGUuZnJvbVZwYyh0aGlzLnZwYyksXG4gICAgICAgIGRlc3RpbmF0aW9uOiBlYzIuRmxvd0xvZ0Rlc3RpbmF0aW9uLnRvQ2xvdWRXYXRjaExvZ3MoZmxvd0xvZ0dyb3VwLCBmbG93TG9nUm9sZSksXG4gICAgICAgIHRyYWZmaWNUeXBlOiBlYzIuRmxvd0xvZ1RyYWZmaWNUeXBlLkFMTCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gU2VjdXJpdHkgR3JvdXAgZm9yIEFMQlxuICAgIGNvbnN0IGFsYlNlY3VyaXR5R3JvdXAgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgJ0FMQlNlY3VyaXR5R3JvdXAnLCB7XG4gICAgICB2cGM6IHRoaXMudnBjLFxuICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBncm91cCBmb3IgQXBwbGljYXRpb24gTG9hZCBCYWxhbmNlcicsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgIH0pXG5cbiAgICBhbGJTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgICAgZWMyLlBvcnQudGNwKDgwKSxcbiAgICAgICdBbGxvdyBIVFRQIHRyYWZmaWMgZnJvbSBhbnl3aGVyZSdcbiAgICApXG5cbiAgICBhbGJTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgICAgZWMyLlBvcnQudGNwKDQ0MyksXG4gICAgICAnQWxsb3cgSFRUUFMgdHJhZmZpYyBmcm9tIGFueXdoZXJlJ1xuICAgIClcblxuICAgIC8vIFNlY3VyaXR5IEdyb3VwIGZvciBFQ1NcbiAgICBjb25zdCBlY3NTZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdFQ1NTZWN1cml0eUdyb3VwJywge1xuICAgICAgdnBjOiB0aGlzLnZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIEVDUyBzZXJ2aWNlcycsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgIH0pXG5cbiAgICBlY3NTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgYWxiU2VjdXJpdHlHcm91cCxcbiAgICAgIGVjMi5Qb3J0LnRjcCg4MDgwKSxcbiAgICAgICdBbGxvdyB0cmFmZmljIGZyb20gQUxCIHRvIGJhY2tlbmQgc2VydmljZSdcbiAgICApXG5cbiAgICAvLyBTZWN1cml0eSBHcm91cCBmb3IgUkRTXG4gICAgY29uc3QgcmRzU2VjdXJpdHlHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnUkRTU2VjdXJpdHlHcm91cCcsIHtcbiAgICAgIHZwYzogdGhpcy52cGMsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5IGdyb3VwIGZvciBSRFMgZGF0YWJhc2UnLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogZmFsc2UsXG4gICAgfSlcblxuICAgIHJkc1NlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBlY3NTZWN1cml0eUdyb3VwLFxuICAgICAgZWMyLlBvcnQudGNwKDU0MzIpLFxuICAgICAgJ0FsbG93IHRyYWZmaWMgZnJvbSBFQ1MgdG8gUG9zdGdyZVNRTCdcbiAgICApXG5cbiAgICAvLyBFeHBvcnQgc2VjdXJpdHkgZ3JvdXBzIGZvciB1c2UgaW4gb3RoZXIgc3RhY2tzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FMQlNlY3VyaXR5R3JvdXBJZCcsIHtcbiAgICAgIHZhbHVlOiBhbGJTZWN1cml0eUdyb3VwLnNlY3VyaXR5R3JvdXBJZCxcbiAgICAgIGV4cG9ydE5hbWU6IGAke2Vudmlyb25tZW50fS1BTEJTZWN1cml0eUdyb3VwSWRgLFxuICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBHcm91cCBJRCBmb3IgQXBwbGljYXRpb24gTG9hZCBCYWxhbmNlcicsXG4gICAgfSlcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdFQ1NTZWN1cml0eUdyb3VwSWQnLCB7XG4gICAgICB2YWx1ZTogZWNzU2VjdXJpdHlHcm91cC5zZWN1cml0eUdyb3VwSWQsXG4gICAgICBleHBvcnROYW1lOiBgJHtlbnZpcm9ubWVudH0tRUNTU2VjdXJpdHlHcm91cElkYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgR3JvdXAgSUQgZm9yIEVDUyBzZXJ2aWNlcycsXG4gICAgfSlcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdSRFNTZWN1cml0eUdyb3VwSWQnLCB7XG4gICAgICB2YWx1ZTogcmRzU2VjdXJpdHlHcm91cC5zZWN1cml0eUdyb3VwSWQsXG4gICAgICBleHBvcnROYW1lOiBgJHtlbnZpcm9ubWVudH0tUkRTU2VjdXJpdHlHcm91cElkYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgR3JvdXAgSUQgZm9yIFJEUyBkYXRhYmFzZScsXG4gICAgfSlcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdWcGNJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLnZwYy52cGNJZCxcbiAgICAgIGV4cG9ydE5hbWU6IGAke2Vudmlyb25tZW50fS1WcGNJZGAsXG4gICAgICBkZXNjcmlwdGlvbjogJ1ZQQyBJRCBmb3IgdGhlIFJlYWxXb3JsZCBhcHBsaWNhdGlvbicsXG4gICAgfSlcblxuICAgIC8vIFN0b3JlIHNlY3VyaXR5IGdyb3VwcyBhcyBwcm9wZXJ0aWVzIGZvciBlYXN5IGFjY2Vzc1xuICAgIHRoaXMuYWxiU2VjdXJpdHlHcm91cCA9IGFsYlNlY3VyaXR5R3JvdXBcbiAgICB0aGlzLmVjc1NlY3VyaXR5R3JvdXAgPSBlY3NTZWN1cml0eUdyb3VwXG4gICAgdGhpcy5yZHNTZWN1cml0eUdyb3VwID0gcmRzU2VjdXJpdHlHcm91cFxuICB9XG5cbiAgcHVibGljIHJlYWRvbmx5IGFsYlNlY3VyaXR5R3JvdXA6IGVjMi5TZWN1cml0eUdyb3VwXG4gIHB1YmxpYyByZWFkb25seSBlY3NTZWN1cml0eUdyb3VwOiBlYzIuU2VjdXJpdHlHcm91cFxuICBwdWJsaWMgcmVhZG9ubHkgcmRzU2VjdXJpdHlHcm91cDogZWMyLlNlY3VyaXR5R3JvdXBcbn0iXX0=