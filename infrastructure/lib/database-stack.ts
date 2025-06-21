import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import { Construct } from 'constructs'

export interface DatabaseStackProps extends cdk.StackProps {
  environment: string
  vpc: ec2.Vpc
}

export class DatabaseStack extends cdk.Stack {
  public readonly database: rds.DatabaseInstance
  public readonly databaseSecret: secretsmanager.Secret

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props)

    const { environment, vpc } = props
    const isProd = environment === 'production'

    // Import RDS security group from Network stack
    const rdsSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'RDSSecurityGroup',
      cdk.Fn.importValue(`${environment}-RDSSecurityGroupId`)
    )

    // Create database subnet group
    const subnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
      vpc,
      description: `Subnet group for RealWorld RDS instance (${environment})`,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    })

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
    })

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
    })

    // Option group for additional features
    const optionGroup = new rds.OptionGroup(this, 'DatabaseOptionGroup', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_7,
      }),
      description: `Option group for RealWorld PostgreSQL (${environment})`,
      configurations: [], // Empty configurations for PostgreSQL
    })

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
    })

    // CloudWatch log groups for database logs
    if (isProd) {
      new cdk.aws_logs.LogGroup(this, 'DatabaseLogGroup', {
        logGroupName: `/aws/rds/instance/${this.database.instanceIdentifier}/postgresql`,
        retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      })
    }

    // Database connection string for applications
    const connectionString = `postgresql://${this.databaseSecret.secretValueFromJson('username')}:${this.databaseSecret.secretValueFromJson('password')}@${this.database.instanceEndpoint.hostname}:${this.database.instanceEndpoint.port}/${this.database.instanceIdentifier}`

    // Outputs
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.instanceEndpoint.hostname,
      exportName: `${environment}-DatabaseEndpoint`,
      description: 'RDS PostgreSQL endpoint',
    })

    new cdk.CfnOutput(this, 'DatabasePort', {
      value: this.database.instanceEndpoint.port.toString(),
      exportName: `${environment}-DatabasePort`,
      description: 'RDS PostgreSQL port',
    })

    new cdk.CfnOutput(this, 'DatabaseName', {
      value: this.database.instanceIdentifier!,
      exportName: `${environment}-DatabaseName`,
      description: 'RDS PostgreSQL database name',
    })

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.databaseSecret.secretArn,
      exportName: `${environment}-DatabaseSecretArn`,
      description: 'ARN of the database credentials secret',
    })

    new cdk.CfnOutput(this, 'DatabaseInstanceId', {
      value: this.database.instanceIdentifier!,
      exportName: `${environment}-DatabaseInstanceId`,
      description: 'RDS instance identifier',
    })
  }
}