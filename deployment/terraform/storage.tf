data "aws_canonical_user_id" "current" {
}

#
# S3 resources
#
resource "aws_s3_bucket" "logs" {
  bucket = "${lower(replace(var.project, " ", ""))}-${lower(var.environment)}-logs-${var.aws_region}"

  grant {
    type        = "CanonicalUser"
    permissions = ["FULL_CONTROL"]
    id          = data.aws_canonical_user_id.current.id
  }

  grant {
    type        = "CanonicalUser"
    permissions = ["FULL_CONTROL"]
    id          = var.aws_cloudfront_canonical_user_id
  }

  tags = {
    Name        = "${lower(replace(var.project, " ", ""))}-${lower(var.environment)}-logs-${var.aws_region}"
    Project     = var.project
    Environment = var.environment
  }
}

#
# ECR resources
#
module "ecr_repository_app" {
  source = "github.com/azavea/terraform-aws-ecr-repository?ref=0.1.0"

  repository_name = lower(replace(var.project, " ", ""))

  attach_lifecycle_policy = true
}

module "ecr_repository_batch" {
  source = "github.com/azavea/terraform-aws-ecr-repository?ref=0.1.0"

  repository_name = "${lower(replace(var.project, " ", ""))}-batch"

  attach_lifecycle_policy = true
}

