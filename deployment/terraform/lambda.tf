#
# Alert Batch failures resources
#
resource "aws_lambda_function" "alert_batch_failures" {
  filename         = "${path.module}/lambda-functions/alert_batch_failures/alert_batch_failures.zip"
  source_code_hash = "${base64sha256(file("${path.module}/lambda-functions/alert_batch_failures/alert_batch_failures.zip"))}"
  function_name    = "func${var.environment}AlertBatchFailures"
  description      = "Function to alert on AWS Batch Job Failures."
  role             = "${aws_iam_role.alert_batch_failures.arn}"
  handler          = "alert_batch_failures.handler"
  runtime          = "python3.8"
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      ENVIRONMENT                      = "${var.environment}"
      ROLLBAR_SERVER_SIDE_ACCESS_TOKEN = "${var.rollbar_server_side_access_token}"
    }
  }

  tags {
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_cloudwatch_event_rule" "alert_batch_failures" {
  name        = "rule${var.environment}AlertBatchFailures"
  description = "Rule to send alerts when batch jobs fail."

  event_pattern = <<PATTERN
{
  "source": ["aws.batch"],
  "detail-type": ["Batch Job State Change"],
  "detail": {
    "status": ["FAILED"],
    "jobQueue": [
      "${aws_batch_job_queue.default.arn}"
    ]
  }
}
PATTERN
}

resource "aws_cloudwatch_event_target" "alert_batch_failures" {
  rule      = "${aws_cloudwatch_event_rule.alert_batch_failures.name}"
  target_id = "target${var.environment}AlertBatchFailures"
  arn       = "${aws_lambda_function.alert_batch_failures.arn}"
}

resource "aws_lambda_permission" "alert_batch_failures" {
  statement_id  = "perm${var.environment}AlertBatchFailures"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.alert_batch_failures.function_name}"
  principal     = "events.amazonaws.com"
  source_arn    = "${aws_cloudwatch_event_rule.alert_batch_failures.arn}"
}

#
# Alert Step Functions failures resources
#
resource "aws_lambda_function" "alert_sfn_failures" {
  filename         = "${path.module}/lambda-functions/alert_sfn_failures/alert_sfn_failures.zip"
  source_code_hash = "${base64sha256(file("${path.module}/lambda-functions/alert_sfn_failures/alert_sfn_failures.zip"))}"
  function_name    = "func${var.environment}AlertStepFunctionsFailures"
  description      = "Function to alert on AWS Step Functions Failures."
  role             = "${aws_iam_role.alert_sfn_failures.arn}"
  handler          = "alert_sfn_failures.handler"
  runtime          = "python3.8"
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      ENVIRONMENT                      = "${var.environment}"
      ROLLBAR_SERVER_SIDE_ACCESS_TOKEN = "${var.rollbar_server_side_access_token}"
    }
  }

  tags {
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}
