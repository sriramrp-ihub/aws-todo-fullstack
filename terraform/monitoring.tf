resource "aws_sns_topic" "alerts" {
  name = "todoapp-alerts"

  tags = {
    Name        = "todoapp-alerts"
    Environment = "production"
  }
}

resource "aws_sns_topic_subscription" "email_alerts" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "amannov21@gmail.com"
}

resource "aws_cloudwatch_metric_alarm" "backend_high_cpu" {
  alarm_name        = "todoapp-backend-high-cpu"
  alarm_description = "Backend CPU usage is above 80%"


  namespace   = "AWS/ECS"        # ECS service metrics
  metric_name = "CPUUtilization" # CPU percentage
  dimensions = {
    ServiceName = aws_ecs_service.backend.name
    ClusterName = aws_ecs_cluster.main.name
  }

  # When to trigger
  comparison_operator = "GreaterThanThreshold"
  threshold           = 80        # 80%
  evaluation_periods  = 2         # Check 2 times
  period              = 300       # Each check is 5 minutes
  statistic           = "Average" # Use average CPU over period


  alarm_actions = [aws_sns_topic.alerts.arn]


  treat_missing_data = "notBreaching" # Don't alarm if no data
}



resource "aws_cloudwatch_metric_alarm" "backend_high_memory" {
  alarm_name        = "todoapp-backend-high-memory"
  alarm_description = "Backend memory usage is above 80%"

  namespace   = "AWS/ECS"
  metric_name = "MemoryUtilization"
  dimensions = {
    ServiceName = aws_ecs_service.backend.name
    ClusterName = aws_ecs_cluster.main.name
  }

  comparison_operator = "GreaterThanThreshold"
  threshold           = 80
  evaluation_periods  = 2
  period              = 300
  statistic           = "Average"

  alarm_actions      = [aws_sns_topic.alerts.arn]
  treat_missing_data = "notBreaching"
}

resource "aws_cloudwatch_metric_alarm" "unhealthy_backend_targets" {
  alarm_name        = "todoapp-unhealthy-backend-targets"
  alarm_description = "Backend targets are failing health checks"

  namespace   = "AWS/ApplicationELB"
  metric_name = "UnHealthyHostCount"
  dimensions = {
    TargetGroup  = aws_lb_target_group.backend.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  comparison_operator = "GreaterThanThreshold"
  threshold           = 0         # Any unhealthy target
  evaluation_periods  = 1         # Check once (fast)
  period              = 60        # Every 1 minute
  statistic           = "Maximum" # Worst case

  alarm_actions      = [aws_sns_topic.alerts.arn]
  treat_missing_data = "notBreaching"
}




resource "aws_cloudwatch_metric_alarm" "backend_5xx_errors" {
  alarm_name        = "todoapp-backend-5xx-errors"
  alarm_description = "Backend is returning too many 5xx errors"

  namespace   = "AWS/ApplicationELB"
  metric_name = "HTTPCode_Target_5XX_Count"
  dimensions = {
    TargetGroup  = aws_lb_target_group.backend.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  comparison_operator = "GreaterThanThreshold"
  threshold           = 10 # More than 10 errors
  evaluation_periods  = 1
  period              = 300   # In 5 minutes
  statistic           = "Sum" # Total count

  alarm_actions      = [aws_sns_topic.alerts.arn]
  treat_missing_data = "notBreaching"
}

