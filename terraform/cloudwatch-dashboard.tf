# CloudWatch Dashboard Configuration for RealWorld Application

# Main application dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # Application Overview Section
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# ${var.project_name} Application Dashboard\n\nOverview of application health, performance, and infrastructure metrics."
        }
      },

      # ECS Service Health
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "${var.project_name}-backend", "ClusterName", "${var.project_name}-cluster"],
            [".", "MemoryUtilization", ".", ".", ".", "."],
            [".", "CPUUtilization", "ServiceName", "${var.project_name}-frontend", "ClusterName", "${var.project_name}-cluster"],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "ECS Service Resource Utilization"
          period  = 300
          yAxis = {
            left = {
              min = 0
              max = 100
            }
          }
        }
      },

      # ALB Metrics
      {
        type   = "metric"
        x      = 12
        y      = 1
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix],
            [".", "TargetResponseTime", ".", "."],
            [".", "HTTPCode_Target_2XX_Count", ".", "."],
            [".", "HTTPCode_Target_4XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "Application Load Balancer Metrics"
          period = 300
        }
      },

      # RDS Database Metrics (if using RDS)
      {
        type   = "metric"
        x      = 0
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "${var.project_name}-db"],
            [".", "DatabaseConnections", ".", "."],
            [".", "ReadLatency", ".", "."],
            [".", "WriteLatency", ".", "."]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "Database Performance"
          period = 300
        }
      },

      # Custom Application Metrics
      {
        type   = "metric"
        x      = 12
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["${var.project_name}", "UserRegistrations", { "stat": "Sum" }],
            [".", "ArticleCreations", { "stat": "Sum" }],
            [".", "UserLogins", { "stat": "Sum" }],
            [".", "APIErrors", { "stat": "Sum" }]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "Application Business Metrics"
          period = 300
        }
      },

      # Error Rate and Latency
      {
        type   = "metric"
        x      = 0
        y      = 13
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix],
            [{ "expression": "m2/(m1+m2+m3)*100", "label": "4XX Error Rate", "id": "e1" }],
            [{ "expression": "m3/(m1+m2+m3)*100", "label": "5XX Error Rate", "id": "e2" }],
            ["AWS/ApplicationELB", "HTTPCode_Target_2XX_Count", "LoadBalancer", aws_lb.main.arn_suffix, { "id": "m1", "visible": false }],
            [".", "HTTPCode_Target_4XX_Count", ".", ".", { "id": "m2", "visible": false }],
            [".", "HTTPCode_Target_5XX_Count", ".", ".", { "id": "m3", "visible": false }]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "Response Time and Error Rates"
          period = 300
          yAxis = {
            left = {
              min = 0
            }
            right = {
              min = 0
              max = 100
            }
          }
        }
      },

      # Infrastructure Costs
      {
        type   = "metric"
        x      = 12
        y      = 13
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Billing", "EstimatedCharges", "Currency", "USD", "ServiceName", "AmazonECS"],
            [".", ".", ".", ".", ".", "AmazonRDS"],
            [".", ".", ".", ".", ".", "AmazonEC2"],
            [".", ".", ".", ".", ".", "AmazonS3"]
          ]
          view   = "timeSeries"
          region = "us-east-1"  # Billing metrics are only available in us-east-1
          title  = "Estimated AWS Costs"
          period = 86400  # Daily
        }
      },

      # Log Insights Queries
      {
        type   = "log"
        x      = 0
        y      = 19
        width  = 24
        height = 6
        properties = {
          query   = "SOURCE '/aws/ecs/${var.project_name}-backend'\n| fields @timestamp, @message\n| filter @message like /ERROR/\n| sort @timestamp desc\n| limit 20"
          region  = var.aws_region
          title   = "Recent Error Logs"
          view    = "table"
        }
      }
    ]
  })
}

