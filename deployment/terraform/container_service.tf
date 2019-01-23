locals {
  app_image = "${module.ecr-repository.repository_url}:${var.image_tag}"
}

#
# Security Group Resources
#
resource "aws_security_group" "alb" {
  vpc_id = "${module.vpc.id}"

  tags {
    Name        = "sgLoadBalancer${title(var.project)}${title(var.environment)}"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_security_group" "ecs_cluster" {
  vpc_id = "${module.vpc.id}"

  tags {
    Name        = "sgEcsCluster${title(var.project)}${title(var.environment)}"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

#
# ALB Resources
#
resource "aws_lb" "oar" {
  name            = "alb${title(var.project)}${title(var.environment)}"
  security_groups = ["${aws_security_group.alb.id}"]
  subnets         = ["${module.vpc.public_subnet_ids}"]

  tags {
    Name        = "alb${title(var.project)}${title(var.environment)}"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_lb_target_group" "oar" {
  name = "tg${title(var.project)}${title(var.environment)}"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    matcher             = "200"
    protocol            = "HTTP"
    timeout             = "3"
    path                = "/health-check/"
    unhealthy_threshold = "2"
  }

  port     = "80"
  protocol = "HTTP"
  vpc_id   = "${module.vpc.id}"

  target_type = "ip"

  tags {
    Name        = "tg${title(var.project)}${title(var.environment)}"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_lb_listener" "oar" {
  load_balancer_arn = "${aws_lb.oar.id}"
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = "${module.cert.arn}"

  default_action {
    target_group_arn = "${aws_lb_target_group.oar.id}"
    type             = "forward"
  }
}

#
# ECS Resources
#

resource "aws_ecs_cluster" "oar" {
  name = "ecsCluster${title(var.project)}${title(var.environment)}"
}

data "template_file" "oar_ecs_task" {
  template = "${file("task-definitions/oar.json")}"

  vars = {
    cpu    = "${var.fargate_cpu}"
    image  = "${local.app_image}"
    memory = "${var.fargate_memory}"

    postgres_host     = "${module.database.hostname}"
    postgres_port     = "${module.database.port}"
    postgres_user     = "${var.rds_database_username}"
    postgres_password = "${var.rds_database_password}"
    postgres_db       = "${var.rds_database_name}"

    django_secret_key = "${var.django_secret_key}"

    app_port = "${var.app_port}"

    aws_region = "${var.aws_region}"

    project     = "${var.project}"
    environment = "${var.environment}"
  }
}

resource "aws_ecs_task_definition" "oar" {
  family                   = "oar"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "${var.fargate_cpu}"
  memory                   = "${var.fargate_memory}"

  execution_role_arn = "${aws_iam_role.ecs_task_execution_role.arn}"

  container_definitions = "${data.template_file.oar_ecs_task.rendered}"
}

data "template_file" "oar_management_ecs_task" {
  template = "${file("task-definitions/oar_management.json")}"

  vars = {
    cpu    = "${var.fargate_cpu}"
    image  = "${local.app_image}"
    memory = "${var.fargate_memory}"

    postgres_host     = "${module.database.hostname}"
    postgres_port     = "${module.database.port}"
    postgres_user     = "${var.rds_database_username}"
    postgres_password = "${var.rds_database_password}"
    postgres_db       = "${var.rds_database_name}"

    django_secret_key = "${var.django_secret_key}"

    app_port = "${var.app_port}"

    aws_region = "${var.aws_region}"

    project     = "${var.project}"
    environment = "${var.environment}"
  }
}

resource "aws_ecs_task_definition" "oar_management" {
  family                   = "mgmt${title(var.project)}${title(var.environment)}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "${var.fargate_cpu}"
  memory                   = "${var.fargate_memory}"

  execution_role_arn = "${aws_iam_role.ecs_task_execution_role.arn}"

  container_definitions = "${data.template_file.oar_management_ecs_task.rendered}"
}

resource "aws_ecs_service" "oar" {
  name            = "ecsService${title(var.project)}${title(var.environment)}"
  cluster         = "${aws_ecs_cluster.oar.id}"
  task_definition = "${aws_ecs_task_definition.oar.arn}"

  desired_count                      = "${var.app_count}"
  deployment_minimum_healthy_percent = "${var.deployment_minimum_healthy_percent}"
  deployment_maximum_percent         = "${var.deployment_maximum_percent}"

  launch_type = "FARGATE"

  network_configuration {
    security_groups = ["${aws_security_group.ecs_cluster.id}"]
    subnets         = ["${module.vpc.private_subnet_ids}"]
  }

  load_balancer {
    target_group_arn = "${aws_lb_target_group.oar.arn}"
    container_name   = "openapparelregistry"
    container_port   = "${var.app_port}"
  }

  depends_on = [
    "aws_lb_listener.oar",
  ]
}

#
# CloudWatch Resources
#
resource "aws_cloudwatch_log_group" "oar" {
  name              = "log${title(var.project)}${title(var.environment)}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "oar_mangement" {
  name              = "logMgmt${title(var.project)}${title(var.environment)}"
  retention_in_days = 30
}
