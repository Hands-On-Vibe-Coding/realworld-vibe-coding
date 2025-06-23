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
exports.DatabaseStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const rds = __importStar(require("aws-cdk-lib/aws-rds"));
const secretsmanager = __importStar(require("aws-cdk-lib/aws-secretsmanager"));
class DatabaseStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { environment, vpc } = props;
        const isProd = environment === 'production';
        // Import RDS security group from Network stack
        const rdsSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'RDSSecurityGroup', cdk.Fn.importValue(`${environment}-RDSSecurityGroupId`));
        // Create database subnet group
        const subnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
            vpc,
            description: `Subnet group for RealWorld RDS instance (${environment})`,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
        });
        // Database credentials stored in AWS Secrets Manager
        this.databaseSecret = new secretsmanager.Secret(this, 'DatabaseSecret', {
            secretName: `${environment}/realworld/database`,
            description: `Database credentials for RealWorld application (${environment})`,
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: 'postgres' }),
                generateStringKey: 'password',
                excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
                includeSpace: false,
                passwordLength: 32,
            },
        });
        // Parameter group for PostgreSQL optimization
        const parameterGroup = new rds.ParameterGroup(this, 'DatabaseParameterGroup', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_15_7,
            }),
            description: `Parameter group for RealWorld PostgreSQL (${environment})`,
            parameters: {
                // Connection and memory settings
                shared_preload_libraries: 'pg_stat_statements',
                log_statement: 'all',
                log_min_duration_statement: '1000', // Log queries taking longer than 1 second
                // Performance tuning (adjust based on instance type)
                ...(isProd && {
                    effective_cache_size: '3GB',
                    shared_buffers: '1GB',
                    work_mem: '4MB',
                    maintenance_work_mem: '256MB',
                }),
            },
        });
        // Option group for additional features
        const optionGroup = new rds.OptionGroup(this, 'DatabaseOptionGroup', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_15_7,
            }),
            description: `Option group for RealWorld PostgreSQL (${environment})`,
            configurations: [], // Empty configurations for PostgreSQL
        });
        // RDS instance configuration
        this.database = new rds.DatabaseInstance(this, 'Database', {
            databaseName: 'realworld',
            instanceIdentifier: `realworld-${environment}`,
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_15_7,
            }),
            // Instance size based on environment
            instanceType: isProd
                ? ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL)
                : ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            // Storage configuration
            allocatedStorage: isProd ? 100 : 20,
            maxAllocatedStorage: isProd ? 1000 : 100,
            storageType: rds.StorageType.GP3,
            storageEncrypted: true,
            // Network configuration
            vpc,
            subnetGroup,
            securityGroups: [rdsSecurityGroup],
            // Authentication
            credentials: rds.Credentials.fromSecret(this.databaseSecret),
            // Backup and maintenance
            backupRetention: isProd ? cdk.Duration.days(30) : cdk.Duration.days(7),
            deleteAutomatedBackups: !isProd,
            deletionProtection: isProd,
            // Multi-AZ for production
            multiAz: isProd,
            // Maintenance window
            preferredMaintenanceWindow: isProd ? 'sun:03:00-sun:04:00' : undefined,
            preferredBackupWindow: isProd ? '04:00-05:00' : undefined,
            // Parameter and option groups
            parameterGroup,
            optionGroup,
            // Monitoring
            enablePerformanceInsights: isProd,
            performanceInsightRetention: isProd
                ? rds.PerformanceInsightRetention.MONTHS_1
                : undefined,
            monitoringInterval: isProd ? cdk.Duration.seconds(60) : undefined,
            // Removal policy
            removalPolicy: isProd ? cdk.RemovalPolicy.SNAPSHOT : cdk.RemovalPolicy.DESTROY,
        });
        // CloudWatch log groups for database logs
        if (isProd) {
            new cdk.aws_logs.LogGroup(this, 'DatabaseLogGroup', {
                logGroupName: `/aws/rds/instance/${this.database.instanceIdentifier}/postgresql`,
                retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
            });
        }
        // Database connection string for applications
        const connectionString = `postgresql://${this.databaseSecret.secretValueFromJson('username')}:${this.databaseSecret.secretValueFromJson('password')}@${this.database.instanceEndpoint.hostname}:${this.database.instanceEndpoint.port}/${this.database.instanceIdentifier}`;
        // Outputs
        new cdk.CfnOutput(this, 'DatabaseEndpoint', {
            value: this.database.instanceEndpoint.hostname,
            exportName: `${environment}-DatabaseEndpoint`,
            description: 'RDS PostgreSQL endpoint',
        });
        new cdk.CfnOutput(this, 'DatabasePort', {
            value: this.database.instanceEndpoint.port.toString(),
            exportName: `${environment}-DatabasePort`,
            description: 'RDS PostgreSQL port',
        });
        new cdk.CfnOutput(this, 'DatabaseName', {
            value: this.database.instanceIdentifier,
            exportName: `${environment}-DatabaseName`,
            description: 'RDS PostgreSQL database name',
        });
        new cdk.CfnOutput(this, 'DatabaseSecretArn', {
            value: this.databaseSecret.secretArn,
            exportName: `${environment}-DatabaseSecretArn`,
            description: 'ARN of the database credentials secret',
        });
        new cdk.CfnOutput(this, 'DatabaseInstanceId', {
            value: this.database.instanceIdentifier,
            exportName: `${environment}-DatabaseInstanceId`,
            description: 'RDS instance identifier',
        });
    }
}
exports.DatabaseStack = DatabaseStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2Utc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYXRhYmFzZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBa0M7QUFDbEMseURBQTBDO0FBQzFDLHlEQUEwQztBQUMxQywrRUFBZ0U7QUFRaEUsTUFBYSxhQUFjLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJMUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF5QjtRQUNqRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUV2QixNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQTtRQUNsQyxNQUFNLE1BQU0sR0FBRyxXQUFXLEtBQUssWUFBWSxDQUFBO1FBRTNDLCtDQUErQztRQUMvQyxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQzVELElBQUksRUFDSixrQkFBa0IsRUFDbEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxXQUFXLHFCQUFxQixDQUFDLENBQ3hELENBQUE7UUFFRCwrQkFBK0I7UUFDL0IsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNuRSxHQUFHO1lBQ0gsV0FBVyxFQUFFLDRDQUE0QyxXQUFXLEdBQUc7WUFDdkUsVUFBVSxFQUFFO2dCQUNWLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLGdCQUFnQjthQUM1QztTQUNGLENBQUMsQ0FBQTtRQUVGLHFEQUFxRDtRQUNyRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDdEUsVUFBVSxFQUFFLEdBQUcsV0FBVyxxQkFBcUI7WUFDL0MsV0FB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ZTtZQUN6QyxXQUFXLEVBQUUsOEJBQThCO1NBQzVDLENBQUMsQ0FBQTtRQUVGLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDM0MsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUztZQUNwQyxVQUFVLEVBQUUsR0FBRyxXQUFXLG9CQUFvQjtZQUM5QyxXQUFXLEVBQUUsd0NBQXdDO1NBQ3RELENBQUMsQ0FBQTtRQUVGLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDNUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQW1CO1lBQ3hDLFVBQVUsRUFBRSxHQUFHLFdBQVcscUJBQXFCO1lBQy9DLFdBQVcsRUFBRSx5QkFBeUI7U0FDdkMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGO0FBdktELHNDQXVLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJ1xuaW1wb3J0ICogYXMgcmRzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yZHMnXG5pbXBvcnQgKiBhcyBzZWNyZXRzbWFuYWdlciBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc2VjcmV0c21hbmFnZXInXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIERhdGFiYXNlU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgZW52aXJvbm1lbnQ6IHN0cmluZ1xuICB2cGM6IGVjMi5WcGNcbn1cblxuZXhwb3J0IGNsYXNzIERhdGFiYXNlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwdWJsaWMgcmVhZG9ubHkgZGF0YWJhc2U6IHJkcy5EYXRhYmFzZUluc3RhbmNlXG4gIHB1YmxpYyByZWFkb25seSBkYXRhYmFzZVNlY3JldDogc2VjcmV0c21hbmFnZXIuU2VjcmV0XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IERhdGFiYXNlU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpXG5cbiAgICBjb25zdCB7IGVudmlyb25tZW50LCB2cGMgfSA9IHByb3BzXG4gICAgY29uc3QgaXNQcm9kID0gZW52aXJvbm1lbnQgPT09ICdwcm9kdWN0aW9uJ1xuXG4gICAgLy8gSW1wb3J0IFJEUyBzZWN1cml0eSBncm91cCBmcm9tIE5ldHdvcmsgc3RhY2tcbiAgICBjb25zdCByZHNTZWN1cml0eUdyb3VwID0gZWMyLlNlY3VyaXR5R3JvdXAuZnJvbVNlY3VyaXR5R3JvdXBJZChcbiAgICAgIHRoaXMsXG4gICAgICAnUkRTU2VjdXJpdHlHcm91cCcsXG4gICAgICBjZGsuRm4uaW1wb3J0VmFsdWUoYCR7ZW52aXJvbm1lbnR9LVJEU1NlY3VyaXR5R3JvdXBJZGApXG4gICAgKVxuXG4gICAgLy8gQ3JlYXRlIGRhdGFiYXNlIHN1Ym5ldCBncm91cFxuICAgIGNvbnN0IHN1Ym5ldEdyb3VwID0gbmV3IHJkcy5TdWJuZXRHcm91cCh0aGlzLCAnRGF0YWJhc2VTdWJuZXRHcm91cCcsIHtcbiAgICAgIHZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiBgU3VibmV0IGdyb3VwIGZvciBSZWFsV29ybGQgUkRTIGluc3RhbmNlICgke2Vudmlyb25tZW50fSlgLFxuICAgICAgdnBjU3VibmV0czoge1xuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX0lTT0xBVEVELFxuICAgICAgfSxcbiAgICB9KVxuXG4gICAgLy8gRGF0YWJhc2UgY3JlZGVudGlhbHMgc3RvcmVkIGluIEFXUyBTZWNyZXRzIE1hbmFnZXJcbiAgICB0aGlzLmRhdGFiYXNlU2VjcmV0ID0gbmV3IHNlY3JldHNtYW5hZ2VyLlNlY3JldCh0aGlzLCAnRGF0YWJhc2VTZWNyZXQnLCB7XG4gICAgICBzZWNyZXROYW1lOiBgJHtlbnZpcm9ubWVudH0vcmVhbHdvcmxkL2RhdGFiYXNlYCxcbiAgICAgIGRlc2NyaXB0aW9uOiBgRGF0YWJhc2UgY3JlZGVudGlhbHMgZm9yIFJlYWxXb3JsZCBhcHBsaWNhdGlvbiAoJHtlbnZpcm9ubWVudH0pYCxcbiAgICAgIGdlbmVyYXRlU2VjcmV0U3RyaW5nOiB7XG4gICAgICAgIHNlY3JldFN0cmluZ1RlbXBsYXRlOiBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lOiAncG9zdGdyZXMnIH0pLFxuICAgICAgICBnZW5lcmF0ZVN0cmluZ0tleTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgZXhjbHVkZUNoYXJhY3RlcnM6ICcgJSt+YCMkJiooKXxbXXt9Ojs8Pj8hXFwnL0BcIlxcXFwnLFxuICAgICAgICBpbmNsdWRlU3BhY2U6IGZhbHNlLFxuICAgICAgICBwYXNzd29yZExlbmd0aDogMzIsXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICAvLyBQYXJhbWV0ZXIgZ3JvdXAgZm9yIFBvc3RncmVTUUwgb3B0aW1pemF0aW9uXG4gICAgY29uc3QgcGFyYW1ldGVyR3JvdXAgPSBuZXcgcmRzLlBhcmFtZXRlckdyb3VwKHRoaXMsICdEYXRhYmFzZVBhcmFtZXRlckdyb3VwJywge1xuICAgICAgZW5naW5lOiByZHMuRGF0YWJhc2VJbnN0YW5jZUVuZ2luZS5wb3N0Z3Jlcyh7XG4gICAgICAgIHZlcnNpb246IHJkcy5Qb3N0Z3Jlc0VuZ2luZVZlcnNpb24uVkVSXzE1XzcsXG4gICAgICB9KSxcbiAgICAgIGRlc2NyaXB0aW9uOiBgUGFyYW1ldGVyIGdyb3VwIGZvciBSZWFsV29ybGQgUG9zdGdyZVNRTCAoJHtlbnZpcm9ubWVudH0pYCxcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgLy8gQ29ubmVjdGlvbiBhbmQgbWVtb3J5IHNldHRpbmdzXG4gICAgICAgIHNoYXJlZF9wcmVsb2FkX2xpYnJhcmllczogJ3BnX3N0YXRfc3RhdGVtZW50cycsXG4gICAgICAgIGxvZ19zdGF0ZW1lbnQ6ICdhbGwnLFxuICAgICAgICBsb2dfbWluX2R1cmF0aW9uX3N0YXRlbWVudDogJzEwMDAnLCAvLyBMb2cgcXVlcmllcyB0YWtpbmcgbG9uZ2VyIHRoYW4gMSBzZWNvbmRcbiAgICAgICAgXG4gICAgICAgIC8vIFBlcmZvcm1hbmNlIHR1bmluZyAoYWRqdXN0IGJhc2VkIG9uIGluc3RhbmNlIHR5cGUpXG4gICAgICAgIC4uLihpc1Byb2QgJiYge1xuICAgICAgICAgIGVmZmVjdGl2ZV9jYWNoZV9zaXplOiAnM0dCJyxcbiAgICAgICAgICBzaGFyZWRfYnVmZmVyczogJzFHQicsXG4gICAgICAgICAgd29ya19tZW06ICc0TUInLFxuICAgICAgICAgIG1haW50ZW5hbmNlX3dvcmtfbWVtOiAnMjU2TUInLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIC8vIE9wdGlvbiBncm91cCBmb3IgYWRkaXRpb25hbCBmZWF0dXJlc1xuICAgIGNvbnN0IG9wdGlvbkdyb3VwID0gbmV3IHJkcy5PcHRpb25Hcm91cCh0aGlzLCAnRGF0YWJhc2VPcHRpb25Hcm91cCcsIHtcbiAgICAgIGVuZ2luZTogcmRzLkRhdGFiYXNlSW5zdGFuY2VFbmdpbmUucG9zdGdyZXMoe1xuICAgICAgICB2ZXJzaW9uOiByZHMuUG9zdGdyZXNFbmdpbmVWZXJzaW9uLlZFUl8xNV83LFxuICAgICAgfSksXG4gICAgICBkZXNjcmlwdGlvbjogYE9wdGlvbiBncm91cCBmb3IgUmVhbFdvcmxkIFBvc3RncmVTUUwgKCR7ZW52aXJvbm1lbnR9KWAsXG4gICAgICBjb25maWd1cmF0aW9uczogW10sIC8vIEVtcHR5IGNvbmZpZ3VyYXRpb25zIGZvciBQb3N0Z3JlU1FMXG4gICAgfSlcblxuICAgIC8vIFJEUyBpbnN0YW5jZSBjb25maWd1cmF0aW9uXG4gICAgdGhpcy5kYXRhYmFzZSA9IG5ldyByZHMuRGF0YWJhc2VJbnN0YW5jZSh0aGlzLCAnRGF0YWJhc2UnLCB7XG4gICAgICBkYXRhYmFzZU5hbWU6ICdyZWFsd29ybGQnLFxuICAgICAgaW5zdGFuY2VJZGVudGlmaWVyOiBgcmVhbHdvcmxkLSR7ZW52aXJvbm1lbnR9YCxcbiAgICAgIGVuZ2luZTogcmRzLkRhdGFiYXNlSW5zdGFuY2VFbmdpbmUucG9zdGdyZXMoe1xuICAgICAgICB2ZXJzaW9uOiByZHMuUG9zdGdyZXNFbmdpbmVWZXJzaW9uLlZFUl8xNV83LFxuICAgICAgfSksXG4gICAgICBcbiAgICAgIC8vIEluc3RhbmNlIHNpemUgYmFzZWQgb24gZW52aXJvbm1lbnRcbiAgICAgIGluc3RhbmNlVHlwZTogaXNQcm9kIFxuICAgICAgICA/IGVjMi5JbnN0YW5jZVR5cGUub2YoZWMyLkluc3RhbmNlQ2xhc3MuVDMsIGVjMi5JbnN0YW5jZVNpemUuU01BTEwpXG4gICAgICAgIDogZWMyLkluc3RhbmNlVHlwZS5vZihlYzIuSW5zdGFuY2VDbGFzcy5UMywgZWMyLkluc3RhbmNlU2l6ZS5NSUNSTyksXG4gICAgICBcbiAgICAgIC8vIFN0b3JhZ2UgY29uZmlndXJhdGlvblxuICAgICAgYWxsb2NhdGVkU3RvcmFnZTogaXNQcm9kID8gMTAwIDogMjAsXG4gICAgICBtYXhBbGxvY2F0ZWRTdG9yYWdlOiBpc1Byb2QgPyAxMDAwIDogMTAwLFxuICAgICAgc3RvcmFnZVR5cGU6IHJkcy5TdG9yYWdlVHlwZS5HUDMsXG4gICAgICBzdG9yYWdlRW5jcnlwdGVkOiB0cnVlLFxuICAgICAgXG4gICAgICAvLyBOZXR3b3JrIGNvbmZpZ3VyYXRpb25cbiAgICAgIHZwYyxcbiAgICAgIHN1Ym5ldEdyb3VwLFxuICAgICAgc2VjdXJpdHlHcm91cHM6IFtyZHNTZWN1cml0eUdyb3VwXSxcbiAgICAgIFxuICAgICAgLy8gQXV0aGVudGljYXRpb25cbiAgICAgIGNyZWRlbnRpYWxzOiByZHMuQ3JlZGVudGlhbHMuZnJvbVNlY3JldCh0aGlzLmRhdGFiYXNlU2VjcmV0KSxcbiAgICAgIFxuICAgICAgLy8gQmFja3VwIGFuZCBtYWludGVuYW5jZVxuICAgICAgYmFja3VwUmV0ZW50aW9uOiBpc1Byb2QgPyBjZGsuRHVyYXRpb24uZGF5cygzMCkgOiBjZGsuRHVyYXRpb24uZGF5cyg3KSxcbiAgICAgIGRlbGV0ZUF1dG9tYXRlZEJhY2t1cHM6ICFpc1Byb2QsXG4gICAgICBkZWxldGlvblByb3RlY3Rpb246IGlzUHJvZCxcbiAgICAgIFxuICAgICAgLy8gTXVsdGktQVogZm9yIHByb2R1Y3Rpb25cbiAgICAgIG11bHRpQXo6IGlzUHJvZCxcbiAgICAgIFxuICAgICAgLy8gTWFpbnRlbmFuY2Ugd2luZG93XG4gICAgICBwcmVmZXJyZWRNYWludGVuYW5jZVdpbmRvdzogaXNQcm9kID8gJ3N1bjowMzowMC1zdW46MDQ6MDAnIDogdW5kZWZpbmVkLFxuICAgICAgcHJlZmVycmVkQmFja3VwV2luZG93OiBpc1Byb2QgPyAnMDQ6MDAtMDU6MDAnIDogdW5kZWZpbmVkLFxuICAgICAgXG4gICAgICAvLyBQYXJhbWV0ZXIgYW5kIG9wdGlvbiBncm91cHNcbiAgICAgIHBhcmFtZXRlckdyb3VwLFxuICAgICAgb3B0aW9uR3JvdXAsXG4gICAgICBcbiAgICAgIC8vIE1vbml0b3JpbmdcbiAgICAgIGVuYWJsZVBlcmZvcm1hbmNlSW5zaWdodHM6IGlzUHJvZCxcbiAgICAgIHBlcmZvcm1hbmNlSW5zaWdodFJldGVudGlvbjogaXNQcm9kIFxuICAgICAgICA/IHJkcy5QZXJmb3JtYW5jZUluc2lnaHRSZXRlbnRpb24uTU9OVEhTXzEgXG4gICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgbW9uaXRvcmluZ0ludGVydmFsOiBpc1Byb2QgPyBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCkgOiB1bmRlZmluZWQsXG4gICAgICBcbiAgICAgIC8vIFJlbW92YWwgcG9saWN5XG4gICAgICByZW1vdmFsUG9saWN5OiBpc1Byb2QgPyBjZGsuUmVtb3ZhbFBvbGljeS5TTkFQU0hPVCA6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSlcblxuICAgIC8vIENsb3VkV2F0Y2ggbG9nIGdyb3VwcyBmb3IgZGF0YWJhc2UgbG9nc1xuICAgIGlmIChpc1Byb2QpIHtcbiAgICAgIG5ldyBjZGsuYXdzX2xvZ3MuTG9nR3JvdXAodGhpcywgJ0RhdGFiYXNlTG9nR3JvdXAnLCB7XG4gICAgICAgIGxvZ0dyb3VwTmFtZTogYC9hd3MvcmRzL2luc3RhbmNlLyR7dGhpcy5kYXRhYmFzZS5pbnN0YW5jZUlkZW50aWZpZXJ9L3Bvc3RncmVzcWxgLFxuICAgICAgICByZXRlbnRpb246IGNkay5hd3NfbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9NT05USCxcbiAgICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gRGF0YWJhc2UgY29ubmVjdGlvbiBzdHJpbmcgZm9yIGFwcGxpY2F0aW9uc1xuICAgIGNvbnN0IGNvbm5lY3Rpb25TdHJpbmcgPSBgcG9zdGdyZXNxbDovLyR7dGhpcy5kYXRhYmFzZVNlY3JldC5zZWNyZXRWYWx1ZUZyb21Kc29uKCd1c2VybmFtZScpfToke3RoaXMuZGF0YWJhc2VTZWNyZXQuc2VjcmV0VmFsdWVGcm9tSnNvbigncGFzc3dvcmQnKX1AJHt0aGlzLmRhdGFiYXNlLmluc3RhbmNlRW5kcG9pbnQuaG9zdG5hbWV9OiR7dGhpcy5kYXRhYmFzZS5pbnN0YW5jZUVuZHBvaW50LnBvcnR9LyR7dGhpcy5kYXRhYmFzZS5pbnN0YW5jZUlkZW50aWZpZXJ9YFxuXG4gICAgLy8gT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEYXRhYmFzZUVuZHBvaW50Jywge1xuICAgICAgdmFsdWU6IHRoaXMuZGF0YWJhc2UuaW5zdGFuY2VFbmRwb2ludC5ob3N0bmFtZSxcbiAgICAgIGV4cG9ydE5hbWU6IGAke2Vudmlyb25tZW50fS1EYXRhYmFzZUVuZHBvaW50YCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUkRTIFBvc3RncmVTUUwgZW5kcG9pbnQnLFxuICAgIH0pXG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRGF0YWJhc2VQb3J0Jywge1xuICAgICAgdmFsdWU6IHRoaXMuZGF0YWJhc2UuaW5zdGFuY2VFbmRwb2ludC5wb3J0LnRvU3RyaW5nKCksXG4gICAgICBleHBvcnROYW1lOiBgJHtlbnZpcm9ubWVudH0tRGF0YWJhc2VQb3J0YCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUkRTIFBvc3RncmVTUUwgcG9ydCcsXG4gICAgfSlcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEYXRhYmFzZU5hbWUnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5kYXRhYmFzZS5pbnN0YW5jZUlkZW50aWZpZXIhLFxuICAgICAgZXhwb3J0TmFtZTogYCR7ZW52aXJvbm1lbnR9LURhdGFiYXNlTmFtZWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ1JEUyBQb3N0Z3JlU1FMIGRhdGFiYXNlIG5hbWUnLFxuICAgIH0pXG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRGF0YWJhc2VTZWNyZXRBcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5kYXRhYmFzZVNlY3JldC5zZWNyZXRBcm4sXG4gICAgICBleHBvcnROYW1lOiBgJHtlbnZpcm9ubWVudH0tRGF0YWJhc2VTZWNyZXRBcm5gLFxuICAgICAgZGVzY3JpcHRpb246ICdBUk4gb2YgdGhlIGRhdGFiYXNlIGNyZWRlbnRpYWxzIHNlY3JldCcsXG4gICAgfSlcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEYXRhYmFzZUluc3RhbmNlSWQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5kYXRhYmFzZS5pbnN0YW5jZUlkZW50aWZpZXIhLFxuICAgICAgZXhwb3J0TmFtZTogYCR7ZW52aXJvbm1lbnR9LURhdGFiYXNlSW5zdGFuY2VJZGAsXG4gICAgICBkZXNjcmlwdGlvbjogJ1JEUyBpbnN0YW5jZSBpZGVudGlmaWVyJyxcbiAgICB9KVxuICB9XG59Il19