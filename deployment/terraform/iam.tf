#
# ECS IAM resources
#
data "aws_iam_policy_document" "ecs_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }

    actions = [
      "sts:AssumeRole",
    ]
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "ecs${var.environment}TaskExecutionRole"
  assume_role_policy = "${data.aws_iam_policy_document.ecs_assume_role.json}"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = "${aws_iam_role.ecs_task_execution_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "ses_send_email" {
  statement {
    effect = "Allow"

    resources = ["*"]
    actions   = ["ses:SendRawEmail"]
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name               = "ecs${var.environment}TaskRole"
  assume_role_policy = "${data.aws_iam_policy_document.ecs_assume_role.json}"
}

resource "aws_iam_role_policy" "ses_send_email" {
  name   = "SESSendEmail"
  role   = "${aws_iam_role.ecs_task_role.name}"
  policy = "${data.aws_iam_policy_document.ses_send_email.json}"
}

#
# EC2 IAM resources
#
data "aws_iam_policy_document" "container_instance_ec2_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "container_instance_ec2" {
  name               = "ecs${var.environment}ContainerInstanceProfile"
  assume_role_policy = "${data.aws_iam_policy_document.container_instance_ec2_assume_role.json}"
}

resource "aws_iam_role_policy_attachment" "ec2_service_role" {
  role       = "${aws_iam_role.container_instance_ec2.name}"
  policy_arn = "${var.ec2_service_role_policy_arn}"
}

resource "aws_iam_instance_profile" "container_instance" {
  name = "${aws_iam_role.container_instance_ec2.name}"
  role = "${aws_iam_role.container_instance_ec2.name}"
}

#
# Batch IAM resources
#
data "aws_iam_policy_document" "container_instance_batch_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["batch.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "container_instance_batch" {
  name               = "batch${var.environment}ServiceRole"
  assume_role_policy = "${data.aws_iam_policy_document.container_instance_batch_assume_role.json}"
}

resource "aws_iam_role_policy_attachment" "batch_policy" {
  role       = "${aws_iam_role.container_instance_batch.name}"
  policy_arn = "${var.batch_service_role_policy_arn}"
}

#
# Spot Fleet IAM resources
#
data "aws_iam_policy_document" "container_instance_spot_fleet_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["spotfleet.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "container_instance_spot_fleet" {
  name               = "fleet${var.environment}ServiceRole"
  assume_role_policy = "${data.aws_iam_policy_document.container_instance_spot_fleet_assume_role.json}"
}

resource "aws_iam_role_policy_attachment" "spot_fleet_policy" {
  role       = "${aws_iam_role.container_instance_spot_fleet.name}"
  policy_arn = "${var.spot_fleet_service_role_policy_arn}"
}
