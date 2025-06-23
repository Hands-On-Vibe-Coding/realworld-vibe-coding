import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
export interface EcsStackProps extends cdk.StackProps {
    environment: string;
    vpc: ec2.Vpc;
    database: rds.DatabaseInstance;
}
export declare class EcsStack extends cdk.Stack {
    readonly cluster: ecs.Cluster;
    readonly backendService: ecs.FargateService;
    readonly loadBalancer: elbv2.ApplicationLoadBalancer;
    readonly backendRepository: ecr.Repository;
    constructor(scope: Construct, id: string, props: EcsStackProps);
}
