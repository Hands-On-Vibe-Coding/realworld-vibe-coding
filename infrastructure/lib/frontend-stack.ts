import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import { Construct } from 'constructs'

export interface FrontendStackProps extends cdk.StackProps {
  environment: string
  loadBalancer: elbv2.ApplicationLoadBalancer
}

export class FrontendStack extends cdk.Stack {
  public readonly bucket: s3.Bucket
  public readonly distribution: cloudfront.Distribution

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props)

    const { environment, loadBalancer } = props
    const isProd = environment === 'production'

    // S3 Bucket for static website hosting
    this.bucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `realworld-frontend-${environment}-${this.account}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // SPA routing
      publicReadAccess: false, // Will be accessed via CloudFront only
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
      versioned: isProd,
      encryption: s3.BucketEncryption.S3_MANAGED,
    })

    // Origin Access Control for CloudFront to access S3
    const originAccessControl = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      description: `OAC for RealWorld frontend ${environment}`,
    })

    // Cache policy for static assets
    const staticAssetsCachePolicy = new cloudfront.CachePolicy(this, 'StaticAssetsCachePolicy', {
      cachePolicyName: `RealWorld-StaticAssets-${environment}`,
      comment: 'Cache policy for static assets (JS, CSS, images)',
      defaultTtl: cdk.Duration.days(30),
      maxTtl: cdk.Duration.days(365),
      minTtl: cdk.Duration.seconds(0),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
    })

    // Cache policy for HTML files (no caching for SPA)
    const htmlCachePolicy = new cloudfront.CachePolicy(this, 'HtmlCachePolicy', {
      cachePolicyName: `RealWorld-Html-${environment}`,
      comment: 'Cache policy for HTML files',
      defaultTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.days(1),
      minTtl: cdk.Duration.seconds(0),
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList('CloudFront-Viewer-Country'),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
    })

    // Origin request policy for API requests
    const apiOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'ApiOriginRequestPolicy', {
      originRequestPolicyName: `RealWorld-Api-${environment}`,
      comment: 'Origin request policy for API requests',
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
        'Content-Type',
        'Accept',
        'Origin',
        'Referer',
        'User-Agent'
      ),
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
    })

    // Response headers policy for security
    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeadersPolicy', {
      responseHeadersPolicyName: `RealWorld-Security-${environment}`,
      comment: 'Security headers policy',
      securityHeadersBehavior: {
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        referrerPolicy: { 
          referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, 
          override: true 
        },
        strictTransportSecurity: {
          accessControlMaxAge: cdk.Duration.seconds(31536000),
          includeSubdomains: true,
          preload: true,
          override: true,
        },
        contentSecurityPolicy: {
          contentSecurityPolicy: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https:",
            "frame-ancestors 'none'",
          ].join('; '),
          override: true,
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          { header: 'X-Application', value: 'RealWorld', override: true },
          { header: 'X-Environment', value: environment, override: true },
        ],
      },
    })

    // CloudFront Distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `RealWorld frontend distribution (${environment})`,
      defaultRootObject: 'index.html',
      
      // Origins
      additionalBehaviors: {
        // API requests go to ALB
        '/api/*': {
          origin: new origins.LoadBalancerV2Origin(loadBalancer, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            httpPort: 80,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: apiOriginRequestPolicy,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
        
        // Health check endpoint
        '/health': {
          origin: new origins.LoadBalancerV2Origin(loadBalancer, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            httpPort: 80,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        },

        // Static assets with long-term caching
        '*.js': {
          origin: new origins.S3Origin(this.bucket, {
            originAccessControlId: originAccessControl.originAccessControlId,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: staticAssetsCachePolicy,
          responseHeadersPolicy,
        },
        
        '*.css': {
          origin: new origins.S3Origin(this.bucket, {
            originAccessControlId: originAccessControl.originAccessControlId,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: staticAssetsCachePolicy,
          responseHeadersPolicy,
        },
        
        '*.png': {
          origin: new origins.S3Origin(this.bucket, {
            originAccessControlId: originAccessControl.originAccessControlId,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: staticAssetsCachePolicy,
          responseHeadersPolicy,
        },
        
        '*.jpg': {
          origin: new origins.S3Origin(this.bucket, {
            originAccessControlId: originAccessControl.originAccessControlId,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: staticAssetsCachePolicy,
          responseHeadersPolicy,
        },
        
        '*.svg': {
          origin: new origins.S3Origin(this.bucket, {
            originAccessControlId: originAccessControl.originAccessControlId,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: staticAssetsCachePolicy,
          responseHeadersPolicy,
        },
      },
      
      // Default behavior for HTML and SPA routing
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, {
          originAccessControlId: originAccessControl.originAccessControlId,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: htmlCachePolicy,
        responseHeadersPolicy,
        functionAssociations: [
          {
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: new cloudfront.Function(this, 'SpaRoutingFunction', {
              functionName: `realworld-spa-routing-${environment}`,
              code: cloudfront.FunctionCode.fromInline(`
                function handler(event) {
                  var request = event.request;
                  var uri = request.uri;
                  
                  // Check if the URI has a file extension
                  if (!uri.includes('.')) {
                    // No file extension, serve index.html for SPA routing
                    request.uri = '/index.html';
                  }
                  
                  return request;
                }
              `),
            }),
          },
        ],
      },
      
      // Error responses for SPA
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      
      // Geographic restrictions - none for development
      geoRestriction: isProd 
        ? cloudfront.GeoRestriction.allowlist('US', 'CA', 'GB', 'DE', 'FR', 'JP', 'KR')
        : undefined,
      
      // Price class
      priceClass: isProd 
        ? cloudfront.PriceClass.PRICE_CLASS_ALL
        : cloudfront.PriceClass.PRICE_CLASS_100,
      
      // Logging
      enableLogging: isProd,
      logBucket: isProd ? new s3.Bucket(this, 'LogsBucket', {
        bucketName: `realworld-cloudfront-logs-${environment}-${this.account}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      }) : undefined,
      logFilePrefix: isProd ? `cloudfront-logs/${environment}/` : undefined,
    })

    // Grant CloudFront access to S3 bucket
    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        resources: [this.bucket.arnForObjects('*')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
          },
        },
      })
    )

    // Deploy frontend assets (placeholder - will be updated by CI/CD)
    new s3deploy.BucketDeployment(this, 'FrontendDeployment', {
      sources: [
        s3deploy.Source.data('index.html', `
          <!DOCTYPE html>
          <html>
            <head>
              <title>RealWorld - ${environment}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
              <div id="root">
                <h1>RealWorld Application</h1>
                <p>Environment: ${environment}</p>
                <p>This is a placeholder page. Deploy your React build here.</p>
              </div>
            </body>
          </html>
        `),
      ],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    })

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      exportName: `${environment}-FrontendBucketName`,
      description: 'Name of the S3 bucket for frontend assets',
    })

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      exportName: `${environment}-DistributionId`,
      description: 'CloudFront distribution ID',
    })

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      exportName: `${environment}-DistributionDomainName`,
      description: 'CloudFront distribution domain name',
    })

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      exportName: `${environment}-WebsiteUrl`,
      description: 'Website URL',
    })
  }
}