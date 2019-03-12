variable "project" {
  default = "Open Apparel Registry"
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

variable "fargate_cpu" {
  default = "256"
}

variable "fargate_memory" {
  default = "512"
}

variable "image_tag" {}

variable "app_port" {
  default = "8080"
}

variable "google_geocoding_api_key" {}

variable "rollbar_server_side_access_token" {}

variable "rollbar_client_side_access_token" {}

variable "django_secret_key" {}

variable "default_from_email" {}

variable "app_count" {
  default = "1"
}

variable "deployment_minimum_healthy_percent" {
  default = "100"
}

variable "deployment_maximum_percent" {
  default = "200"
}

variable "rds_allocated_storage" {
  default = "64"
}

variable "rds_engine_version" {
  default = "10.6"
}

variable "rds_parameter_group_family" {
  default = "postgres10"
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
  default = "oar-rds-snapshot"
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

variable "ec2_service_role_policy_arn" {
  default = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

variable "batch_service_role_policy_arn" {
  default = "arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole"
}

variable "spot_fleet_service_role_policy_arn" {
  default = "arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole"
}

variable "batch_default_ce_spot_fleet_bid_percentage" {
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
