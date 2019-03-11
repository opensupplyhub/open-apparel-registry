provider "aws" {
  region  = "${var.aws_region}"
  version = "~> 1.56.0"
}

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
