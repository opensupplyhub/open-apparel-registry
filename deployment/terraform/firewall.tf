#
# Bastion security group resources
#
resource "aws_security_group_rule" "bastion_ingress_ssh" {
  type        = "ingress"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["${var.external_access_cidr_block}"]

  security_group_id = "${module.vpc.bastion_security_group_id}"
}

resource "aws_security_group_rule" "bastion_egress_rds" {
  type      = "egress"
  from_port = "${module.database.port}"
  to_port   = "${module.database.port}"
  protocol  = "tcp"

  security_group_id        = "${module.vpc.bastion_security_group_id}"
  source_security_group_id = "${module.database.database_security_group_id}"
}

resource "aws_security_group_rule" "bastion_egress_app" {
  type      = "egress"
  from_port = "${var.app_port}"
  to_port   = "${var.app_port}"
  protocol  = "tcp"

  security_group_id        = "${module.vpc.bastion_security_group_id}"
  source_security_group_id = "${aws_security_group.app.id}"
}

resource "aws_security_group_rule" "bastion_egress_http" {
  type             = "egress"
  from_port        = "80"
  to_port          = "80"
  protocol         = "tcp"
  cidr_blocks      = ["0.0.0.0/0"]
  ipv6_cidr_blocks = ["::/0"]

  security_group_id = "${module.vpc.bastion_security_group_id}"
}

resource "aws_security_group_rule" "bastion_egress_https" {
  type             = "egress"
  from_port        = "443"
  to_port          = "443"
  protocol         = "tcp"
  cidr_blocks      = ["0.0.0.0/0"]
  ipv6_cidr_blocks = ["::/0"]

  security_group_id = "${module.vpc.bastion_security_group_id}"
}

#
# App ALB security group resources
#
resource "aws_security_group_rule" "alb_ingress_https" {
  type             = "ingress"
  from_port        = 443
  to_port          = 443
  protocol         = "tcp"
  cidr_blocks      = ["0.0.0.0/0"]
  ipv6_cidr_blocks = ["::/0"]

  security_group_id = "${aws_security_group.alb.id}"
}

resource "aws_security_group_rule" "alb_egress_app" {
  type      = "egress"
  from_port = "${var.app_port}"
  to_port   = "${var.app_port}"
  protocol  = "tcp"

  security_group_id        = "${aws_security_group.alb.id}"
  source_security_group_id = "${aws_security_group.app.id}"
}

#
# RDS security group resources
#
resource "aws_security_group_rule" "rds_ingress_app" {
  type      = "ingress"
  from_port = "${module.database.port}"
  to_port   = "${module.database.port}"
  protocol  = "tcp"

  security_group_id        = "${module.database.database_security_group_id}"
  source_security_group_id = "${aws_security_group.app.id}"
}

resource "aws_security_group_rule" "rds_ingress_bastion" {
  type      = "ingress"
  from_port = "${module.database.port}"
  to_port   = "${module.database.port}"
  protocol  = "tcp"

  security_group_id        = "${module.database.database_security_group_id}"
  source_security_group_id = "${module.vpc.bastion_security_group_id}"
}

#
# Container instance security group resources
#
resource "aws_security_group_rule" "app_egress_https" {
  type             = "egress"
  from_port        = 443
  to_port          = 443
  protocol         = "tcp"
  cidr_blocks      = ["0.0.0.0/0"]
  ipv6_cidr_blocks = ["::/0"]

  security_group_id = "${aws_security_group.app.id}"
}

resource "aws_security_group_rule" "app_egress_rds" {
  type      = "egress"
  from_port = "${module.database.port}"
  to_port   = "${module.database.port}"
  protocol  = "tcp"

  security_group_id        = "${aws_security_group.app.id}"
  source_security_group_id = "${module.database.database_security_group_id}"
}

resource "aws_security_group_rule" "app_ingress_alb" {
  type      = "ingress"
  from_port = "${var.app_port}"
  to_port   = "${var.app_port}"
  protocol  = "tcp"

  security_group_id        = "${aws_security_group.app.id}"
  source_security_group_id = "${aws_security_group.alb.id}"
}

resource "aws_security_group_rule" "app_ingress_bastion" {
  type      = "ingress"
  from_port = "${var.app_port}"
  to_port   = "${var.app_port}"
  protocol  = "tcp"

  security_group_id        = "${aws_security_group.app.id}"
  source_security_group_id = "${module.vpc.bastion_security_group_id}"
}
