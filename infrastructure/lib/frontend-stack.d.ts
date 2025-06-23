import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
export interface FrontendStackProps extends cdk.StackProps {
    environment: string;
    loadBalancer: elbv2.ApplicationLoadBalancer;
}
export declare class FrontendStack extends cdk.Stack {
    readonly bucket: s3.Bucket;
    readonly distribution: cloudfront.Distribution;
    constructor(scope: Construct, id: string, props: FrontendStackProps);
}
