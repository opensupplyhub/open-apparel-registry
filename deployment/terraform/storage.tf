data "aws_canonical_user_id" "current" {}

#
# S3 resources
#
resource "aws_s3_bucket" "logs" {
  bucket = "${lower(replace(var.project, " ", ""))}-${lower(var.environment)}-logs-${var.aws_region}"

  grant {
    type        = "CanonicalUser"
    permissions = ["FULL_CONTROL"]
    id          = "${data.aws_canonical_user_id.current.id}"
  }

  grant {
    type        = "CanonicalUser"
    permissions = ["FULL_CONTROL"]
    id          = "${var.aws_cloudfront_canonical_user_id}"
  }

  tags {
    Name        = "${lower(replace(var.project, " ", ""))}-${lower(var.environment)}-logs-${var.aws_region}"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}
