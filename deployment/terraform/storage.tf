resource "aws_s3_bucket" "logs" {
  bucket = "${lower(var.project)}-${lower(var.environment)}-logs-${var.aws_region}"
  acl    = "private"

  tags {
    Name        = "${lower(var.project)}-${lower(var.environment)}-logs-${var.aws_region}"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

module "ecr-repository" {
  source = "github.com/azavea/terraform-aws-ecr-repository?ref=0.1.0"

  repository_name = "${lower(var.project)}"

  attach_lifecycle_policy = true
}
