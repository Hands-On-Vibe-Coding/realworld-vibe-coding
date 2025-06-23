import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
export interface NetworkStackProps extends cdk.StackProps {
    environment: string;
}
export declare class NetworkStack extends cdk.Stack {
    readonly vpc: ec2.Vpc;
    constructor(scope: Construct, id: string, props: NetworkStackProps);
    readonly albSecurityGroup: ec2.SecurityGroup;
    readonly ecsSecurityGroup: ec2.SecurityGroup;
    readonly rdsSecurityGroup: ec2.SecurityGroup;
}
