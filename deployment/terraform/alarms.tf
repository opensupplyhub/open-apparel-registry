resource "aws_sns_topic" "global" {
  name = "topic${local.short}GlobalNotifications"
}

