resource "aws_s3_bucket" "logs" {
  bucket = "${lower(replace(var.project, " ", ""))}-${lower(var.environment)}-logs-${var.aws_region}"
  acl    = "private"

  tags {
    Name        = "${lower(replace(var.project, " ", ""))}-${lower(var.environment)}-logs-${var.aws_region}"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

module "ecr_repository_app" {
  source = "github.com/azavea/terraform-aws-ecr-repository?ref=0.1.0"

  repository_name = "${lower(replace(var.project, " ", ""))}-app"

  attach_lifecycle_policy = true
}

module "ecr_repository_batch" {
  source = "github.com/azavea/terraform-aws-ecr-repository?ref=0.1.0"

  repository_name = "${lower(replace(var.project, " ", ""))}-batch"

  attach_lifecycle_policy = true
}
