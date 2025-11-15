# RDS Read Replica Auto Scaling Configuration

# Create read replicas based on load
resource "aws_db_instance" "read_replica" {
  count = var.read_replica_count

  identifier             = "${var.db_instance_identifier}-replica-${count.index + 1}"
  replicate_source_db    = aws_db_instance.main.identifier
  instance_class         = var.replica_instance_class
  publicly_accessible    = false
  skip_final_snapshot    = true
  
  # Performance Insights
  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  
  # Monitoring
  monitoring_interval = 60
  monitoring_role_arn = var.monitoring_role_arn
  
  # Auto minor version upgrade
  auto_minor_version_upgrade = true
  
  tags = {
    Name        = "${var.environment}-solosuccess-db-replica-${count.index + 1}"
    Environment = var.environment
    Type        = "read-replica"
  }
}

# CloudWatch Alarms for Read Replica
resource "aws_cloudwatch_metric_alarm" "replica_cpu_high" {
  count = var.read_replica_count

  alarm_name          = "${var.db_instance_identifier}-replica-${count.index + 1}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS read replica CPU utilization"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.read_replica[count.index].identifier
  }
}

resource "aws_cloudwatch_metric_alarm" "replica_lag_high" {
  count = var.read_replica_count

  alarm_name          = "${var.db_instance_identifier}-replica-${count.index + 1}-lag-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ReplicaLag"
  namespace           = "AWS/RDS"
  period              = "60"
  statistic           = "Average"
  threshold           = "1000"  # 1 second in milliseconds
  alarm_description   = "This metric monitors RDS read replica lag"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.read_replica[count.index].identifier
  }
}

# Lambda function for dynamic read replica scaling
resource "aws_lambda_function" "rds_autoscaler" {
  filename      = "${path.module}/lambda/rds-autoscaler.zip"
  function_name = "${var.environment}-rds-autoscaler"
  role          = aws_iam_role.lambda_rds_autoscaler.arn
  handler       = "index.handler"
  runtime       = "python3.11"
  timeout       = 300

  environment {
    variables = {
      DB_INSTANCE_ID     = aws_db_instance.main.identifier
      MIN_REPLICAS       = var.min_read_replicas
      MAX_REPLICAS       = var.max_read_replicas
      CPU_THRESHOLD      = "70"
      CONNECTIONS_THRESHOLD = "80"
    }
  }

  tags = {
    Name        = "${var.environment}-rds-autoscaler"
    Environment = var.environment
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_rds_autoscaler" {
  name = "${var.environment}-lambda-rds-autoscaler"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "lambda_rds_autoscaler" {
  name = "${var.environment}-lambda-rds-autoscaler-policy"
  role = aws_iam_role.lambda_rds_autoscaler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBInstances",
          "rds:CreateDBInstanceReadReplica",
          "rds:DeleteDBInstance",
          "rds:ModifyDBInstance",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:PutMetricData",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# CloudWatch Event Rule to trigger Lambda
resource "aws_cloudwatch_event_rule" "rds_autoscaler_schedule" {
  name                = "${var.environment}-rds-autoscaler-schedule"
  description         = "Trigger RDS autoscaler every 5 minutes"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "rds_autoscaler" {
  rule      = aws_cloudwatch_event_rule.rds_autoscaler_schedule.name
  target_id = "RDSAutoscaler"
  arn       = aws_lambda_function.rds_autoscaler.arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rds_autoscaler.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.rds_autoscaler_schedule.arn
}

# Variables
variable "read_replica_count" {
  description = "Number of read replicas to create"
  type        = number
  default     = 1
}

variable "replica_instance_class" {
  description = "Instance class for read replicas"
  type        = string
  default     = "db.t3.medium"
}

variable "min_read_replicas" {
  description = "Minimum number of read replicas"
  type        = number
  default     = 1
}

variable "max_read_replicas" {
  description = "Maximum number of read replicas"
  type        = number
  default     = 5
}

variable "monitoring_role_arn" {
  description = "IAM role ARN for enhanced monitoring"
  type        = string
}

variable "sns_topic_arn" {
  description = "SNS topic ARN for alarms"
  type        = string
}

# Outputs
output "read_replica_endpoints" {
  value = aws_db_instance.read_replica[*].endpoint
}

output "autoscaler_function_arn" {
  value = aws_lambda_function.rds_autoscaler.arn
}
