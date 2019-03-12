provider "aws" {
  region  = "${var.aws_region}"
  version = "~> 1.56.0"
}

/**
* To use an ACM Certificate with Amazon CloudFront, you must 
* request or import the certificate in the US East (N. Virginia) region. 
* ACM Certificates in this region that are associated with a CloudFront 
* distribution are distributed to all the geographic locations configured 
* for that distribution.
*
* https://docs.aws.amazon.com/acm/latest/userguide/acm-regions.html
*/
provider "aws" {
  alias   = "certificates"
  region  = "us-east-1"
  version = "~> 1.56.0"
}

provider "template" {
  version = "~> 1.0.0"
}

terraform {
  backend "s3" {
    region  = "eu-west-1"
    encrypt = "true"
  }
}
