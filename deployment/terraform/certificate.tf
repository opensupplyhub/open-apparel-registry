#
# ACM resources
#
module "cert" {
  source = "github.com/azavea/terraform-aws-acm-certificate?ref=0.1.0"

  domain_name               = "${var.r53_public_hosted_zone}"
  subject_alternative_names = ["*.${var.r53_public_hosted_zone}"]
  hosted_zone_id            = "${aws_route53_zone.external.zone_id}"
  validation_record_ttl     = "60"
}
