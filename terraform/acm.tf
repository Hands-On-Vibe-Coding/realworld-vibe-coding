# ACM SSL Certificate Configuration for RealWorld Application

# Request SSL certificate from ACM
resource "aws_acm_certificate" "main" {
  count           = var.domain_name != "" ? 1 : 0
  domain_name     = var.domain_name
  subject_alternative_names = [
    "www.${var.domain_name}",
    "api.${var.domain_name}"
  ]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-ssl-certificate"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Create Route 53 records for certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = var.domain_name != "" ? {
    for dvo in aws_acm_certificate.main[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.hosted_zone_id
}

# Validate the certificate
resource "aws_acm_certificate_validation" "main" {
  count           = var.domain_name != "" ? 1 : 0
  certificate_arn = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [
    for record in aws_route53_record.cert_validation : record.fqdn
  ]

  timeouts {
    create = "5m"
  }
}

# CloudWatch alarm for certificate expiration
resource "aws_cloudwatch_metric_alarm" "certificate_expiration" {
  count               = var.domain_name != "" ? 1 : 0
  alarm_name          = "${var.project_name}-ssl-certificate-expiration"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "DaysToExpiry"
  namespace           = "AWS/CertificateManager"
  period              = "86400"  # 24 hours
  statistic           = "Minimum"
  threshold           = "30"     # Alert 30 days before expiration
  alarm_description   = "SSL certificate will expire in less than 30 days"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "breaching"

  dimensions = {
    CertificateArn = aws_acm_certificate.main[0].arn
  }

  tags = {
    Name        = "${var.project_name}-ssl-expiration-alarm"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Output the certificate ARN
output "certificate_arn" {
  description = "The ARN of the SSL certificate"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].arn : ""
}

output "certificate_status" {
  description = "The status of the SSL certificate"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].status : ""
}

output "certificate_domain_validation_options" {
  description = "Domain validation options for the certificate"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].domain_validation_options : []
}