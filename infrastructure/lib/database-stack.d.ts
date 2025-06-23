import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
export interface DatabaseStackProps extends cdk.StackProps {
    environment: string;
    vpc: ec2.Vpc;
}
export declare class DatabaseStack extends cdk.Stack {
    readonly database: rds.DatabaseInstance;
    readonly databaseSecret: secretsmanager.Secret;
    constructor(scope: Construct, id: string, props: DatabaseStackProps);
}
