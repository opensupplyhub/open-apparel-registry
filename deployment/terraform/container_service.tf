#
# ECS cluster resources
#
resource "aws_ecs_cluster" "app" {
  name = "ecs${var.environment}Cluster"
}
