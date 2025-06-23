import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
export interface MonitoringStackProps extends cdk.StackProps {
    environment: string;
    ecsService: ecs.FargateService;
    database: rds.DatabaseInstance;
    loadBalancer: elbv2.ApplicationLoadBalancer;
}
export declare class MonitoringStack extends cdk.Stack {
    readonly dashboard: cloudwatch.Dashboard;
    readonly alertsTopic: sns.Topic;
    constructor(scope: Construct, id: string, props: MonitoringStackProps);
    private createEcsMetrics;
    private createDatabaseMetrics;
    private createLoadBalancerMetrics;
    private createAlarms;
    private createCustomMetrics;
}
