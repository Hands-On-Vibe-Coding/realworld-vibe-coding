# DNS Configuration for RealWorld Application using Route 53

# Variables for DNS configuration
variable "domain_name" {
  description = "The domain name for the application"
  type        = string
  default     = ""
}

variable "create_hosted_zone" {
  description = "Whether to create a new hosted zone"
  type        = bool
  default     = false
}

variable "existing_hosted_zone_id" {
  description = "ID of existing hosted zone (if not creating new one)"
  type        = string
  default     = ""
}

# Data source for existing hosted zone (if using existing)
data "aws_route53_zone" "existing" {
  count   = var.create_hosted_zone ? 0 : 1
  zone_id = var.existing_hosted_zone_id
}

# Create hosted zone (if requested)
resource "aws_route53_zone" "main" {
  count = var.create_hosted_zone ? 1 : 0
  name  = var.domain_name

  tags = {
    Name        = "${var.project_name}-hosted-zone"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Local value for hosted zone ID
locals {
  hosted_zone_id = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : var.existing_hosted_zone_id
}

# Data source for ALB
data "aws_lb" "main" {
  name = "${var.project_name}-alb"
}

# A record for main domain
resource "aws_route53_record" "main" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = local.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = data.aws_lb.main.dns_name
    zone_id                = data.aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# A record for www subdomain
resource "aws_route53_record" "www" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = local.hosted_zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = data.aws_lb.main.dns_name
    zone_id                = data.aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# API subdomain (optional)
resource "aws_route53_record" "api" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = local.hosted_zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = data.aws_lb.main.dns_name
    zone_id                = data.aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# Health check for main domain
resource "aws_route53_health_check" "main" {
  count                           = var.domain_name != "" ? 1 : 0
  fqdn                           = var.domain_name
  port                           = 443
  type                           = "HTTPS"
  resource_path                  = "/health"
  failure_threshold              = 3
  request_interval               = 30
  cloudwatch_logs_region         = var.aws_region
  cloudwatch_alarm_region        = var.aws_region
  insufficient_data_health_status = "Failure"

  tags = {
    Name        = "${var.project_name}-health-check"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch alarm for health check
resource "aws_cloudwatch_metric_alarm" "health_check" {
  count               = var.domain_name != "" ? 1 : 0
  alarm_name          = "${var.project_name}-health-check-failed"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = "60"
  statistic           = "Minimum"
  threshold           = "1"
  alarm_description   = "This metric monitors health check status"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    HealthCheckId = aws_route53_health_check.main[0].id
  }

  tags = {
    Name        = "${var.project_name}-health-check-alarm"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Output values
output "hosted_zone_id" {
  description = "The hosted zone ID"
  value       = local.hosted_zone_id
}

output "hosted_zone_name_servers" {
  description = "Name servers for the hosted zone"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].name_servers : []
}

output "domain_name" {
  description = "The configured domain name"
  value       = var.domain_name
}

output "health_check_id" {
  description = "The health check ID"
  value       = var.domain_name != "" ? aws_route53_health_check.main[0].id : ""
}