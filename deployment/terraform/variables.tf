locals {
  short = "${replace(var.project, " ", "")}${var.environment}"
}

variable "project" {
  default = "Open Supply Hub"
}

variable "short_project" {
  default = "osh"
}

variable "environment" {
  default = "Staging"
}

variable "aws_region" {
  default = "eu-west-1"
}

variable "aws_availability_zones" {
  default = ["eu-west-1a", "eu-west-1b"]
}

variable "aws_key_name" {}

variable "r53_private_hosted_zone" {}

variable "r53_public_hosted_zone" {}

variable "cloudfront_price_class" {}

variable "vpc_cidr_block" {
  default = "10.0.0.0/16"
}

variable "external_access_cidr_block" {}

variable "vpc_private_subnet_cidr_blocks" {
  default = ["10.0.1.0/24", "10.0.3.0/24"]
}

variable "vpc_public_subnet_cidr_blocks" {
  default = ["10.0.0.0/24", "10.0.2.0/24"]
}

variable "bastion_ami" {}

variable "bastion_instance_type" {}

variable "rds_allocated_storage" {
  default = "64"
}

variable "rds_engine_version" {
  default = "12.4"
}

variable "rds_parameter_group_family" {
  default = "postgres12"
}

variable "rds_instance_type" {
  default = "db.t3.micro"
}

variable "rds_storage_type" {
  default = "gp2"
}

variable "rds_database_identifier" {}

variable "rds_database_name" {}

variable "rds_database_username" {}

variable "rds_database_password" {}

variable "rds_backup_retention_period" {
  default = "30"
}

variable "rds_backup_window" {
  default = "04:00-04:30"
}

variable "rds_maintenance_window" {
  default = "sun:04:30-sun:05:30"
}

variable "rds_auto_minor_version_upgrade" {
  default = true
}

variable "rds_final_snapshot_identifier" {
  default = "osh-rds-snapshot"
}

variable "rds_monitoring_interval" {
  default = "60"
}

variable "rds_skip_final_snapshot" {
  default = false
}

variable "rds_copy_tags_to_snapshot" {
  default = true
}

variable "rds_multi_az" {
  default = false
}

variable "rds_storage_encrypted" {
  default = false
}

variable "rds_seq_page_cost" {
  default = "1"
}

variable "rds_random_page_cost" {
  default = "1"
}

variable "rds_log_min_duration_statement" {
  default = "500"
}

variable "rds_log_connections" {
  default = "0"
}

variable "rds_log_disconnections" {
  default = "0"
}

variable "rds_log_lock_waits" {
  default = "1"
}

variable "rds_log_temp_files" {
  default = "500"
}

variable "rds_log_autovacuum_min_duration" {
  default = "250"
}

variable "rds_cpu_threshold_percent" {
  default = "75"
}

variable "rds_disk_queue_threshold" {
  default = "10"
}

variable "rds_free_disk_threshold_bytes" {
  default = "5000000000"
}

variable "rds_free_memory_threshold_bytes" {
  default = "128000000"
}

variable "rds_cpu_credit_balance_threshold" {
  default = "30"
}

variable "rds_work_mem" {
  default = "20000"
}

variable "app_ecs_desired_count" {
  default = "1"
}

variable "app_ecs_deployment_min_percent" {
  default = "100"
}

variable "app_ecs_deployment_max_percent" {
  default = "200"
}

variable "app_ecs_grace_period_seconds" {
  default = "180"
}

variable "app_fargate_cpu" {
  default = "256"
}

variable "app_fargate_memory" {
  default = "512"
}

variable "cli_fargate_cpu" {
  default = "256"
}

variable "cli_fargate_memory" {
  default = "1024"
}

variable "image_tag" {}

variable "app_port" {
  default = "8080"
}

variable "gunicorn_worker_timeout" {
  default = "180"
}

variable "google_server_side_api_key" {}

variable "google_client_side_api_key" {}

variable "google_analytics_key" {
  default = ""
}

variable "rollbar_server_side_access_token" {}

variable "rollbar_client_side_access_token" {}

variable "django_secret_key" {}

variable "default_from_email" {}

variable "notification_email_to" {}

variable "mailchimp_api_key" {
    default = ""
}

variable "mailchimp_list_id" {
    default = ""
}

variable "batch_default_ce_spot_fleet_bid_percentage" {
  default = "40"
}

variable "batch_notifications_ce_spot_fleet_bid_percentage" {
  default = "40"
}

variable "batch_ami_id" {
  # Latest ECS-optimized Amazon Linux AMI in eu-west-1
  # See: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI.html
  default = "ami-00921cd1ce43d567a"
}

variable "batch_default_ce_min_vcpus" {
  default = "0"
}

variable "batch_default_ce_desired_vcpus" {
  default = "0"
}

variable "batch_default_ce_max_vcpus" {
  default = "16"
}

variable "batch_default_ce_instance_types" {
  type = "list"

  default = [
    "c5",
    "m5",
  ]
}


variable "batch_notifications_ce_min_vcpus" {
  default = "0"
}

variable "batch_notifications_ce_desired_vcpus" {
  default = "0"
}

variable "batch_notifications_ce_max_vcpus" {
  default = "16"
}

variable "batch_notifications_ce_instance_types" {
  type = "list"

  default = [
    "c5",
    "m5",
  ]
}


variable "app_cli_state_machine_timeout_seconds" {
  default = "600"
}

variable "check_api_limits_schedule_expression" {
  default = "rate(1 hour)"
}

variable "ec2_service_role_policy_arn" {
  default = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

variable "batch_service_role_policy_arn" {
  default = "arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole"
}

variable "spot_fleet_service_role_policy_arn" {
  default = "arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole"
}

variable "aws_lambda_service_role_policy_arn" {
  default = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

variable "oar_client_key" {}

variable "aws_cloudfront_canonical_user_id" {
  default = "c4c1ede66af53448b93c283ce9448c4ba468c9432aa01d700d3878632f77d2d0"
}
