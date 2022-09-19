#
# Security group resources
#
resource "aws_security_group" "memcached" {
  vpc_id = module.vpc.id

  tags = {
    Name        = "sgCacheCluster"
    Project     = var.project
    Environment = var.environment
  }
}

#
# Subnet group resources
#
resource "aws_elasticache_subnet_group" "memcached" {
  name        = var.ec_memcached_identifier
  description = "Private subnets for Memcached ElastiCache instances"
  subnet_ids  = module.vpc.private_subnet_ids
}

#
# Parameter group resources
#
resource "aws_elasticache_parameter_group" "memcached" {
  name        = var.ec_memcached_identifier
  description = "Parameter Group for ElastiCache Memcached"
  family      = var.ec_memcached_parameter_group_family

  parameter {
    name  = "max_item_size"
    value = var.ec_memcached_max_item_size
  }
}

#
# ElastiCache resources
#
resource "aws_elasticache_cluster" "memcached" {
  lifecycle {
    create_before_destroy = true
  }

  cluster_id = format(
    "%.16s-%.4s",
    lower(var.ec_memcached_identifier),
    md5(var.ec_memcached_instance_type),
    )
  engine                 = "memcached"
  engine_version         = var.ec_memcached_engine_version
  node_type              = var.ec_memcached_instance_type
  num_cache_nodes        = var.ec_memcached_desired_clusters
  az_mode                = var.ec_memcached_desired_clusters == 1 ? "single-az" : "cross-az"
  parameter_group_name   = aws_elasticache_parameter_group.memcached.name
  subnet_group_name      = aws_elasticache_subnet_group.memcached.name
  security_group_ids     = [aws_security_group.memcached.id]
  maintenance_window     = var.ec_memcached_maintenance_window
  notification_topic_arn = aws_sns_topic.global.arn
  port                   = var.ec_memcached_port

  tags = {
    Name        = "CacheCluster"
    Project     = var.project
    Environment = var.environment
  }
}

#
# CloudWatch resources
#
resource "aws_cloudwatch_metric_alarm" "cache_cpu" {
  alarm_name          = "alarm${local.short}MemcachedCacheClusterCPUUtilization"
  alarm_description   = "Memcached cluster CPU utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"

  threshold = var.ec_memcached_alarm_cpu_threshold_percent

  dimensions = {
    CacheClusterId = aws_elasticache_cluster.memcached.id
  }

  alarm_actions = [aws_sns_topic.global.arn]
}

resource "aws_cloudwatch_metric_alarm" "cache_memory" {
  alarm_name          = "alarm${local.short}MemcachedCacheClusterFreeableMemory"
  alarm_description   = "Memcached cluster freeable memory"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FreeableMemory"
  namespace           = "AWS/ElastiCache"
  period              = "60"
  statistic           = "Average"

  threshold = var.ec_memcached_alarm_memory_threshold_bytes

  dimensions = {
    CacheClusterId = aws_elasticache_cluster.memcached.id
  }

  alarm_actions = [aws_sns_topic.global.arn]
}
