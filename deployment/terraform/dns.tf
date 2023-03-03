#
# Private DNS resources
#
resource "aws_route53_zone" "internal" {
  name = "${var.r53_private_hosted_zone}"

  vpc {
    vpc_id     = "${module.vpc.id}"
    vpc_region = "${var.aws_region}"
  }

  tags {
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

#
# Public DNS resources
#
resource "aws_route53_zone" "external" {
  name = "${var.r53_public_hosted_zone}"
}

resource "aws_route53_record" "www" {
  zone_id = "${aws_route53_zone.external.zone_id}"
  name    = "${var.r53_public_hosted_zone}"
  type    = "A"

  alias {
    name                   = "${aws_cloudfront_distribution.cdn.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.cdn.hosted_zone_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_ipv6" {
  zone_id = "${aws_route53_zone.external.zone_id}"
  name    = "${var.r53_public_hosted_zone}"
  type    = "AAAA"

  alias {
    name                   = "${aws_cloudfront_distribution.cdn.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.cdn.hosted_zone_id}"
    evaluate_target_health = false
  }
}
