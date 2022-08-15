#
# Step Function Resources
#
data "template_file" "app_cli_state_machine" {
  template = file("step-functions/app_cli.json")

  vars = {
    ecs_cluster_arn         = aws_ecs_cluster.app.arn
    security_group_id       = aws_security_group.app.id
    subnet_ids              = jsonencode(module.vpc.private_subnet_ids)
    ecs_task_definition_arn = aws_ecs_task_definition.app_cli.arn
    ecs_container_name      = "django"
    timeout_seconds         = var.app_cli_state_machine_timeout_seconds
    lambda_function_arn     = aws_lambda_function.alert_sfn_failures.arn
  }
}

resource "aws_sfn_state_machine" "app_cli" {
  name     = "stateMachine${local.short}AppCLI"
  role_arn = aws_iam_role.step_functions_service_role.arn

  definition = data.template_file.app_cli_state_machine.rendered
}

#
# CloudWatch Resources
#
resource "aws_cloudwatch_event_target" "check_api_limits" {
  target_id = "eventTarget${local.short}CheckAPILimits"
  rule      = aws_cloudwatch_event_rule.check_api_limits.name
  arn       = aws_sfn_state_machine.app_cli.id
  role_arn  = aws_iam_role.cloudwatch_events_service_role.arn

  input = <<EOF
{
  "commands": [
    "check_api_limits"
  ]
}
EOF

}

resource "aws_cloudwatch_event_rule" "check_api_limits" {
  name                = "eventRule${local.short}CheckAPILimits"
  description         = "Run check_api_limits management command at a scheduled time (${var.check_api_limits_schedule_expression})"
  schedule_expression = var.check_api_limits_schedule_expression
}

