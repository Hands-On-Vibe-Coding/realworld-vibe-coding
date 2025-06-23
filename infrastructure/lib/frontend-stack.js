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
exports.FrontendStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const cloudfront = __importStar(require("aws-cdk-lib/aws-cloudfront"));
const origins = __importStar(require("aws-cdk-lib/aws-cloudfront-origins"));
const s3deploy = __importStar(require("aws-cdk-lib/aws-s3-deployment"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
class FrontendStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { environment, loadBalancer } = props;
        const isProd = environment === 'production';
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
        });
        // Origin Access Control for CloudFront to access S3
        const originAccessControl = new cloudfront.S3OriginAccessControl(this, 'OAC', {
            description: `OAC for RealWorld frontend ${environment}`,
        });
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
        });
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
        });
        // Origin request policy for API requests
        const apiOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'ApiOriginRequestPolicy', {
            originRequestPolicyName: `RealWorld-Api-${environment}`,
            comment: 'Origin request policy for API requests',
            headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList('Content-Type', 'Accept', 'Origin', 'Referer', 'User-Agent'),
            queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
            cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
        });
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
        });
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
        });
        // Grant CloudFront access to S3 bucket
        this.bucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
            resources: [this.bucket.arnForObjects('*')],
            conditions: {
                StringEquals: {
                    'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
                },
            },
        }));
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
        });
        // Outputs
        new cdk.CfnOutput(this, 'BucketName', {
            value: this.bucket.bucketName,
            exportName: `${environment}-FrontendBucketName`,
            description: 'Name of the S3 bucket for frontend assets',
        });
        new cdk.CfnOutput(this, 'DistributionId', {
            value: this.distribution.distributionId,
            exportName: `${environment}-DistributionId`,
            description: 'CloudFront distribution ID',
        });
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: this.distribution.distributionDomainName,
            exportName: `${environment}-DistributionDomainName`,
            description: 'CloudFront distribution domain name',
        });
        new cdk.CfnOutput(this, 'WebsiteUrl', {
            value: `https://${this.distribution.distributionDomainName}`,
            exportName: `${environment}-WebsiteUrl`,
            description: 'Website URL',
        });
    }
}
exports.FrontendStack = FrontendStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbnRlbmQtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmcm9udGVuZC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBa0M7QUFDbEMsdURBQXdDO0FBQ3hDLHVFQUF3RDtBQUN4RCw0RUFBNkQ7QUFDN0Qsd0VBQXlEO0FBQ3pELHlEQUEwQztBQVMxQyxNQUFhLGFBQWMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUkxQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXlCO1FBQ2pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBRXZCLE1BQU0sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLEdBQUcsS0FBSyxDQUFBO1FBQzNDLE1BQU0sTUFBTSxHQUFHLFdBQVcsS0FBSyxZQUFZLENBQUE7UUFFM0MsdUNBQXVDO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNsRCxVQUFVLEVBQUUsc0JBQXNCLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQy9ELG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsWUFBWSxFQUFFLGNBQWM7WUFDbEQsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLHVDQUF1QztZQUNoRSxpQkFBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUztZQUNqRCxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQzVFLGlCQUFpQixFQUFFLENBQUMsTUFBTTtZQUMxQixTQUFTLEVBQUUsTUFBTTtZQUNqQixVQUFVLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixD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RSxJQUFJLENBQUMsTUFBTTtZQUM5QixZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7WUFDL0IsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUM7U0FDMUIsQ0FBQyxDQUFBO1FBRUYsVUFBVTtRQUNWLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7WUFDN0IsVUFBVSxFQUFFLEdBQUcsV0FBVyxxQkFBcUI7WUFDL0MsV0FBVyxFQUFFLDJDQUEyQztTQUN6RCxDQUFDLENBQUE7UUFFRixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3hDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWM7WUFDdkMsVUFBVSxFQUFFLEdBQUcsV0FBVyxpQkFBaUI7WUFDM0MsV0FBVyxFQUFFLDRCQUE0QjtTQUMxQyxDQUFDLENBQUE7UUFFRixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQ2hELEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLHNCQUFzQjtZQUMvQyxVQUFVLEVBQUUsR0FBRyxXQUFXLHlCQUF5QjtZQUNuRCxXQUFXLEVBQUUscUNBQXFDO1NBQ25ELENBQUMsQ0FBQTtRQUVGLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxXQUFXLElBQUksQ0FBQyxZQUFZLENBQUMsc0JBQXNCLEVBQUU7WUFDNUQsVUFBVSxFQUFFLEdBQUcsV0FBVyxhQUFhO1lBQ3ZDLFdBQVcsRUFBRSxhQUFhO1NBQzNCLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRjtBQTNURCxzQ0EyVEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnXG5pbXBvcnQgKiBhcyBjbG91ZGZyb250IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250J1xuaW1wb3J0ICogYXMgb3JpZ2lucyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udC1vcmlnaW5zJ1xuaW1wb3J0ICogYXMgczNkZXBsb3kgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLWRlcGxveW1lbnQnXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSdcbmltcG9ydCAqIGFzIGVsYnYyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyJ1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cydcblxuZXhwb3J0IGludGVyZmFjZSBGcm9udGVuZFN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIGVudmlyb25tZW50OiBzdHJpbmdcbiAgbG9hZEJhbGFuY2VyOiBlbGJ2Mi5BcHBsaWNhdGlvbkxvYWRCYWxhbmNlclxufVxuXG5leHBvcnQgY2xhc3MgRnJvbnRlbmRTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSBidWNrZXQ6IHMzLkJ1Y2tldFxuICBwdWJsaWMgcmVhZG9ubHkgZGlzdHJpYnV0aW9uOiBjbG91ZGZyb250LkRpc3RyaWJ1dGlvblxuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBGcm9udGVuZFN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKVxuXG4gICAgY29uc3QgeyBlbnZpcm9ubWVudCwgbG9hZEJhbGFuY2VyIH0gPSBwcm9wc1xuICAgIGNvbnN0IGlzUHJvZCA9IGVudmlyb25tZW50ID09PSAncHJvZHVjdGlvbidcblxuICAgIC8vIFMzIEJ1Y2tldCBmb3Igc3RhdGljIHdlYnNpdGUgaG9zdGluZ1xuICAgIHRoaXMuYnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnRnJvbnRlbmRCdWNrZXQnLCB7XG4gICAgICBidWNrZXROYW1lOiBgcmVhbHdvcmxkLWZyb250ZW5kLSR7ZW52aXJvbm1lbnR9LSR7dGhpcy5hY2NvdW50fWAsXG4gICAgICB3ZWJzaXRlSW5kZXhEb2N1bWVudDogJ2luZGV4Lmh0bWwnLFxuICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6ICdpbmRleC5odG1sJywgLy8gU1BBIHJvdXRpbmdcbiAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IGZhbHNlLCAvLyBXaWxsIGJlIGFjY2Vzc2VkIHZpYSBDbG91ZEZyb250IG9ubHlcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgICByZW1vdmFsUG9saWN5OiBpc1Byb2QgPyBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4gOiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6ICFpc1Byb2QsXG4gICAgICB2ZXJzaW9uZWQ6IGlzUHJvZCxcbiAgICAgIGVuY3J5cHRpb246IHMzLkJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcbiAgICB9KVxuXG4gICAgLy8gT3JpZ2luIEFjY2VzcyBDb250cm9sIGZvciBDbG91ZEZyb250IHRvIGFjY2VzcyBTM1xuICAgIGNvbnN0IG9yaWdpbkFjY2Vzc0NvbnRyb2wgPSBuZXcgY2xvdWRmcm9udC5TM09yaWdpbkFjY2Vzc0NvbnRyb2wodGhpcywgJ09BQycsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBgT0FDIGZvciBSZWFsV29ybGQgZnJvbnRlbmQgJHtlbnZpcm9ubWVudH1gLFxuICAgIH0pXG5cbiAgICAvLyBDYWNoZSBwb2xpY3kgZm9yIHN0YXRpYyBhc3NldHNcbiAgICBjb25zdCBzdGF0aWNBc3NldHNDYWNoZVBvbGljeSA9IG5ldyBjbG91ZGZyb250LkNhY2hlUG9saWN5KHRoaXMsICdTdGF0aWNBc3NldHNDYWNoZVBvbGljeScsIHtcbiAgICAgIGNhY2hlUG9saWN5TmFtZTogYFJlYWxXb3JsZC1TdGF0aWNBc3NldHMtJHtlbnZpcm9ubWVudH1gLFxuICAgICAgY29tbWVudDogJ0NhY2hlIHBvbGljeSBmb3Igc3RhdGljIGFzc2V0cyAoSlMsIENTUywgaW1hZ2VzKScsXG4gICAgICBkZWZhdWx0VHRsOiBjZGsuRHVyYXRpb24uZGF5cygzMCksXG4gICAgICBtYXhUdGw6IGNkay5EdXJhdGlvbi5kYXlzKDM2NSksXG4gICAgICBtaW5UdGw6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDApLFxuICAgICAgaGVhZGVyQmVoYXZpb3I6IGNsb3VkZnJvbnQuQ2FjaGVIZWFkZXJCZWhhdmlvci5ub25lKCksXG4gICAgICBxdWVyeVN0cmluZ0JlaGF2aW9yOiBjbG91ZGZyb250LkNhY2hlUXVlcnlTdHJpbmdCZWhhdmlvci5ub25lKCksXG4gICAgICBjb29raWVCZWhhdmlvcjogY2xvdWRmcm9udC5DYWNoZUNvb2tpZUJlaGF2aW9yLm5vbmUoKSxcbiAgICB9KVxuXG4gICAgLy8gQ2FjaGUgcG9saWN5IGZvciBIVE1MIGZpbGVzIChubyBjYWNoaW5nIGZvciBTUEEpXG4gICAgY29uc3QgaHRtbENhY2hlUG9saWN5ID0gbmV3IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kodGhpcywgJ0h0bWxDYWNoZVBvbGljeScsIHtcbiAgICAgIGNhY2hlUG9saWN5TmFtZTogYFJlYWxXb3JsZC1IdG1sLSR7ZW52aXJvbm1lbnR9YCxcbiAgICAgIGNvbW1lbnQ6ICdDYWNoZSBwb2xpY3kgZm9yIEhUTUwgZmlsZXMnLFxuICAgICAgZGVmYXVsdFR0bDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMCksXG4gICAgICBtYXhUdGw6IGNkay5EdXJhdGlvbi5kYXlzKDEpLFxuICAgICAgbWluVHRsOiBjZGsuRHVyYXRpb24uc2Vjb25kcygwKSxcbiAgICAgIGhlYWRlckJlaGF2aW9yOiBjbG91ZGZyb250LkNhY2hlSGVhZGVyQmVoYXZpb3IuYWxsb3dMaXN0KCdDbG91ZEZyb250LVZpZXdlci1Db3VudHJ5JyksXG4gICAgICBxdWVyeVN0cmluZ0JlaGF2aW9yOiBjbG91ZGZyb250LkNhY2hlUXVlcnlTdHJpbmdCZWhhdmlvci5ub25lKCksXG4gICAgICBjb29raWVCZWhhdmlvcjogY2xvdWRmcm9udC5DYWNoZUNvb2tpZUJlaGF2aW9yLm5vbmUoKSxcbiAgICB9KVxuXG4gICAgLy8gT3JpZ2luIHJlcXVlc3QgcG9saWN5IGZvciBBUEkgcmVxdWVzdHNcbiAgICBjb25zdCBhcGlPcmlnaW5SZXF1ZXN0UG9saWN5ID0gbmV3IGNsb3VkZnJvbnQuT3JpZ2luUmVxdWVzdFBvbGljeSh0aGlzLCAnQXBpT3JpZ2luUmVxdWVzdFBvbGljeScsIHtcbiAgICAgIG9yaWdpblJlcXVlc3RQb2xpY3lOYW1lOiBgUmVhbFdvcmxkLUFwaS0ke2Vudmlyb25tZW50fWAsXG4gICAgICBjb21tZW50OiAnT3JpZ2luIHJlcXVlc3QgcG9saWN5IGZvciBBUEkgcmVxdWVzdHMnLFxuICAgICAgaGVhZGVyQmVoYXZpb3I6IGNsb3VkZnJvbnQuT3JpZ2luUmVxdWVzdEhlYWRlckJlaGF2aW9yLmFsbG93TGlzdChcbiAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgICdBY2NlcHQnLFxuICAgICAgICAnT3JpZ2luJyxcbiAgICAgICAgJ1JlZmVyZXInLFxuICAgICAgICAnVXNlci1BZ2VudCdcbiAgICAgICksXG4gICAgICBxdWVyeVN0cmluZ0JlaGF2aW9yOiBjbG91ZGZyb250Lk9yaWdpblJlcXVlc3RRdWVyeVN0cmluZ0JlaGF2aW9yLmFsbCgpLFxuICAgICAgY29va2llQmVoYXZpb3I6IGNsb3VkZnJvbnQuT3JpZ2luUmVxdWVzdENvb2tpZUJlaGF2aW9yLm5vbmUoKSxcbiAgICB9KVxuXG4gICAgLy8gUmVzcG9uc2UgaGVhZGVycyBwb2xpY3kgZm9yIHNlY3VyaXR5XG4gICAgY29uc3QgcmVzcG9uc2VIZWFkZXJzUG9saWN5ID0gbmV3IGNsb3VkZnJvbnQuUmVzcG9uc2VIZWFkZXJzUG9saWN5KHRoaXMsICdTZWN1cml0eUhlYWRlcnNQb2xpY3knLCB7XG4gICAgICByZXNwb25zZUhlYWRlcnNQb2xpY3lOYW1lOiBgUmVhbFdvcmxkLVNlY3VyaXR5LSR7ZW52aXJvbm1lbnR9YCxcbiAgICAgIGNvbW1lbnQ6ICdTZWN1cml0eSBoZWFkZXJzIHBvbGljeScsXG4gICAgICBzZWN1cml0eUhlYWRlcnNCZWhhdmlvcjoge1xuICAgICAgICBjb250ZW50VHlwZU9wdGlvbnM6IHsgb3ZlcnJpZGU6IHRydWUgfSxcbiAgICAgICAgZnJhbWVPcHRpb25zOiB7IGZyYW1lT3B0aW9uOiBjbG91ZGZyb250LkhlYWRlcnNGcmFtZU9wdGlvbi5ERU5ZLCBvdmVycmlkZTogdHJ1ZSB9LFxuICAgICAgICByZWZlcnJlclBvbGljeTogeyBcbiAgICAgICAgICByZWZlcnJlclBvbGljeTogY2xvdWRmcm9udC5IZWFkZXJzUmVmZXJyZXJQb2xpY3kuU1RSSUNUX09SSUdJTl9XSEVOX0NST1NTX09SSUdJTiwgXG4gICAgICAgICAgb3ZlcnJpZGU6IHRydWUgXG4gICAgICAgIH0sXG4gICAgICAgIHN0cmljdFRyYW5zcG9ydFNlY3VyaXR5OiB7XG4gICAgICAgICAgYWNjZXNzQ29udHJvbE1heEFnZTogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzE1MzYwMDApLFxuICAgICAgICAgIGluY2x1ZGVTdWJkb21haW5zOiB0cnVlLFxuICAgICAgICAgIHByZWxvYWQ6IHRydWUsXG4gICAgICAgICAgb3ZlcnJpZGU6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnRTZWN1cml0eVBvbGljeToge1xuICAgICAgICAgIGNvbnRlbnRTZWN1cml0eVBvbGljeTogW1xuICAgICAgICAgICAgXCJkZWZhdWx0LXNyYyAnc2VsZidcIixcbiAgICAgICAgICAgIFwic2NyaXB0LXNyYyAnc2VsZicgJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIixcbiAgICAgICAgICAgIFwic3R5bGUtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZSdcIixcbiAgICAgICAgICAgIFwiaW1nLXNyYyAnc2VsZicgZGF0YTogaHR0cHM6XCIsXG4gICAgICAgICAgICBcImZvbnQtc3JjICdzZWxmJyBkYXRhOlwiLFxuICAgICAgICAgICAgXCJjb25uZWN0LXNyYyAnc2VsZicgaHR0cHM6XCIsXG4gICAgICAgICAgICBcImZyYW1lLWFuY2VzdG9ycyAnbm9uZSdcIixcbiAgICAgICAgICBdLmpvaW4oJzsgJyksXG4gICAgICAgICAgb3ZlcnJpZGU6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgY3VzdG9tSGVhZGVyc0JlaGF2aW9yOiB7XG4gICAgICAgIGN1c3RvbUhlYWRlcnM6IFtcbiAgICAgICAgICB7IGhlYWRlcjogJ1gtQXBwbGljYXRpb24nLCB2YWx1ZTogJ1JlYWxXb3JsZCcsIG92ZXJyaWRlOiB0cnVlIH0sXG4gICAgICAgICAgeyBoZWFkZXI6ICdYLUVudmlyb25tZW50JywgdmFsdWU6IGVudmlyb25tZW50LCBvdmVycmlkZTogdHJ1ZSB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9KVxuXG4gICAgLy8gQ2xvdWRGcm9udCBEaXN0cmlidXRpb25cbiAgICB0aGlzLmRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCAnRGlzdHJpYnV0aW9uJywge1xuICAgICAgY29tbWVudDogYFJlYWxXb3JsZCBmcm9udGVuZCBkaXN0cmlidXRpb24gKCR7ZW52aXJvbm1lbnR9KWAsXG4gICAgICBkZWZhdWx0Um9vdE9iamVjdDogJ2luZGV4Lmh0bWwnLFxuICAgICAgXG4gICAgICAvLyBPcmlnaW5zXG4gICAgICBhZGRpdGlvbmFsQmVoYXZpb3JzOiB7XG4gICAgICAgIC8vIEFQSSByZXF1ZXN0cyBnbyB0byBBTEJcbiAgICAgICAgJy9hcGkvKic6IHtcbiAgICAgICAgICBvcmlnaW46IG5ldyBvcmlnaW5zLkxvYWRCYWxhbmNlclYyT3JpZ2luKGxvYWRCYWxhbmNlciwge1xuICAgICAgICAgICAgcHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuT3JpZ2luUHJvdG9jb2xQb2xpY3kuSFRUUF9PTkxZLFxuICAgICAgICAgICAgaHR0cFBvcnQ6IDgwLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICAgIGNhY2hlUG9saWN5OiBjbG91ZGZyb250LkNhY2hlUG9saWN5LkNBQ0hJTkdfRElTQUJMRUQsXG4gICAgICAgICAgb3JpZ2luUmVxdWVzdFBvbGljeTogYXBpT3JpZ2luUmVxdWVzdFBvbGljeSxcbiAgICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19BTEwsXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICAvLyBIZWFsdGggY2hlY2sgZW5kcG9pbnRcbiAgICAgICAgJy9oZWFsdGgnOiB7XG4gICAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5Mb2FkQmFsYW5jZXJWMk9yaWdpbihsb2FkQmFsYW5jZXIsIHtcbiAgICAgICAgICAgIHByb3RvY29sUG9saWN5OiBjbG91ZGZyb250Lk9yaWdpblByb3RvY29sUG9saWN5LkhUVFBfT05MWSxcbiAgICAgICAgICAgIGh0dHBQb3J0OiA4MCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgICBjYWNoZVBvbGljeTogY2xvdWRmcm9udC5DYWNoZVBvbGljeS5DQUNISU5HX0RJU0FCTEVELFxuICAgICAgICAgIGFsbG93ZWRNZXRob2RzOiBjbG91ZGZyb250LkFsbG93ZWRNZXRob2RzLkFMTE9XX0dFVF9IRUFELFxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFN0YXRpYyBhc3NldHMgd2l0aCBsb25nLXRlcm0gY2FjaGluZ1xuICAgICAgICAnKi5qcyc6IHtcbiAgICAgICAgICBvcmlnaW46IG5ldyBvcmlnaW5zLlMzT3JpZ2luKHRoaXMuYnVja2V0LCB7XG4gICAgICAgICAgICBvcmlnaW5BY2Nlc3NDb250cm9sSWQ6IG9yaWdpbkFjY2Vzc0NvbnRyb2wub3JpZ2luQWNjZXNzQ29udHJvbElkLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICAgIGNhY2hlUG9saWN5OiBzdGF0aWNBc3NldHNDYWNoZVBvbGljeSxcbiAgICAgICAgICByZXNwb25zZUhlYWRlcnNQb2xpY3ksXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICAnKi5jc3MnOiB7XG4gICAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5TM09yaWdpbih0aGlzLmJ1Y2tldCwge1xuICAgICAgICAgICAgb3JpZ2luQWNjZXNzQ29udHJvbElkOiBvcmlnaW5BY2Nlc3NDb250cm9sLm9yaWdpbkFjY2Vzc0NvbnRyb2xJZCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgICBjYWNoZVBvbGljeTogc3RhdGljQXNzZXRzQ2FjaGVQb2xpY3ksXG4gICAgICAgICAgcmVzcG9uc2VIZWFkZXJzUG9saWN5LFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgJyoucG5nJzoge1xuICAgICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4odGhpcy5idWNrZXQsIHtcbiAgICAgICAgICAgIG9yaWdpbkFjY2Vzc0NvbnRyb2xJZDogb3JpZ2luQWNjZXNzQ29udHJvbC5vcmlnaW5BY2Nlc3NDb250cm9sSWQsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgICAgICAgY2FjaGVQb2xpY3k6IHN0YXRpY0Fzc2V0c0NhY2hlUG9saWN5LFxuICAgICAgICAgIHJlc3BvbnNlSGVhZGVyc1BvbGljeSxcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgICcqLmpwZyc6IHtcbiAgICAgICAgICBvcmlnaW46IG5ldyBvcmlnaW5zLlMzT3JpZ2luKHRoaXMuYnVja2V0LCB7XG4gICAgICAgICAgICBvcmlnaW5BY2Nlc3NDb250cm9sSWQ6IG9yaWdpbkFjY2Vzc0NvbnRyb2wub3JpZ2luQWNjZXNzQ29udHJvbElkLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICAgIGNhY2hlUG9saWN5OiBzdGF0aWNBc3NldHNDYWNoZVBvbGljeSxcbiAgICAgICAgICByZXNwb25zZUhlYWRlcnNQb2xpY3ksXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICAnKi5zdmcnOiB7XG4gICAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5TM09yaWdpbih0aGlzLmJ1Y2tldCwge1xuICAgICAgICAgICAgb3JpZ2luQWNjZXNzQ29udHJvbElkOiBvcmlnaW5BY2Nlc3NDb250cm9sLm9yaWdpbkFjY2Vzc0NvbnRyb2xJZCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgICBjYWNoZVBvbGljeTogc3RhdGljQXNzZXRzQ2FjaGVQb2xpY3ksXG4gICAgICAgICAgcmVzcG9uc2VIZWFkZXJzUG9saWN5LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIFxuICAgICAgLy8gRGVmYXVsdCBiZWhhdmlvciBmb3IgSFRNTCBhbmQgU1BBIHJvdXRpbmdcbiAgICAgIGRlZmF1bHRCZWhhdmlvcjoge1xuICAgICAgICBvcmlnaW46IG5ldyBvcmlnaW5zLlMzT3JpZ2luKHRoaXMuYnVja2V0LCB7XG4gICAgICAgICAgb3JpZ2luQWNjZXNzQ29udHJvbElkOiBvcmlnaW5BY2Nlc3NDb250cm9sLm9yaWdpbkFjY2Vzc0NvbnRyb2xJZCxcbiAgICAgICAgfSksXG4gICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICBjYWNoZVBvbGljeTogaHRtbENhY2hlUG9saWN5LFxuICAgICAgICByZXNwb25zZUhlYWRlcnNQb2xpY3ksXG4gICAgICAgIGZ1bmN0aW9uQXNzb2NpYXRpb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZXZlbnRUeXBlOiBjbG91ZGZyb250LkZ1bmN0aW9uRXZlbnRUeXBlLlZJRVdFUl9SRVFVRVNULFxuICAgICAgICAgICAgZnVuY3Rpb246IG5ldyBjbG91ZGZyb250LkZ1bmN0aW9uKHRoaXMsICdTcGFSb3V0aW5nRnVuY3Rpb24nLCB7XG4gICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogYHJlYWx3b3JsZC1zcGEtcm91dGluZy0ke2Vudmlyb25tZW50fWAsXG4gICAgICAgICAgICAgIGNvZGU6IGNsb3VkZnJvbnQuRnVuY3Rpb25Db2RlLmZyb21JbmxpbmUoYFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gZXZlbnQucmVxdWVzdDtcbiAgICAgICAgICAgICAgICAgIHZhciB1cmkgPSByZXF1ZXN0LnVyaTtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIFVSSSBoYXMgYSBmaWxlIGV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgaWYgKCF1cmkuaW5jbHVkZXMoJy4nKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBObyBmaWxlIGV4dGVuc2lvbiwgc2VydmUgaW5kZXguaHRtbCBmb3IgU1BBIHJvdXRpbmdcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC51cmkgPSAnL2luZGV4Lmh0bWwnO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGApLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBcbiAgICAgIC8vIEVycm9yIHJlc3BvbnNlcyBmb3IgU1BBXG4gICAgICBlcnJvclJlc3BvbnNlczogW1xuICAgICAgICB7XG4gICAgICAgICAgaHR0cFN0YXR1czogNDA0LFxuICAgICAgICAgIHJlc3BvbnNlSHR0cFN0YXR1czogMjAwLFxuICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG4gICAgICAgICAgdHRsOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGh0dHBTdGF0dXM6IDQwMyxcbiAgICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDIwMCxcbiAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgIHR0bDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgXG4gICAgICAvLyBHZW9ncmFwaGljIHJlc3RyaWN0aW9ucyAtIG5vbmUgZm9yIGRldmVsb3BtZW50XG4gICAgICBnZW9SZXN0cmljdGlvbjogaXNQcm9kIFxuICAgICAgICA/IGNsb3VkZnJvbnQuR2VvUmVzdHJpY3Rpb24uYWxsb3dsaXN0KCdVUycsICdDQScsICdHQicsICdERScsICdGUicsICdKUCcsICdLUicpXG4gICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgXG4gICAgICAvLyBQcmljZSBjbGFzc1xuICAgICAgcHJpY2VDbGFzczogaXNQcm9kIFxuICAgICAgICA/IGNsb3VkZnJvbnQuUHJpY2VDbGFzcy5QUklDRV9DTEFTU19BTExcbiAgICAgICAgOiBjbG91ZGZyb250LlByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfMTAwLFxuICAgICAgXG4gICAgICAvLyBMb2dnaW5nXG4gICAgICBlbmFibGVMb2dnaW5nOiBpc1Byb2QsXG4gICAgICBsb2dCdWNrZXQ6IGlzUHJvZCA/IG5ldyBzMy5CdWNrZXQodGhpcywgJ0xvZ3NCdWNrZXQnLCB7XG4gICAgICAgIGJ1Y2tldE5hbWU6IGByZWFsd29ybGQtY2xvdWRmcm9udC1sb2dzLSR7ZW52aXJvbm1lbnR9LSR7dGhpcy5hY2NvdW50fWAsXG4gICAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLFxuICAgICAgfSkgOiB1bmRlZmluZWQsXG4gICAgICBsb2dGaWxlUHJlZml4OiBpc1Byb2QgPyBgY2xvdWRmcm9udC1sb2dzLyR7ZW52aXJvbm1lbnR9L2AgOiB1bmRlZmluZWQsXG4gICAgfSlcblxuICAgIC8vIEdyYW50IENsb3VkRnJvbnQgYWNjZXNzIHRvIFMzIGJ1Y2tldFxuICAgIHRoaXMuYnVja2V0LmFkZFRvUmVzb3VyY2VQb2xpY3koXG4gICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIGFjdGlvbnM6IFsnczM6R2V0T2JqZWN0J10sXG4gICAgICAgIHByaW5jaXBhbHM6IFtuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2Nsb3VkZnJvbnQuYW1hem9uYXdzLmNvbScpXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbdGhpcy5idWNrZXQuYXJuRm9yT2JqZWN0cygnKicpXSxcbiAgICAgICAgY29uZGl0aW9uczoge1xuICAgICAgICAgIFN0cmluZ0VxdWFsczoge1xuICAgICAgICAgICAgJ0FXUzpTb3VyY2VBcm4nOiBgYXJuOmF3czpjbG91ZGZyb250Ojoke3RoaXMuYWNjb3VudH06ZGlzdHJpYnV0aW9uLyR7dGhpcy5kaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uSWR9YCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICApXG5cbiAgICAvLyBEZXBsb3kgZnJvbnRlbmQgYXNzZXRzIChwbGFjZWhvbGRlciAtIHdpbGwgYmUgdXBkYXRlZCBieSBDSS9DRClcbiAgICBuZXcgczNkZXBsb3kuQnVja2V0RGVwbG95bWVudCh0aGlzLCAnRnJvbnRlbmREZXBsb3ltZW50Jywge1xuICAgICAgc291cmNlczogW1xuICAgICAgICBzM2RlcGxveS5Tb3VyY2UuZGF0YSgnaW5kZXguaHRtbCcsIGBcbiAgICAgICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgICA8aHRtbD5cbiAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICA8dGl0bGU+UmVhbFdvcmxkIC0gJHtlbnZpcm9ubWVudH08L3RpdGxlPlxuICAgICAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIj5cbiAgICAgICAgICAgICAgPG1ldGEgbmFtZT1cInZpZXdwb3J0XCIgY29udGVudD1cIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xXCI+XG4gICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICA8Ym9keT5cbiAgICAgICAgICAgICAgPGRpdiBpZD1cInJvb3RcIj5cbiAgICAgICAgICAgICAgICA8aDE+UmVhbFdvcmxkIEFwcGxpY2F0aW9uPC9oMT5cbiAgICAgICAgICAgICAgICA8cD5FbnZpcm9ubWVudDogJHtlbnZpcm9ubWVudH08L3A+XG4gICAgICAgICAgICAgICAgPHA+VGhpcyBpcyBhIHBsYWNlaG9sZGVyIHBhZ2UuIERlcGxveSB5b3VyIFJlYWN0IGJ1aWxkIGhlcmUuPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICA8L2h0bWw+XG4gICAgICAgIGApLFxuICAgICAgXSxcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB0aGlzLmJ1Y2tldCxcbiAgICAgIGRpc3RyaWJ1dGlvbjogdGhpcy5kaXN0cmlidXRpb24sXG4gICAgICBkaXN0cmlidXRpb25QYXRoczogWycvKiddLFxuICAgIH0pXG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0J1Y2tldE5hbWUnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5idWNrZXQuYnVja2V0TmFtZSxcbiAgICAgIGV4cG9ydE5hbWU6IGAke2Vudmlyb25tZW50fS1Gcm9udGVuZEJ1Y2tldE5hbWVgLFxuICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIHRoZSBTMyBidWNrZXQgZm9yIGZyb250ZW5kIGFzc2V0cycsXG4gICAgfSlcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEaXN0cmlidXRpb25JZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmRpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25JZCxcbiAgICAgIGV4cG9ydE5hbWU6IGAke2Vudmlyb25tZW50fS1EaXN0cmlidXRpb25JZGAsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Nsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIElEJyxcbiAgICB9KVxuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Rpc3RyaWJ1dGlvbkRvbWFpbk5hbWUnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5kaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZSxcbiAgICAgIGV4cG9ydE5hbWU6IGAke2Vudmlyb25tZW50fS1EaXN0cmlidXRpb25Eb21haW5OYW1lYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ2xvdWRGcm9udCBkaXN0cmlidXRpb24gZG9tYWluIG5hbWUnLFxuICAgIH0pXG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnV2Vic2l0ZVVybCcsIHtcbiAgICAgIHZhbHVlOiBgaHR0cHM6Ly8ke3RoaXMuZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWV9YCxcbiAgICAgIGV4cG9ydE5hbWU6IGAke2Vudmlyb25tZW50fS1XZWJzaXRlVXJsYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2Vic2l0ZSBVUkwnLFxuICAgIH0pXG4gIH1cbn0iXX0=