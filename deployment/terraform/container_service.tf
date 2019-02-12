locals {
  app_image = "${module.ecr_repository.repository_url}:${var.image_tag}"
}

#
# Security Group Resources
#
resource "aws_security_group" "alb" {
  vpc_id = "${module.vpc.id}"

  tags {
    Name        = "sgAppLoadBalancer"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_security_group" "app" {
  vpc_id = "${module.vpc.id}"

  tags {
    Name        = "sgAppEcsService"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_security_group" "batch" {
  vpc_id = "${module.vpc.id}"

  tags {
    Name        = "sgBatchContainerInstance"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

#
# ALB Resources
#
resource "aws_lb" "app" {
  name            = "alb${var.environment}App"
  security_groups = ["${aws_security_group.alb.id}"]
  subnets         = ["${module.vpc.public_subnet_ids}"]

  tags {
    Name        = "alb${var.environment}App"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_lb_target_group" "app" {
  name = "tg${var.environment}App"

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
    Name        = "tg${var.environment}App"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_lb_listener" "app" {
  load_balancer_arn = "${aws_lb.app.id}"
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = "${module.cert.arn}"

  default_action {
    target_group_arn = "${aws_lb_target_group.app.id}"
    type             = "forward"
  }
}

#
# ECS Resources
#

resource "aws_ecs_cluster" "app" {
  name = "ecs${var.environment}Cluster"
}

data "template_file" "app" {
  template = "${file("task-definitions/app.json")}"

  vars = {
    cpu    = "${var.fargate_cpu}"
    image  = "${local.app_image}"
    memory = "${var.fargate_memory}"

    postgres_host     = "${aws_route53_record.database.name}"
    postgres_port     = "${module.database.port}"
    postgres_user     = "${var.rds_database_username}"
    postgres_password = "${var.rds_database_password}"
    postgres_db       = "${var.rds_database_name}"

    google_geocoding_api_key = "${var.google_geocoding_api_key}"

    rollbar_server_side_access_token = "${var.rollbar_server_side_access_token}"

    django_secret_key = "${var.django_secret_key}"

    default_from_email = "${var.default_from_email}"

    app_port = "${var.app_port}"

    aws_region = "${var.aws_region}"

    project     = "${var.project}"
    environment = "${var.environment}"
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.environment}App"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "${var.fargate_cpu}"
  memory                   = "${var.fargate_memory}"

  task_role_arn      = "${aws_iam_role.app_task_role.arn}"
  execution_role_arn = "${aws_iam_role.ecs_task_execution_role.arn}"

  container_definitions = "${data.template_file.app.rendered}"
}

data "template_file" "app_cli" {
  template = "${file("task-definitions/app_cli.json")}"

  vars = {
    cpu    = "${var.fargate_cpu}"
    image  = "${local.app_image}"
    memory = "${var.fargate_memory}"

    postgres_host     = "${aws_route53_record.database.name}"
    postgres_port     = "${module.database.port}"
    postgres_user     = "${var.rds_database_username}"
    postgres_password = "${var.rds_database_password}"
    postgres_db       = "${var.rds_database_name}"

    google_geocoding_api_key = "${var.google_geocoding_api_key}"

    rollbar_server_side_access_token = "${var.rollbar_server_side_access_token}"

    django_secret_key = "${var.django_secret_key}"

    default_from_email = "${var.default_from_email}"

    app_port = "${var.app_port}"

    aws_region = "${var.aws_region}"

    project     = "${var.project}"
    environment = "${var.environment}"
  }
}

resource "aws_ecs_task_definition" "app_cli" {
  family                   = "${var.environment}AppCLI"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "${var.fargate_cpu}"
  memory                   = "${var.fargate_memory}"

  task_role_arn      = "${aws_iam_role.app_task_role.arn}"
  execution_role_arn = "${aws_iam_role.ecs_task_execution_role.arn}"

  container_definitions = "${data.template_file.app_cli.rendered}"
}

resource "aws_ecs_service" "app" {
  name            = "${var.environment}App"
  cluster         = "${aws_ecs_cluster.app.id}"
  task_definition = "${aws_ecs_task_definition.app.arn}"

  desired_count                      = "${var.app_count}"
  deployment_minimum_healthy_percent = "${var.deployment_minimum_healthy_percent}"
  deployment_maximum_percent         = "${var.deployment_maximum_percent}"

  launch_type = "FARGATE"

  network_configuration {
    security_groups = ["${aws_security_group.app.id}"]
    subnets         = ["${module.vpc.private_subnet_ids}"]
  }

  load_balancer {
    target_group_arn = "${aws_lb_target_group.app.arn}"
    container_name   = "django"
    container_port   = "${var.app_port}"
  }

  depends_on = [
    "aws_lb_listener.app",
  ]
}

#
# CloudWatch Resources
#
resource "aws_cloudwatch_log_group" "app" {
  name              = "log${var.environment}App"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "cli" {
  name              = "log${var.environment}AppCLI"
  retention_in_days = 30
}
