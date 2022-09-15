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
  name               = "ecs${local.short}TaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "ses_send_email" {
  statement {
    effect = "Allow"

    resources = ["*"]
    actions   = ["ses:SendRawEmail"]
  }
}

resource "aws_iam_role" "app_task_role" {
  name               = "ecs${local.short}TaskRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

resource "aws_iam_role_policy" "ses_send_email" {
  name   = "SESSendEmail"
  role   = aws_iam_role.app_task_role.name
  policy = data.aws_iam_policy_document.ses_send_email.json
}

data "aws_iam_policy_document" "batch_describe_and_submit" {
  statement {
    effect = "Allow"

    resources = ["*"]

    actions = [
      "batch:DescribeJobQueues",
      "batch:DescribeJobs",
      "batch:DescribeJobDefinitions",
      "batch:DescribeComputeEnvironments",
      "batch:SubmitJob",
    ]
  }
}

resource "aws_iam_role_policy" "batch_describe_and_submit" {
  name   = "BatchDescribeAndSubmit"
  role   = aws_iam_role.app_task_role.name
  policy = data.aws_iam_policy_document.batch_describe_and_submit.json
}


data "aws_iam_policy_document" "s3_read_write_files_bucket" {
  statement {
    effect = "Allow"

    resources = [
      aws_s3_bucket.files.arn,
      "${aws_s3_bucket.files.arn}/*",
    ]

    actions = [
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:PutObject"
    ]
  }
}

resource "aws_iam_role_policy" "s3_read_write_files_bucket" {
  name   = "S3ReadWriteFiles"
  role   = aws_iam_role.ecs_task_role.name
  policy = data.aws_iam_policy_document.s3_read_write_files_bucket.json
}

#
# ALB IAM resources
#
data "aws_elb_service_account" "main" {
}

data "aws_iam_policy_document" "alb_access_logging" {
  statement {
    effect = "Allow"

    actions = ["s3:PutObject"]

    principals {
      type        = "AWS"
      identifiers = [data.aws_elb_service_account.main.arn]
    }

    resources = [
      "${aws_s3_bucket.logs.arn}/ALB/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "alb_access_logging" {
  bucket = aws_s3_bucket.logs.id
  policy = data.aws_iam_policy_document.alb_access_logging.json
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
  name               = "ecs${local.short}ContainerInstanceProfile"
  assume_role_policy = data.aws_iam_policy_document.container_instance_ec2_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ec2_service_role" {
  role       = aws_iam_role.container_instance_ec2.name
  policy_arn = var.ec2_service_role_policy_arn
}

resource "aws_iam_role_policy" "ses_send_email_from_batch" {
  name   = "ses${local.short}EmailSendingPolicy"
  role   = aws_iam_role.container_instance_ec2.name
  policy = data.aws_iam_policy_document.ses_send_email.json
}

resource "aws_iam_instance_profile" "container_instance" {
  name = aws_iam_role.container_instance_ec2.name
  role = aws_iam_role.container_instance_ec2.name
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
  name               = "batch${local.short}ServiceRole"
  assume_role_policy = data.aws_iam_policy_document.container_instance_batch_assume_role.json
}

resource "aws_iam_role_policy_attachment" "batch_policy" {
  role       = aws_iam_role.container_instance_batch.name
  policy_arn = var.batch_service_role_policy_arn
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
  name               = "fleet${local.short}ServiceRole"
  assume_role_policy = data.aws_iam_policy_document.container_instance_spot_fleet_assume_role.json
}

resource "aws_iam_role_policy_attachment" "spot_fleet_policy" {
  role       = aws_iam_role.container_instance_spot_fleet.name
  policy_arn = var.spot_fleet_service_role_policy_arn
}

#
# Lambda IAM resources
#
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "alert_batch_failures" {
  name               = "lambda${local.short}AlertBatchFailures"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "alert_batch_failures_lambda_policy" {
  role       = aws_iam_role.alert_batch_failures.name
  policy_arn = var.aws_lambda_service_role_policy_arn
}

resource "aws_iam_role" "alert_sfn_failures" {
  name               = "lambda${local.short}AlertStepFunctionsFailures"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "alert_sfn_failures_lambda_policy" {
  role       = aws_iam_role.alert_sfn_failures.name
  policy_arn = var.aws_lambda_service_role_policy_arn
}

#
# Step Functions IAM resources
#
data "aws_iam_policy_document" "step_functions_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["states.amazonaws.com"]
    }

    actions = [
      "sts:AssumeRole",
    ]
  }
}

data "aws_caller_identity" "current" {
}

data "aws_iam_policy_document" "step_functions_service_role_policy" {
  statement {
    effect = "Allow"

    actions = ["iam:PassRole"]

    # Allow Step Functions to assume the ECS task and execution roles.
    resources = [
      aws_iam_role.app_task_role.arn,
      aws_iam_role.ecs_task_execution_role.arn,
    ]
  }

  statement {
    effect = "Allow"

    actions = ["ecs:RunTask"]

    # Allow ecs:RunTask for all current and future versions of the task
    # definition.
    resources = [replace(aws_ecs_task_definition.app_cli.arn, "/:\\d+$/", ":*")]

    condition {
      test     = "ArnEquals"
      variable = "ecs:cluster"

      values = [aws_ecs_cluster.app.arn]
    }
  }

  statement {
    effect = "Allow"

    actions = [
      "ecs:StopTask",
      "ecs:DescribeTasks",
    ]

    # Despite the "*" wildcard, only allow these actions for ECS tasks that were
    # started by Step Functions.
    # See: https://github.com/awsdocs/aws-step-functions-developer-guide/blob/master/doc_source/ecs-iam.md#-synchronous-
    resources = ["*"]
  }

  statement {
    effect = "Allow"

    actions = [
      "events:PutTargets",
      "events:PutRule",
      "events:DescribeRule",
    ]

    resources = [
      "arn:aws:events:${var.aws_region}:${data.aws_caller_identity.current.account_id}:rule/StepFunctionsGetEventsForECSTaskRule",
    ]
  }

  statement {
    effect = "Allow"

    actions = ["lambda:InvokeFunction"]

    resources = [aws_lambda_function.alert_sfn_failures.arn]
  }
}

resource "aws_iam_role" "step_functions_service_role" {
  name               = "stepFunctions${local.short}ServiceRole"
  assume_role_policy = data.aws_iam_policy_document.step_functions_assume_role.json
}

resource "aws_iam_role_policy" "step_functions_service_role_policy" {
  name   = "stepFunctions${local.short}ServiceRolePolicy"
  role   = aws_iam_role.step_functions_service_role.name
  policy = data.aws_iam_policy_document.step_functions_service_role_policy.json
}

#
# CloudWatch Events IAM resources
#
data "aws_iam_policy_document" "cloudwatch_events_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    actions = [
      "sts:AssumeRole",
    ]
  }
}

data "aws_iam_policy_document" "cloudwatch_events_service_role_policy" {
  statement {
    effect = "Allow"

    resources = [aws_sfn_state_machine.app_cli.id]

    actions = ["states:StartExecution"]
  }
}

resource "aws_iam_role" "cloudwatch_events_service_role" {
  name               = "cloudWatchEvents${local.short}ServiceRole"
  assume_role_policy = data.aws_iam_policy_document.cloudwatch_events_assume_role.json
}

resource "aws_iam_role_policy" "cloudwatch_events_service_role_policy" {
  name   = "cloudWatchEvents${local.short}ServiceRolePolicy"
  role   = aws_iam_role.cloudwatch_events_service_role.name
  policy = data.aws_iam_policy_document.cloudwatch_events_service_role_policy.json
}
