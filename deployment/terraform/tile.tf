#
# ALB resources
#
resource "aws_lb_target_group" "tile" {
  name = "tg${var.environment}Tile"

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
    Name        = "tg${var.environment}Tile"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_lb_listener_rule" "tile" {
  listener_arn = "${aws_lb_listener.app.arn}"
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = "${aws_lb_target_group.tile.arn}"
  }

  condition {
    field  = "path-pattern"
    values = ["/tile/*"]
  }
}

#
# ECS Resources
#
data "template_file" "tile" {
  template = "${file("task-definitions/tile.json")}"

  vars = {
    image = "${local.app_image}"

    postgres_host     = "${aws_route53_record.database.name}"
    postgres_port     = "${module.database_enc.port}"
    postgres_user     = "${var.rds_database_username}"
    postgres_password = "${var.rds_database_password}"
    postgres_db       = "${var.rds_database_name}"

    # See: https://docs.gunicorn.org/en/stable/design.html#how-many-workers
    gunicorn_workers = "${ceil((2 * (__builtin_StringToFloat(var.app_fargate_cpu) / 1024)) + 1)}"

    google_server_side_api_key = "${var.google_server_side_api_key}"
    google_client_side_api_key = "${var.google_client_side_api_key}"
    google_analytics_key       = "${var.google_analytics_key}"

    rollbar_server_side_access_token = "${var.rollbar_server_side_access_token}"
    rollbar_client_side_access_token = "${var.rollbar_client_side_access_token}"

    django_secret_key = "${var.django_secret_key}"

    oar_client_key = "${var.oar_client_key}"

    default_from_email = "${var.default_from_email}"

    app_port = "${var.app_port}"

    aws_region = "${var.aws_region}"

    project     = "${var.project}"
    environment = "${var.environment}"
  }
}

resource "aws_ecs_task_definition" "tile" {
  family                   = "${var.environment}Tile"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "${var.tile_fargate_cpu}"
  memory                   = "${var.tile_fargate_memory}"

  task_role_arn      = "${aws_iam_role.app_task_role.arn}"
  execution_role_arn = "${aws_iam_role.ecs_task_execution_role.arn}"

  container_definitions = "${data.template_file.tile.rendered}"
}

resource "aws_ecs_service" "tile" {
  name            = "${var.environment}Tile"
  cluster         = "${aws_ecs_cluster.app.id}"
  task_definition = "${aws_ecs_task_definition.tile.arn}"

  desired_count                      = "${var.tile_ecs_desired_count}"
  deployment_minimum_healthy_percent = "${var.tile_ecs_deployment_min_percent}"
  deployment_maximum_percent         = "${var.tile_ecs_deployment_max_percent}"

  launch_type = "FARGATE"

  network_configuration {
    security_groups = ["${aws_security_group.app.id}"]
    subnets         = ["${module.vpc.private_subnet_ids}"]
  }

  load_balancer {
    target_group_arn = "${aws_lb_target_group.tile.arn}"
    container_name   = "django"
    container_port   = "${var.app_port}"
  }

  depends_on = [
    "aws_lb_listener.app",
  ]
}

#
# CloudWatch resources
#
resource "aws_cloudwatch_log_group" "tile" {
  name              = "log${var.environment}Tile"
  retention_in_days = 30
}
