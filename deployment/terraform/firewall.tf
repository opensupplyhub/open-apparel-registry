# allow all inbound traffic to the bastion on port 22
resource "aws_security_group_rule" "bastion_ingress_ssh" {
  type        = "ingress"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["${var.external_access_cidr_block}"]

  security_group_id = "${module.vpc.bastion_security_group_id}"
}

# allow all outbound traffic from the bastion to the rds instance
resource "aws_security_group_rule" "bastion_egress_rds" {
  type      = "egress"
  from_port = "${module.database.port}"
  to_port   = "${module.database.port}"
  protocol  = "tcp"

  security_group_id        = "${module.vpc.bastion_security_group_id}"
  source_security_group_id = "${module.database.database_security_group_id}"
}

# allow all inbound traffic from the bastion to the rds instance
resource "aws_security_group_rule" "rds_bastion_ingress" {
  type      = "ingress"
  from_port = "${module.database.port}"
  to_port   = "${module.database.port}"
  protocol  = "tcp"

  security_group_id        = "${module.database.database_security_group_id}"
  source_security_group_id = "${module.vpc.bastion_security_group_id}"
}

# allow all inbound traffic to the load balancer on port 443
resource "aws_security_group_rule" "app_alb_ingress_https" {
  type             = "ingress"
  from_port        = 443
  to_port          = 443
  protocol         = "tcp"
  cidr_blocks      = ["0.0.0.0/0"]
  ipv6_cidr_blocks = ["::/0"]

  security_group_id = "${aws_security_group.alb.id}"
}

# allow outbound traffic from the alb to the app on the app port
resource "aws_security_group_rule" "app_alb_egress_all" {
  type      = "egress"
  from_port = "${var.app_port}"
  to_port   = "${var.app_port}"
  protocol  = "tcp"

  security_group_id        = "${aws_security_group.alb.id}"
  source_security_group_id = "${aws_security_group.app.id}"
}

# allow inbound traffic from the alb to the app on the app port
resource "aws_security_group_rule" "app_ingress_alb" {
  type      = "ingress"
  from_port = "${var.app_port}"
  to_port   = "${var.app_port}"
  protocol  = "tcp"

  security_group_id        = "${aws_security_group.app.id}"
  source_security_group_id = "${aws_security_group.alb.id}"
}

# allow all outbound traffic from the app to the rds instance
resource "aws_security_group_rule" "app_egress_rds" {
  type      = "egress"
  from_port = "${module.database.port}"
  to_port   = "${module.database.port}"
  protocol  = "tcp"

  security_group_id        = "${aws_security_group.app.id}"
  source_security_group_id = "${module.database.database_security_group_id}"
}

# allow all inbound traffic from the app to the rds instance
resource "aws_security_group_rule" "rds_app_ingress" {
  type      = "ingress"
  from_port = "${module.database.port}"
  to_port   = "${module.database.port}"
  protocol  = "tcp"

  security_group_id        = "${module.database.database_security_group_id}"
  source_security_group_id = "${aws_security_group.app.id}"
}

# allow all outbound traffic from the app on port 443
resource "aws_security_group_rule" "app_egress_https" {
  type             = "egress"
  from_port        = 443
  to_port          = 443
  protocol         = "tcp"
  cidr_blocks      = ["0.0.0.0/0"]
  ipv6_cidr_blocks = ["::/0"]

  security_group_id = "${aws_security_group.app.id}"
}