# Performance Dashboard
resource "aws_cloudwatch_dashboard" "performance" {
  dashboard_name = "${var.project_name}-performance"

  dashboard_body = jsonencode({
    widgets = [
      # Performance Overview
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# ${var.project_name} Performance Dashboard\n\nDetailed performance metrics and SLA monitoring."
        }
      },

      # API Endpoint Performance
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["${var.project_name}", "APIResponseTime", "Endpoint", "/api/articles", { "stat": "Average" }],
            [".", ".", ".", "/api/users", { "stat": "Average" }],
            [".", ".", ".", "/api/profiles", { "stat": "Average" }],
            [".", ".", ".", "/api/tags", { "stat": "Average" }]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "API Endpoint Response Times"
          period = 300
          yAxis = {
            left = {
              min = 0
            }
          }
        }
      },

      # Throughput Metrics
      {
        type   = "metric"
        x      = 12
        y      = 1
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["${var.project_name}", "RequestsPerSecond", "Service", "backend"],
            [".", ".", ".", "frontend"],
            ["AWS/ApplicationELB", "NewConnectionCount", "LoadBalancer", aws_lb.main.arn_suffix]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "Request Throughput"
          period = 300
        }
      },

      # Database Performance Deep Dive
      {
        type   = "metric"
        x      = 0
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "ReadIOPS", "DBInstanceIdentifier", "${var.project_name}-db"],
            [".", "WriteIOPS", ".", "."],
            [".", "ReadThroughput", ".", "."],
            [".", "WriteThroughput", ".", "."]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "Database I/O Performance"
          period = 300
        }
      },

      # Memory and CPU Deep Dive
      {
        type   = "metric"
        x      = 12
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "${var.project_name}-backend", "ClusterName", "${var.project_name}-cluster", { "stat": "Average" }],
            [".", ".", ".", ".", ".", ".", { "stat": "Maximum" }],
            [".", "MemoryUtilization", ".", ".", ".", ".", { "stat": "Average" }],
            [".", ".", ".", ".", ".", ".", { "stat": "Maximum" }]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "Resource Utilization Details"
          period = 300
        }
      },

      # SLA Performance Indicators
      {
        type   = "metric"
        x      = 0
        y      = 13
        width  = 24
        height = 6
        properties = {
          metrics = [
            [{ "expression": "(m1/(m1+m2+m3))*100", "label": "Availability %", "id": "e1" }],
            [{ "expression": "m4", "label": "Average Response Time (ms)", "id": "e2" }],
            [{ "expression": "m5", "label": "P99 Response Time (ms)", "id": "e3" }],
            ["AWS/ApplicationELB", "HTTPCode_Target_2XX_Count", "LoadBalancer", aws_lb.main.arn_suffix, { "id": "m1", "visible": false }],
            [".", "HTTPCode_Target_4XX_Count", ".", ".", { "id": "m2", "visible": false }],
            [".", "HTTPCode_Target_5XX_Count", ".", ".", { "id": "m3", "visible": false }],
            [".", "TargetResponseTime", ".", ".", { "id": "m4", "visible": false, "stat": "Average" }],
            [".", ".", ".", ".", { "id": "m5", "visible": false, "stat": "p99" }]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "SLA Metrics (99.9% Availability Target, <2s Response Time)"
          period = 300
          annotations = {
            horizontal = [
              {
                label = "99.9% Availability Target"
                value = 99.9
              },
              {
                label = "2s Response Time Target"
                value = 2000
              }
            ]
          }
        }
      }
    ]
  })
}

# Security Dashboard
resource "aws_cloudwatch_dashboard" "security" {
  dashboard_name = "${var.project_name}-security"

  dashboard_body = jsonencode({
    widgets = [
      # Security Overview
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# ${var.project_name} Security Dashboard\n\nSecurity events, threats, and compliance monitoring."
        }
      },

      # WAF Metrics
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/WAFV2", "AllowedRequests", "WebACL", "${var.project_name}-waf", "Region", var.aws_region, "Rule", "ALL"],
            [".", "BlockedRequests", ".", ".", ".", ".", ".", "."],
            [".", "CountedRequests", ".", ".", ".", ".", ".", "."]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "WAF Request Filtering"
          period = 300
        }
      },

      # Failed Authentication Attempts
      {
        type   = "metric"
        x      = 12
        y      = 1
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["${var.project_name}", "FailedLogins", { "stat": "Sum" }],
            [".", "SuccessfulLogins", { "stat": "Sum" }],
            [".", "PasswordResetRequests", { "stat": "Sum" }]
          ]
          view   = "timeSeries"
          region = var.aws_region
          title  = "Authentication Events"
          period = 300
        }
      },

      # SSL Certificate Status
      {
        type   = "metric"
        x      = 0
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/CertificateManager", "DaysToExpiry", "CertificateArn", aws_acm_certificate.main[0].arn]
          ]
          view   = "singleValue"
          region = var.aws_region
          title  = "SSL Certificate Days to Expiry"
          period = 86400
        }
      },

      # Security Group Changes (CloudTrail)
      {
        type   = "log"
        x      = 12
        y      = 7
        width  = 12
        height = 6
        properties = {
          query   = "SOURCE '/aws/cloudtrail/security-events'\n| fields @timestamp, sourceIPAddress, userIdentity.type, eventName\n| filter eventName like /SecurityGroup/\n| sort @timestamp desc\n| limit 10"
          region  = var.aws_region
          title   = "Recent Security Group Changes"
          view    = "table"
        }
      }
    ]
  })
}

# Output dashboard URLs
output "main_dashboard_url" {
  description = "URL to the main CloudWatch dashboard"
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${var.project_name}-dashboard"
}

output "performance_dashboard_url" {
  description = "URL to the performance CloudWatch dashboard"
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${var.project_name}-performance"
}

output "security_dashboard_url" {
  description = "URL to the security CloudWatch dashboard"
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${var.project_name}-security"
}