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
exports.MonitoringStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const cloudwatch = __importStar(require("aws-cdk-lib/aws-cloudwatch"));
const elbv2 = __importStar(require("aws-cdk-lib/aws-elasticloadbalancingv2"));
const sns = __importStar(require("aws-cdk-lib/aws-sns"));
const snsSubscriptions = __importStar(require("aws-cdk-lib/aws-sns-subscriptions"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
class MonitoringStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { environment, ecsService, database, loadBalancer } = props;
        const isProd = environment === 'production';
        // SNS Topic for alerts
        this.alertsTopic = new sns.Topic(this, 'AlertsTopic', {
            topicName: `realworld-alerts-${environment}`,
            displayName: `RealWorld Alerts (${environment})`,
        });
        // Email subscription for alerts (replace with actual email)
        if (isProd) {
            this.alertsTopic.addSubscription(new snsSubscriptions.EmailSubscription('alerts@example.com'));
        }
        // CloudWatch Dashboard
        this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
            dashboardName: `RealWorld-${environment}`,
        });
        // ECS Metrics
        const ecsMetrics = this.createEcsMetrics(ecsService);
        // Database Metrics
        const databaseMetrics = this.createDatabaseMetrics(database);
        // Load Balancer Metrics
        const albMetrics = this.createLoadBalancerMetrics(loadBalancer);
        // Add widgets to dashboard
        this.dashboard.addWidgets(
        // Top row - Overview
        new cloudwatch.SingleValueWidget({
            title: 'Service Status',
            metrics: [ecsMetrics.runningTasks],
            width: 6,
            height: 6,
        }), new cloudwatch.SingleValueWidget({
            title: 'Active Connections',
            metrics: [albMetrics.activeConnections],
            width: 6,
            height: 6,
        }), new cloudwatch.SingleValueWidget({
            title: 'Database Connections',
            metrics: [databaseMetrics.connections],
            width: 6,
            height: 6,
        }), new cloudwatch.SingleValueWidget({
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
        }), new cloudwatch.GraphWidget({
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
        }), new cloudwatch.GraphWidget({
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
        }), new cloudwatch.GraphWidget({
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
        }), new cloudwatch.GraphWidget({
            title: 'Target Response Codes',
            left: [albMetrics.targetResponse2xx, albMetrics.targetResponse4xx, albMetrics.targetResponse5xx],
            width: 12,
            height: 6,
        }));
        // Create alarms
        this.createAlarms(ecsMetrics, databaseMetrics, albMetrics);
        // Custom metrics for application-specific monitoring
        this.createCustomMetrics();
        // Outputs
        new cdk.CfnOutput(this, 'DashboardUrl', {
            value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.dashboard.dashboardName}`,
            description: 'CloudWatch Dashboard URL',
        });
        new cdk.CfnOutput(this, 'AlertsTopicArn', {
            value: this.alertsTopic.topicArn,
            exportName: `${environment}-AlertsTopicArn`,
            description: 'SNS Topic ARN for alerts',
        });
    }
    createEcsMetrics(ecsService) {
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
        };
    }
    createDatabaseMetrics(database) {
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
        };
    }
    createLoadBalancerMetrics(loadBalancer) {
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
        };
    }
    createAlarms(ecsMetrics, databaseMetrics, albMetrics) {
        const { environment } = this.node.tryGetContext('environment') || 'dev';
        const isProd = environment === 'production';
        // High CPU Usage Alarm
        new cloudwatch.Alarm(this, 'HighCpuAlarm', {
            alarmName: `RealWorld-${environment}-HighCPU`,
            alarmDescription: 'High CPU utilization on ECS service',
            metric: ecsMetrics.cpuUtilization,
            threshold: isProd ? 80 : 90,
            evaluationPeriods: 2,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic));
        // High Memory Usage Alarm
        new cloudwatch.Alarm(this, 'HighMemoryAlarm', {
            alarmName: `RealWorld-${environment}-HighMemory`,
            alarmDescription: 'High memory utilization on ECS service',
            metric: ecsMetrics.memoryUtilization,
            threshold: isProd ? 85 : 95,
            evaluationPeriods: 2,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic));
        // Database CPU Alarm
        new cloudwatch.Alarm(this, 'DatabaseHighCpuAlarm', {
            alarmName: `RealWorld-${environment}-DatabaseHighCPU`,
            alarmDescription: 'High CPU utilization on RDS instance',
            metric: databaseMetrics.cpuUtilization,
            threshold: isProd ? 75 : 85,
            evaluationPeriods: 3,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic));
        // High Error Rate Alarm
        new cloudwatch.Alarm(this, 'HighErrorRateAlarm', {
            alarmName: `RealWorld-${environment}-HighErrorRate`,
            alarmDescription: 'High 5xx error rate from load balancer',
            metric: albMetrics.httpErrors5xx,
            threshold: isProd ? 10 : 50,
            evaluationPeriods: 2,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic));
        // High Response Time Alarm
        new cloudwatch.Alarm(this, 'HighResponseTimeAlarm', {
            alarmName: `RealWorld-${environment}-HighResponseTime`,
            alarmDescription: 'High response time from targets',
            metric: albMetrics.responseTime,
            threshold: isProd ? 2 : 5, // seconds
            evaluationPeriods: 3,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic));
        // Database Connection Alarm
        new cloudwatch.Alarm(this, 'DatabaseConnectionsAlarm', {
            alarmName: `RealWorld-${environment}-DatabaseConnections`,
            alarmDescription: 'High number of database connections',
            metric: databaseMetrics.connections,
            threshold: isProd ? 80 : 40,
            evaluationPeriods: 2,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(this.alertsTopic));
    }
    createCustomMetrics() {
        // Log groups for custom metrics
        const applicationLogGroup = new logs.LogGroup(this, 'ApplicationLogGroup', {
            logGroupName: '/custom/realworld/application',
            retention: logs.RetentionDays.ONE_MONTH,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // Custom metric filters
        new logs.MetricFilter(this, 'ErrorMetricFilter', {
            logGroup: applicationLogGroup,
            metricNamespace: 'RealWorld/Application',
            metricName: 'ErrorCount',
            filterPattern: logs.FilterPattern.literal('[timestamp, requestId, level="ERROR", ...]'),
            metricValue: '1',
            defaultValue: 0,
        });
        new logs.MetricFilter(this, 'UserLoginMetricFilter', {
            logGroup: applicationLogGroup,
            metricNamespace: 'RealWorld/Application',
            metricName: 'UserLogins',
            filterPattern: logs.FilterPattern.literal('[timestamp, requestId, level, action="USER_LOGIN", ...]'),
            metricValue: '1',
            defaultValue: 0,
        });
        new logs.MetricFilter(this, 'ArticleCreatedMetricFilter', {
            logGroup: applicationLogGroup,
            metricNamespace: 'RealWorld/Application',
            metricName: 'ArticlesCreated',
            filterPattern: logs.FilterPattern.literal('[timestamp, requestId, level, action="ARTICLE_CREATED", ...]'),
            metricValue: '1',
            defaultValue: 0,
        });
    }
}
exports.MonitoringStack = MonitoringStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uaXRvcmluZy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1vbml0b3Jpbmctc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQWtDO0FBQ2xDLHVFQUF3RDtBQUd4RCw4RUFBK0Q7QUFDL0QseURBQTBDO0FBQzFDLG9GQUFxRTtBQUNyRSwyREFBNEM7QUFVNUMsTUFBYSxlQUFnQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBSTVDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBMkI7UUFDbkUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFdkIsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxHQUFHLEtBQUssQ0FBQTtRQUNqRSxNQUFNLE1BQU0sR0FBRyxXQUFXLEtBQUssWUFBWSxDQUFBO1FBRTNDLHVCQUF1QjtRQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ3BELFNBQVMsRUFBRSxvQkFBb0IsV0FBVyxFQUFFO1lBQzVDLFdBQVcsRUFBRSxxQkFBcUIsV0FBVyxHQUFHO1NBQ2pELENBQUMsQ0FBQTtRQUVGLDREQUE0RDtRQUM1RCxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQzlCLElBQUksZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsQ0FDN0QsQ0FBQTtRQUNILENBQUM7UUFFRCx1QkFBdUI7UUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUMzRCxhQUFhLEVBQUUsYUFBYSxXQUFXLEVBQUU7U0FDMUMsQ0FBQyxDQUFBO1FB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ImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCAqIGFzIGNsb3Vkd2F0Y2ggZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3Vkd2F0Y2gnXG5pbXBvcnQgKiBhcyBlY3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcydcbmltcG9ydCAqIGFzIHJkcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtcmRzJ1xuaW1wb3J0ICogYXMgZWxidjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInXG5pbXBvcnQgKiBhcyBzbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNucydcbmltcG9ydCAqIGFzIHNuc1N1YnNjcmlwdGlvbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNucy1zdWJzY3JpcHRpb25zJ1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncydcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgTW9uaXRvcmluZ1N0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIGVudmlyb25tZW50OiBzdHJpbmdcbiAgZWNzU2VydmljZTogZWNzLkZhcmdhdGVTZXJ2aWNlXG4gIGRhdGFiYXNlOiByZHMuRGF0YWJhc2VJbnN0YW5jZVxuICBsb2FkQmFsYW5jZXI6IGVsYnYyLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyXG59XG5cbmV4cG9ydCBjbGFzcyBNb25pdG9yaW5nU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwdWJsaWMgcmVhZG9ubHkgZGFzaGJvYXJkOiBjbG91ZHdhdGNoLkRhc2hib2FyZFxuICBwdWJsaWMgcmVhZG9ubHkgYWxlcnRzVG9waWM6IHNucy5Ub3BpY1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBNb25pdG9yaW5nU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpXG5cbiAgICBjb25zdCB7IGVudmlyb25tZW50LCBlY3NTZXJ2aWNlLCBkYXRhYmFzZSwgbG9hZEJhbGFuY2VyIH0gPSBwcm9wc1xuICAgIGNvbnN0IGlzUHJvZCA9IGVudmlyb25tZW50ID09PSAncHJvZHVjdGlvbidcblxuICAgIC8vIFNOUyBUb3BpYyBmb3IgYWxlcnRzXG4gICAgdGhpcy5hbGVydHNUb3BpYyA9IG5ldyBzbnMuVG9waWModGhpcywgJ0FsZXJ0c1RvcGljJywge1xuICAgICAgdG9waWNOYW1lOiBgcmVhbHdvcmxkLWFsZXJ0cy0ke2Vudmlyb25tZW50fWAsXG4gICAgICBkaXNwbGF5TmFtZTogYFJlYWxXb3JsZCBBbGVydHMgKCR7ZW52aXJvbm1lbnR9KWAsXG4gICAgfSlcblxuICAgIC8vIEVtYWlsIHN1YnNjcmlwdGlvbiBmb3IgYWxlcnRzIChyZXBsYWNlIHdpdGggYWN0dWFsIGVtYWlsKVxuICAgIGlmIChpc1Byb2QpIHtcbiAgICAgIHRoaXMuYWxlcnRzVG9waWMuYWRkU3Vic2NyaXB0aW9uKFxuICAgICAgICBuZXcgc25zU3Vic2NyaXB0aW9ucy5FbWFpbFN1YnNjcmlwdGlvbignYWxlcnRzQGV4YW1wbGUuY29tJylcbiAgICAgIClcbiAgICB9XG5cbiAgICAvLyBDbG91ZFdhdGNoIERhc2hib2FyZFxuICAgIHRoaXMuZGFzaGJvYXJkID0gbmV3IGNsb3Vkd2F0Y2guRGFzaGJvYXJkKHRoaXMsICdEYXNoYm9hcmQnLCB7XG4gICAgICBkYXNoYm9hcmROYW1lOiBgUmVhbFdvcmxkLSR7ZW52aXJvbm1lbnR9YCxcbiAgICB9KVxuXG4gICAgLy8gRUNTIE1ldHJpY3NcbiAgICBjb25zdCBlY3NNZXRyaWNzID0gdGhpcy5jcmVhdGVFY3NNZXRyaWNzKGVjc1NlcnZpY2UpXG4gICAgXG4gICAgLy8gRGF0YWJhc2UgTWV0cmljc1xuICAgIGNvbnN0IGRhdGFiYXNlTWV0cmljcyA9IHRoaXMuY3JlYXRlRGF0YWJhc2VNZXRyaWNzKGRhdGFiYXNlKVxuICAgIFxuICAgIC8vIExvYWQgQmFsYW5jZXIgTWV0cmljc1xuICAgIGNvbnN0IGFsYk1ldHJpY3MgPSB0aGlzLmNyZWF0ZUxvYWRCYWxhbmNlck1ldHJpY3MobG9hZEJhbGFuY2VyKVxuXG4gICAgLy8gQWRkIHdpZGdldHMgdG8gZGFzaGJvYXJkXG4gICAgdGhpcy5kYXNoYm9hcmQuYWRkV2lkZ2V0cyhcbiAgICAgIC8vIFRvcCByb3cgLSBPdmVydmlld1xuICAgICAgbmV3IGNsb3Vkd2F0Y2guU2luZ2xlVmFsdWVXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ1NlcnZpY2UgU3RhdHVzJyxcbiAgICAgICAgbWV0cmljczogW2Vjc01ldHJpY3MucnVubmluZ1Rhc2tzXSxcbiAgICAgICAgd2lkdGg6IDYsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pLFxuICAgICAgbmV3IGNsb3Vkd2F0Y2guU2luZ2xlVmFsdWVXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0FjdGl2ZSBDb25uZWN0aW9ucycsXG4gICAgICAgIG1ldHJpY3M6IFthbGJNZXRyaWNzLmFjdGl2ZUNvbm5lY3Rpb25zXSxcbiAgICAgICAgd2lkdGg6IDYsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pLFxuICAgICAgbmV3IGNsb3Vkd2F0Y2guU2luZ2xlVmFsdWVXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0RhdGFiYXNlIENvbm5lY3Rpb25zJyxcbiAgICAgICAgbWV0cmljczogW2RhdGFiYXNlTWV0cmljcy5jb25uZWN0aW9uc10sXG4gICAgICAgIHdpZHRoOiA2LFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KSxcbiAgICAgIG5ldyBjbG91ZHdhdGNoLlNpbmdsZVZhbHVlV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdSZXNwb25zZSBUaW1lIChhdmcpJyxcbiAgICAgICAgbWV0cmljczogW2FsYk1ldHJpY3MucmVzcG9uc2VUaW1lXSxcbiAgICAgICAgd2lkdGg6IDYsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pLFxuXG4gICAgICAvLyBTZWNvbmQgcm93IC0gRUNTIFBlcmZvcm1hbmNlXG4gICAgICBuZXcgY2xvdWR3YXRjaC5HcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnRUNTIENQVSAmIE1lbW9yeSBVdGlsaXphdGlvbicsXG4gICAgICAgIGxlZnQ6IFtlY3NNZXRyaWNzLmNwdVV0aWxpemF0aW9uXSxcbiAgICAgICAgcmlnaHQ6IFtlY3NNZXRyaWNzLm1lbW9yeVV0aWxpemF0aW9uXSxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KSxcbiAgICAgIG5ldyBjbG91ZHdhdGNoLkdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdFQ1MgVGFzayBDb3VudCcsXG4gICAgICAgIGxlZnQ6IFtlY3NNZXRyaWNzLnJ1bm5pbmdUYXNrcywgZWNzTWV0cmljcy5wZW5kaW5nVGFza3NdLFxuICAgICAgICB3aWR0aDogMTIsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pLFxuXG4gICAgICAvLyBUaGlyZCByb3cgLSBMb2FkIEJhbGFuY2VyXG4gICAgICBuZXcgY2xvdWR3YXRjaC5HcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnTG9hZCBCYWxhbmNlciBSZXF1ZXN0IENvdW50JyxcbiAgICAgICAgbGVmdDogW2FsYk1ldHJpY3MucmVxdWVzdENvdW50XSxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KSxcbiAgICAgIG5ldyBjbG91ZHdhdGNoLkdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdMb2FkIEJhbGFuY2VyIFJlc3BvbnNlIFRpbWUnLFxuICAgICAgICBsZWZ0OiBbYWxiTWV0cmljcy5yZXNwb25zZVRpbWVdLFxuICAgICAgICB3aWR0aDogMTIsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pLFxuXG4gICAgICAvLyBGb3VydGggcm93IC0gRGF0YWJhc2VcbiAgICAgIG5ldyBjbG91ZHdhdGNoLkdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdEYXRhYmFzZSBDUFUgJiBNZW1vcnknLFxuICAgICAgICBsZWZ0OiBbZGF0YWJhc2VNZXRyaWNzLmNwdVV0aWxpemF0aW9uXSxcbiAgICAgICAgcmlnaHQ6IFtkYXRhYmFzZU1ldHJpY3MuZnJlZWFibGVNZW1vcnldLFxuICAgICAgICB3aWR0aDogMTIsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pLFxuICAgICAgbmV3IGNsb3Vkd2F0Y2guR3JhcGhXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0RhdGFiYXNlIENvbm5lY3Rpb25zICYgUmVhZC9Xcml0ZSBJT1BTJyxcbiAgICAgICAgbGVmdDogW2RhdGFiYXNlTWV0cmljcy5jb25uZWN0aW9uc10sXG4gICAgICAgIHJpZ2h0OiBbZGF0YWJhc2VNZXRyaWNzLnJlYWRJT1BTLCBkYXRhYmFzZU1ldHJpY3Mud3JpdGVJT1BTXSxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KSxcblxuICAgICAgLy8gRmlmdGggcm93IC0gRXJyb3IgUmF0ZXNcbiAgICAgIG5ldyBjbG91ZHdhdGNoLkdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdIVFRQIEVycm9yIFJhdGVzJyxcbiAgICAgICAgbGVmdDogW2FsYk1ldHJpY3MuaHR0cEVycm9yczR4eCwgYWxiTWV0cmljcy5odHRwRXJyb3JzNXh4XSxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KSxcbiAgICAgIG5ldyBjbG91ZHdhdGNoLkdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdUYXJnZXQgUmVzcG9uc2UgQ29kZXMnLFxuICAgICAgICBsZWZ0OiBbYWxiTWV0cmljcy50YXJnZXRSZXNwb25zZTJ4eCwgYWxiTWV0cmljcy50YXJnZXRSZXNwb25zZTR4eCwgYWxiTWV0cmljcy50YXJnZXRSZXNwb25zZTV4eF0sXG4gICAgICAgIHdpZHRoOiAxMixcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgLy8gQ3JlYXRlIGFsYXJtc1xuICAgIHRoaXMuY3JlYXRlQWxhcm1zKGVjc01ldHJpY3MsIGRhdGFiYXNlTWV0cmljcywgYWxiTWV0cmljcylcblxuICAgIC8vIEN1c3RvbSBtZXRyaWNzIGZvciBhcHBsaWNhdGlvbi1zcGVjaWZpYyBtb25pdG9yaW5nXG4gICAgdGhpcy5jcmVhdGVDdXN0b21NZXRyaWNzKClcblxuICAgIC8vIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRGFzaGJvYXJkVXJsJywge1xuICAgICAgdmFsdWU6IGBodHRwczovLyR7dGhpcy5yZWdpb259LmNvbnNvbGUuYXdzLmFtYXpvbi5jb20vY2xvdWR3YXRjaC9ob21lP3JlZ2lvbj0ke3RoaXMucmVnaW9ufSNkYXNoYm9hcmRzOm5hbWU9JHt0aGlzLmRhc2hib2FyZC5kYXNoYm9hcmROYW1lfWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Nsb3VkV2F0Y2ggRGFzaGJvYXJkIFVSTCcsXG4gICAgfSlcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBbGVydHNUb3BpY0FybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFsZXJ0c1RvcGljLnRvcGljQXJuLFxuICAgICAgZXhwb3J0TmFtZTogYCR7ZW52aXJvbm1lbnR9LUFsZXJ0c1RvcGljQXJuYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU05TIFRvcGljIEFSTiBmb3IgYWxlcnRzJyxcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVFY3NNZXRyaWNzKGVjc1NlcnZpY2U6IGVjcy5GYXJnYXRlU2VydmljZSkge1xuICAgIHJldHVybiB7XG4gICAgICBjcHVVdGlsaXphdGlvbjogZWNzU2VydmljZS5tZXRyaWNDcHVVdGlsaXphdGlvbih7XG4gICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICAgIHN0YXRpc3RpYzogJ0F2ZXJhZ2UnLFxuICAgICAgfSksXG4gICAgICBtZW1vcnlVdGlsaXphdGlvbjogZWNzU2VydmljZS5tZXRyaWNNZW1vcnlVdGlsaXphdGlvbih7XG4gICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICAgIHN0YXRpc3RpYzogJ0F2ZXJhZ2UnLFxuICAgICAgfSksXG4gICAgICBydW5uaW5nVGFza3M6IG5ldyBjbG91ZHdhdGNoLk1ldHJpYyh7XG4gICAgICAgIG5hbWVzcGFjZTogJ0FXUy9FQ1MnLFxuICAgICAgICBtZXRyaWNOYW1lOiAnUnVubmluZ1Rhc2tDb3VudCcsXG4gICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICBTZXJ2aWNlTmFtZTogZWNzU2VydmljZS5zZXJ2aWNlTmFtZSxcbiAgICAgICAgICBDbHVzdGVyTmFtZTogZWNzU2VydmljZS5jbHVzdGVyLmNsdXN0ZXJOYW1lLFxuICAgICAgICB9LFxuICAgICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgICBzdGF0aXN0aWM6ICdBdmVyYWdlJyxcbiAgICAgIH0pLFxuICAgICAgcGVuZGluZ1Rhc2tzOiBuZXcgY2xvdWR3YXRjaC5NZXRyaWMoe1xuICAgICAgICBuYW1lc3BhY2U6ICdBV1MvRUNTJyxcbiAgICAgICAgbWV0cmljTmFtZTogJ1BlbmRpbmdUYXNrQ291bnQnLFxuICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgU2VydmljZU5hbWU6IGVjc1NlcnZpY2Uuc2VydmljZU5hbWUsXG4gICAgICAgICAgQ2x1c3Rlck5hbWU6IGVjc1NlcnZpY2UuY2x1c3Rlci5jbHVzdGVyTmFtZSxcbiAgICAgICAgfSxcbiAgICAgICAgcGVyaW9kOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgICAgc3RhdGlzdGljOiAnQXZlcmFnZScsXG4gICAgICB9KSxcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZURhdGFiYXNlTWV0cmljcyhkYXRhYmFzZTogcmRzLkRhdGFiYXNlSW5zdGFuY2UpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY3B1VXRpbGl6YXRpb246IGRhdGFiYXNlLm1ldHJpY0NQVVV0aWxpemF0aW9uKHtcbiAgICAgICAgcGVyaW9kOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgICAgc3RhdGlzdGljOiAnQXZlcmFnZScsXG4gICAgICB9KSxcbiAgICAgIGNvbm5lY3Rpb25zOiBkYXRhYmFzZS5tZXRyaWNEYXRhYmFzZUNvbm5lY3Rpb25zKHtcbiAgICAgICAgcGVyaW9kOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgICAgc3RhdGlzdGljOiAnQXZlcmFnZScsXG4gICAgICB9KSxcbiAgICAgIGZyZWVhYmxlTWVtb3J5OiBkYXRhYmFzZS5tZXRyaWNGcmVlYWJsZU1lbW9yeSh7XG4gICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICAgIHN0YXRpc3RpYzogJ0F2ZXJhZ2UnLFxuICAgICAgfSksXG4gICAgICByZWFkSU9QUzogZGF0YWJhc2UubWV0cmljUmVhZElPUFMoe1xuICAgICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgICBzdGF0aXN0aWM6ICdBdmVyYWdlJyxcbiAgICAgIH0pLFxuICAgICAgd3JpdGVJT1BTOiBkYXRhYmFzZS5tZXRyaWNXcml0ZUlPUFMoe1xuICAgICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgICBzdGF0aXN0aWM6ICdBdmVyYWdlJyxcbiAgICAgIH0pLFxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlTG9hZEJhbGFuY2VyTWV0cmljcyhsb2FkQmFsYW5jZXI6IGVsYnYyLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlcXVlc3RDb3VudDogbG9hZEJhbGFuY2VyLm1ldHJpY1JlcXVlc3RDb3VudCh7XG4gICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICB9KSxcbiAgICAgIHJlc3BvbnNlVGltZTogbG9hZEJhbGFuY2VyLm1ldHJpY1RhcmdldFJlc3BvbnNlVGltZSh7XG4gICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICAgIHN0YXRpc3RpYzogJ0F2ZXJhZ2UnLFxuICAgICAgfSksXG4gICAgICBhY3RpdmVDb25uZWN0aW9uczogbG9hZEJhbGFuY2VyLm1ldHJpY0FjdGl2ZUNvbm5lY3Rpb25Db3VudCh7XG4gICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICAgIHN0YXRpc3RpYzogJ0F2ZXJhZ2UnLFxuICAgICAgfSksXG4gICAgICBodHRwRXJyb3JzNHh4OiBsb2FkQmFsYW5jZXIubWV0cmljSHR0cENvZGVFbGIoZWxidjIuSHR0cENvZGVFbGIuRUxCXzRYWF9DT1VOVCwge1xuICAgICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgfSksXG4gICAgICBodHRwRXJyb3JzNXh4OiBsb2FkQmFsYW5jZXIubWV0cmljSHR0cENvZGVFbGIoZWxidjIuSHR0cENvZGVFbGIuRUxCXzVYWF9DT1VOVCwge1xuICAgICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgfSksXG4gICAgICB0YXJnZXRSZXNwb25zZTJ4eDogbG9hZEJhbGFuY2VyLm1ldHJpY0h0dHBDb2RlVGFyZ2V0KGVsYnYyLkh0dHBDb2RlVGFyZ2V0LlRBUkdFVF8yWFhfQ09VTlQsIHtcbiAgICAgICAgcGVyaW9kOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgIH0pLFxuICAgICAgdGFyZ2V0UmVzcG9uc2U0eHg6IGxvYWRCYWxhbmNlci5tZXRyaWNIdHRwQ29kZVRhcmdldChlbGJ2Mi5IdHRwQ29kZVRhcmdldC5UQVJHRVRfNFhYX0NPVU5ULCB7XG4gICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICB9KSxcbiAgICAgIHRhcmdldFJlc3BvbnNlNXh4OiBsb2FkQmFsYW5jZXIubWV0cmljSHR0cENvZGVUYXJnZXQoZWxidjIuSHR0cENvZGVUYXJnZXQuVEFSR0VUXzVYWF9DT1VOVCwge1xuICAgICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgfSksXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVBbGFybXMoZWNzTWV0cmljczogYW55LCBkYXRhYmFzZU1ldHJpY3M6IGFueSwgYWxiTWV0cmljczogYW55KSB7XG4gICAgY29uc3QgeyBlbnZpcm9ubWVudCB9ID0gdGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ2Vudmlyb25tZW50JykgfHwgJ2RldidcbiAgICBjb25zdCBpc1Byb2QgPSBlbnZpcm9ubWVudCA9PT0gJ3Byb2R1Y3Rpb24nXG5cbiAgICAvLyBIaWdoIENQVSBVc2FnZSBBbGFybVxuICAgIG5ldyBjbG91ZHdhdGNoLkFsYXJtKHRoaXMsICdIaWdoQ3B1QWxhcm0nLCB7XG4gICAgICBhbGFybU5hbWU6IGBSZWFsV29ybGQtJHtlbnZpcm9ubWVudH0tSGlnaENQVWAsXG4gICAgICBhbGFybURlc2NyaXB0aW9uOiAnSGlnaCBDUFUgdXRpbGl6YXRpb24gb24gRUNTIHNlcnZpY2UnLFxuICAgICAgbWV0cmljOiBlY3NNZXRyaWNzLmNwdVV0aWxpemF0aW9uLFxuICAgICAgdGhyZXNob2xkOiBpc1Byb2QgPyA4MCA6IDkwLFxuICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDIsXG4gICAgICB0cmVhdE1pc3NpbmdEYXRhOiBjbG91ZHdhdGNoLlRyZWF0TWlzc2luZ0RhdGEuTk9UX0JSRUFDSElORyxcbiAgICB9KS5hZGRBbGFybUFjdGlvbihuZXcgY2RrLmF3c19jbG91ZHdhdGNoX2FjdGlvbnMuU25zQWN0aW9uKHRoaXMuYWxlcnRzVG9waWMpKVxuXG4gICAgLy8gSGlnaCBNZW1vcnkgVXNhZ2UgQWxhcm1cbiAgICBuZXcgY2xvdWR3YXRjaC5BbGFybSh0aGlzLCAnSGlnaE1lbW9yeUFsYXJtJywge1xuICAgICAgYWxhcm1OYW1lOiBgUmVhbFdvcmxkLSR7ZW52aXJvbm1lbnR9LUhpZ2hNZW1vcnlgLFxuICAgICAgYWxhcm1EZXNjcmlwdGlvbjogJ0hpZ2ggbWVtb3J5IHV0aWxpemF0aW9uIG9uIEVDUyBzZXJ2aWNlJyxcbiAgICAgIG1ldHJpYzogZWNzTWV0cmljcy5tZW1vcnlVdGlsaXphdGlvbixcbiAgICAgIHRocmVzaG9sZDogaXNQcm9kID8gODUgOiA5NSxcbiAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAyLFxuICAgICAgdHJlYXRNaXNzaW5nRGF0YTogY2xvdWR3YXRjaC5UcmVhdE1pc3NpbmdEYXRhLk5PVF9CUkVBQ0hJTkcsXG4gICAgfSkuYWRkQWxhcm1BY3Rpb24obmV3IGNkay5hd3NfY2xvdWR3YXRjaF9hY3Rpb25zLlNuc0FjdGlvbih0aGlzLmFsZXJ0c1RvcGljKSlcblxuICAgIC8vIERhdGFiYXNlIENQVSBBbGFybVxuICAgIG5ldyBjbG91ZHdhdGNoLkFsYXJtKHRoaXMsICdEYXRhYmFzZUhpZ2hDcHVBbGFybScsIHtcbiAgICAgIGFsYXJtTmFtZTogYFJlYWxXb3JsZC0ke2Vudmlyb25tZW50fS1EYXRhYmFzZUhpZ2hDUFVgLFxuICAgICAgYWxhcm1EZXNjcmlwdGlvbjogJ0hpZ2ggQ1BVIHV0aWxpemF0aW9uIG9uIFJEUyBpbnN0YW5jZScsXG4gICAgICBtZXRyaWM6IGRhdGFiYXNlTWV0cmljcy5jcHVVdGlsaXphdGlvbixcbiAgICAgIHRocmVzaG9sZDogaXNQcm9kID8gNzUgOiA4NSxcbiAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAzLFxuICAgICAgdHJlYXRNaXNzaW5nRGF0YTogY2xvdWR3YXRjaC5UcmVhdE1pc3NpbmdEYXRhLk5PVF9CUkVBQ0hJTkcsXG4gICAgfSkuYWRkQWxhcm1BY3Rpb24obmV3IGNkay5hd3NfY2xvdWR3YXRjaF9hY3Rpb25zLlNuc0FjdGlvbih0aGlzLmFsZXJ0c1RvcGljKSlcblxuICAgIC8vIEhpZ2ggRXJyb3IgUmF0ZSBBbGFybVxuICAgIG5ldyBjbG91ZHdhdGNoLkFsYXJtKHRoaXMsICdIaWdoRXJyb3JSYXRlQWxhcm0nLCB7XG4gICAgICBhbGFybU5hbWU6IGBSZWFsV29ybGQtJHtlbnZpcm9ubWVudH0tSGlnaEVycm9yUmF0ZWAsXG4gICAgICBhbGFybURlc2NyaXB0aW9uOiAnSGlnaCA1eHggZXJyb3IgcmF0ZSBmcm9tIGxvYWQgYmFsYW5jZXInLFxuICAgICAgbWV0cmljOiBhbGJNZXRyaWNzLmh0dHBFcnJvcnM1eHgsXG4gICAgICB0aHJlc2hvbGQ6IGlzUHJvZCA/IDEwIDogNTAsXG4gICAgICBldmFsdWF0aW9uUGVyaW9kczogMixcbiAgICAgIHRyZWF0TWlzc2luZ0RhdGE6IGNsb3Vkd2F0Y2guVHJlYXRNaXNzaW5nRGF0YS5OT1RfQlJFQUNISU5HLFxuICAgIH0pLmFkZEFsYXJtQWN0aW9uKG5ldyBjZGsuYXdzX2Nsb3Vkd2F0Y2hfYWN0aW9ucy5TbnNBY3Rpb24odGhpcy5hbGVydHNUb3BpYykpXG5cbiAgICAvLyBIaWdoIFJlc3BvbnNlIFRpbWUgQWxhcm1cbiAgICBuZXcgY2xvdWR3YXRjaC5BbGFybSh0aGlzLCAnSGlnaFJlc3BvbnNlVGltZUFsYXJtJywge1xuICAgICAgYWxhcm1OYW1lOiBgUmVhbFdvcmxkLSR7ZW52aXJvbm1lbnR9LUhpZ2hSZXNwb25zZVRpbWVgLFxuICAgICAgYWxhcm1EZXNjcmlwdGlvbjogJ0hpZ2ggcmVzcG9uc2UgdGltZSBmcm9tIHRhcmdldHMnLFxuICAgICAgbWV0cmljOiBhbGJNZXRyaWNzLnJlc3BvbnNlVGltZSxcbiAgICAgIHRocmVzaG9sZDogaXNQcm9kID8gMiA6IDUsIC8vIHNlY29uZHNcbiAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAzLFxuICAgICAgdHJlYXRNaXNzaW5nRGF0YTogY2xvdWR3YXRjaC5UcmVhdE1pc3NpbmdEYXRhLk5PVF9CUkVBQ0hJTkcsXG4gICAgfSkuYWRkQWxhcm1BY3Rpb24obmV3IGNkay5hd3NfY2xvdWR3YXRjaF9hY3Rpb25zLlNuc0FjdGlvbih0aGlzLmFsZXJ0c1RvcGljKSlcblxuICAgIC8vIERhdGFiYXNlIENvbm5lY3Rpb24gQWxhcm1cbiAgICBuZXcgY2xvdWR3YXRjaC5BbGFybSh0aGlzLCAnRGF0YWJhc2VDb25uZWN0aW9uc0FsYXJtJywge1xuICAgICAgYWxhcm1OYW1lOiBgUmVhbFdvcmxkLSR7ZW52aXJvbm1lbnR9LURhdGFiYXNlQ29ubmVjdGlvbnNgLFxuICAgICAgYWxhcm1EZXNjcmlwdGlvbjogJ0hpZ2ggbnVtYmVyIG9mIGRhdGFiYXNlIGNvbm5lY3Rpb25zJyxcbiAgICAgIG1ldHJpYzogZGF0YWJhc2VNZXRyaWNzLmNvbm5lY3Rpb25zLFxuICAgICAgdGhyZXNob2xkOiBpc1Byb2QgPyA4MCA6IDQwLFxuICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDIsXG4gICAgICB0cmVhdE1pc3NpbmdEYXRhOiBjbG91ZHdhdGNoLlRyZWF0TWlzc2luZ0RhdGEuTk9UX0JSRUFDSElORyxcbiAgICB9KS5hZGRBbGFybUFjdGlvbihuZXcgY2RrLmF3c19jbG91ZHdhdGNoX2FjdGlvbnMuU25zQWN0aW9uKHRoaXMuYWxlcnRzVG9waWMpKVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVDdXN0b21NZXRyaWNzKCkge1xuICAgIC8vIExvZyBncm91cHMgZm9yIGN1c3RvbSBtZXRyaWNzXG4gICAgY29uc3QgYXBwbGljYXRpb25Mb2dHcm91cCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsICdBcHBsaWNhdGlvbkxvZ0dyb3VwJywge1xuICAgICAgbG9nR3JvdXBOYW1lOiAnL2N1c3RvbS9yZWFsd29ybGQvYXBwbGljYXRpb24nLFxuICAgICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX01PTlRILFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KVxuXG4gICAgLy8gQ3VzdG9tIG1ldHJpYyBmaWx0ZXJzXG4gICAgbmV3IGxvZ3MuTWV0cmljRmlsdGVyKHRoaXMsICdFcnJvck1ldHJpY0ZpbHRlcicsIHtcbiAgICAgIGxvZ0dyb3VwOiBhcHBsaWNhdGlvbkxvZ0dyb3VwLFxuICAgICAgbWV0cmljTmFtZXNwYWNlOiAnUmVhbFdvcmxkL0FwcGxpY2F0aW9uJyxcbiAgICAgIG1ldHJpY05hbWU6ICdFcnJvckNvdW50JyxcbiAgICAgIGZpbHRlclBhdHRlcm46IGxvZ3MuRmlsdGVyUGF0dGVybi5saXRlcmFsKCdbdGltZXN0YW1wLCByZXF1ZXN0SWQsIGxldmVsPVwiRVJST1JcIiwgLi4uXScpLFxuICAgICAgbWV0cmljVmFsdWU6ICcxJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICB9KVxuXG4gICAgbmV3IGxvZ3MuTWV0cmljRmlsdGVyKHRoaXMsICdVc2VyTG9naW5NZXRyaWNGaWx0ZXInLCB7XG4gICAgICBsb2dHcm91cDogYXBwbGljYXRpb25Mb2dHcm91cCxcbiAgICAgIG1ldHJpY05hbWVzcGFjZTogJ1JlYWxXb3JsZC9BcHBsaWNhdGlvbicsXG4gICAgICBtZXRyaWNOYW1lOiAnVXNlckxvZ2lucycsXG4gICAgICBmaWx0ZXJQYXR0ZXJuOiBsb2dzLkZpbHRlclBhdHRlcm4ubGl0ZXJhbCgnW3RpbWVzdGFtcCwgcmVxdWVzdElkLCBsZXZlbCwgYWN0aW9uPVwiVVNFUl9MT0dJTlwiLCAuLi5dJyksXG4gICAgICBtZXRyaWNWYWx1ZTogJzEnLFxuICAgICAgZGVmYXVsdFZhbHVlOiAwLFxuICAgIH0pXG5cbiAgICBuZXcgbG9ncy5NZXRyaWNGaWx0ZXIodGhpcywgJ0FydGljbGVDcmVhdGVkTWV0cmljRmlsdGVyJywge1xuICAgICAgbG9nR3JvdXA6IGFwcGxpY2F0aW9uTG9nR3JvdXAsXG4gICAgICBtZXRyaWNOYW1lc3BhY2U6ICdSZWFsV29ybGQvQXBwbGljYXRpb24nLFxuICAgICAgbWV0cmljTmFtZTogJ0FydGljbGVzQ3JlYXRlZCcsXG4gICAgICBmaWx0ZXJQYXR0ZXJuOiBsb2dzLkZpbHRlclBhdHRlcm4ubGl0ZXJhbCgnW3RpbWVzdGFtcCwgcmVxdWVzdElkLCBsZXZlbCwgYWN0aW9uPVwiQVJUSUNMRV9DUkVBVEVEXCIsIC4uLl0nKSxcbiAgICAgIG1ldHJpY1ZhbHVlOiAnMScsXG4gICAgICBkZWZhdWx0VmFsdWU6IDAsXG4gICAgfSlcbiAgfVxufSJdfQ==