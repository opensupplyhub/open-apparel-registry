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


resource "aws_s3_bucket" "files" {
  bucket = lower("${var.project}-${var.environment}-files-${var.aws_region}")
  acl    = "private"

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = {
    Name        = lower("${var.project}-${var.environment}-files-${var.aws_region}")
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "files" {
  bucket = aws_s3_bucket.files.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

#
# ECR resources
#
module "ecr_repository_app" {
  source = "github.com/azavea/terraform-aws-ecr-repository?ref=1.0.0"

  repository_name = lower(replace(var.project, " ", ""))

  attach_lifecycle_policy = true
}

module "ecr_repository_batch" {
  source = "github.com/azavea/terraform-aws-ecr-repository?ref=1.0.0"

  repository_name = "${lower(replace(var.project, " ", ""))}-batch"

  attach_lifecycle_policy = true
}
