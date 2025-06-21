import * as cdk from 'aws-cdk-lib'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions'
import * as logs from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'

export interface MonitoringStackProps extends cdk.StackProps {
  environment: string
  ecsService: ecs.FargateService
  database: rds.DatabaseInstance
  loadBalancer: elbv2.ApplicationLoadBalancer
}

export class MonitoringStack extends cdk.Stack {
  public readonly dashboard: cloudwatch.Dashboard
  public readonly alertsTopic: sns.Topic

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props)

    const { environment, ecsService, database, loadBalancer } = props
    const isProd = environment === 'production'

    // SNS Topic for alerts
    this.alertsTopic = new sns.Topic(this, 'AlertsTopic', {
      topicName: `realworld-alerts-${environment}`,
      displayName: `RealWorld Alerts (${environment})`,
    })

    // Email subscription for alerts (replace with actual email)
    if (isProd) {
      this.alertsTopic.addSubscription(
        new snsSubscriptions.EmailSubscription('alerts@example.com')
      )
    }

    // CloudWatch Dashboard
    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `RealWorld-${environment}`,
    })

    // ECS Metrics
    const ecsMetrics = this.createEcsMetrics(ecsService)
    
    // Database Metrics
    const databaseMetrics = this.createDatabaseMetrics(database)
    
    // Load Balancer Metrics
    const albMetrics = this.createLoadBalancerMetrics(loadBalancer)

    // Add widgets to dashboard
    this.dashboard.addWidgets(
      // Top row - Overview
      new cloudwatch.SingleValueWidget({
        title: 'Service Status',
        metrics: [ecsMetrics.runningTasks],
        width: 6,
        height: 6,
      }),
      new cloudwatch.SingleValueWidget({
        title: 'Active Connections',
        metrics: [albMetrics.activeConnections],
        width: 6,
        height: 6,
      }),
      new cloudwatch.SingleValueWidget({
        title: 'Database Connections',
        metrics: [databaseMetrics.connections],
        width: 6,
        height: 6,
      }),
      new cloudwatch.SingleValueWidget({
        title: 'Response Time (avg)',
        metrics: [albMetrics.responseTime],
        width: 6,
        height: 6,
      }),

      // Second row - ECS Performance
      new cloudwatch.GraphWidget({
        title: 'ECS CPU & Memory Utilization',
        left: [ecsMetrics.cpuUtilization],
        right: [ecsMetrics.memoryUtilization],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'ECS Task Count',
        left: [ecsMetrics.runningTasks, ecsMetrics.pendingTasks],
        width: 12,
        height: 6,
      }),

      // Third row - Load Balancer
      new cloudwatch.GraphWidget({
        title: 'Load Balancer Request Count',
        left: [albMetrics.requestCount],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Load Balancer Response Time',
        left: [albMetrics.responseTime],
        width: 12,
        height: 6,
      }),

      // Fourth row - Database
      new cloudwatch.GraphWidget({
        title: 'Database CPU & Memory',
        left: [databaseMetrics.cpuUtilization],
        right: [databaseMetrics.freeableMemory],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Database Connections & Read/Write IOPS',
        left: [databaseMetrics.connections],
        right: [databaseMetrics.readIOPS, databaseMetrics.writeIOPS],
        width: 12,
        height: 6,
      }),

      // Fifth row - Error Rates
      new cloudwatch.GraphWidget({
        title: 'HTTP Error Rates',
        left: [albMetrics.httpErrors4xx, albMetrics.httpErrors5xx],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Target Response Codes',
        left: [albMetrics.targetResponse2xx, albMetrics.targetResponse4xx, albMetrics.targetResponse5xx],
        width: 12,
        height: 6,
      }),
    )

    // Create alarms
    this.createAlarms(ecsMetrics, databaseMetrics, albMetrics)

    // Custom metrics for application-specific monitoring
    this.createCustomMetrics()

    // Outputs
    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL',
    })

    new cdk.CfnOutput(this, 'AlertsTopicArn', {
      value: this.alertsTopic.topicArn,
      exportName: `${environment}-AlertsTopicArn`,
      description: 'SNS Topic ARN for alerts',
    })
  }

  private createEcsMetrics(ecsService: ecs.FargateService) {
    return {
      cpuUtilization: ecsService.metricCpuUtilization({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      memoryUtilization: ecsService.metricMemoryUtilization({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      runningTasks: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'RunningTaskCount',
        dimensionsMap: {
          ServiceName: ecsService.serviceName,
          ClusterName: ecsService.cluster.clusterName,
        },
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      pendingTasks: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'PendingTaskCount',
        dimensionsMap: {
          ServiceName: ecsService.serviceName,
          ClusterName: ecsService.cluster.clusterName,
        },
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
    }
  }

  private createDatabaseMetrics(database: rds.DatabaseInstance) {
    return {
      cpuUtilization: database.metricCPUUtilization({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      connections: database.metricDatabaseConnections({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      freeableMemory: database.metricFreeableMemory({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      readIOPS: database.metricReadIOPS({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      writeIOPS: database.metricWriteIOPS({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
    }
  }

  private createLoadBalancerMetrics(loadBalancer: elbv2.ApplicationLoadBalancer) {
    return {
      requestCount: loadBalancer.metricRequestCount({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      responseTime: loadBalancer.metricTargetResponseTime({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      activeConnections: loadBalancer.metricActiveConnectionCount({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      httpErrors4xx: loadBalancer.metricHttpCodeElb(elbv2.HttpCodeElb.ELB_4XX_COUNT, {
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      httpErrors5xx: loadBalancer.metricHttpCodeElb(elbv2.HttpCodeElb.ELB_5XX_COUNT, {
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      targetResponse2xx: loadBalancer.metricHttpCodeTarget(elbv2.HttpCodeTarget.TARGET_2XX_COUNT, {
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      targetResponse4xx: loadBalancer.metricHttpCodeTarget(elbv2.HttpCodeTarget.TARGET_4XX_COUNT, {
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      targetResponse5xx: loadBalancer.metricHttpCodeTarget(elbv2.HttpCodeTarget.TARGET_5XX_COUNT, {
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
    }
  }

  private createAlarms(ecsMetrics: any, databaseMetrics: any, albMetrics: any) {
    const { environment } = this.node.tryGetContext('environment') || 'dev'
    const isProd = environment === 'production'

    // High CPU Usage Alarm
    new cloudwatch.Alarm(this, 'HighCpuAlarm', {
      alarmName: `RealWorld-${environment}-HighCPU`,
      alarmDescription: 'High CPU utilization on ECS service',
      metric: ecsMetrics.cpuUtilization,
      threshold: isProd ? 80 : 90,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic))

    // High Memory Usage Alarm
    new cloudwatch.Alarm(this, 'HighMemoryAlarm', {
      alarmName: `RealWorld-${environment}-HighMemory`,
      alarmDescription: 'High memory utilization on ECS service',
      metric: ecsMetrics.memoryUtilization,
      threshold: isProd ? 85 : 95,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic))

    // Database CPU Alarm
    new cloudwatch.Alarm(this, 'DatabaseHighCpuAlarm', {
      alarmName: `RealWorld-${environment}-DatabaseHighCPU`,
      alarmDescription: 'High CPU utilization on RDS instance',
      metric: databaseMetrics.cpuUtilization,
      threshold: isProd ? 75 : 85,
      evaluationPeriods: 3,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic))

    // High Error Rate Alarm
    new cloudwatch.Alarm(this, 'HighErrorRateAlarm', {
      alarmName: `RealWorld-${environment}-HighErrorRate`,
      alarmDescription: 'High 5xx error rate from load balancer',
      metric: albMetrics.httpErrors5xx,
      threshold: isProd ? 10 : 50,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic))

    // High Response Time Alarm
    new cloudwatch.Alarm(this, 'HighResponseTimeAlarm', {
      alarmName: `RealWorld-${environment}-HighResponseTime`,
      alarmDescription: 'High response time from targets',
      metric: albMetrics.responseTime,
      threshold: isProd ? 2 : 5, // seconds
      evaluationPeriods: 3,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic))

    // Database Connection Alarm
    new cloudwatch.Alarm(this, 'DatabaseConnectionsAlarm', {
      alarmName: `RealWorld-${environment}-DatabaseConnections`,
      alarmDescription: 'High number of database connections',
      metric: databaseMetrics.connections,
      threshold: isProd ? 80 : 40,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic))
  }

  private createCustomMetrics() {
    // Log groups for custom metrics
    const applicationLogGroup = new logs.LogGroup(this, 'ApplicationLogGroup', {
      logGroupName: '/custom/realworld/application',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Custom metric filters
    new logs.MetricFilter(this, 'ErrorMetricFilter', {
      logGroup: applicationLogGroup,
      metricNamespace: 'RealWorld/Application',
      metricName: 'ErrorCount',
      filterPattern: logs.FilterPattern.literal('[timestamp, requestId, level="ERROR", ...]'),
      metricValue: '1',
      defaultValue: 0,
    })

    new logs.MetricFilter(this, 'UserLoginMetricFilter', {
      logGroup: applicationLogGroup,
      metricNamespace: 'RealWorld/Application',
      metricName: 'UserLogins',
      filterPattern: logs.FilterPattern.literal('[timestamp, requestId, level, action="USER_LOGIN", ...]'),
      metricValue: '1',
      defaultValue: 0,
    })

    new logs.MetricFilter(this, 'ArticleCreatedMetricFilter', {
      logGroup: applicationLogGroup,
      metricNamespace: 'RealWorld/Application',
      metricName: 'ArticlesCreated',
      filterPattern: logs.FilterPattern.literal('[timestamp, requestId, level, action="ARTICLE_CREATED", ...]'),
      metricValue: '1',
      defaultValue: 0,
    })
  }
}