locals {
  short_environment = var.environment == "Staging" ? "stg" : var.environment == "Production" ? "prd" : lower(var.environment)
}

# https://docs.aws.amazon.com/athena/latest/ug/application-load-balancer-logs.html
resource "aws_glue_catalog_table" "alb_logs" {
  name          = "${var.short_project}_${local.short_environment}_alb_logs"
  database_name = "default"

  table_type = "EXTERNAL_TABLE"

  parameters = {
    EXTERNAL = "TRUE"
  }

  storage_descriptor {
    location      = "s3://${aws_s3_bucket.logs.id}/ALB/"
    input_format  = "org.apache.hadoop.mapred.TextInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat"

    ser_de_info {
      name                  = "${var.short_project}_${local.short_environment}_alb_logs"
      serialization_library = "org.apache.hadoop.hive.serde2.RegexSerDe"

      parameters = {
        "serialization.format" = "1"
        "input.regex"          = "([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*):([0-9]*) ([^ ]*)[:-]([0-9]*) ([-.0-9]*) ([-.0-9]*) ([-.0-9]*) (|[-0-9]*) (-|[-0-9]*) ([-0-9]*) ([-0-9]*) \"([^ ]*) ([^ ]*) (- |[^ ]*)\" \"([^\"]*)\" ([A-Z0-9-]+) ([A-Za-z0-9.-]*) ([^ ]*) \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" ([-.0-9]*) ([^ ]*) \"([^\"]*)\" \"([^\"]*)\" \"([^ ]*)\" \"([^\\s]+?)\" \"([^\\s]+)\" \"([^ ]*)\" \"([^ ]*)\""
      }
    }

    columns {
      name = "type"
      type = "string"
    }

    columns {
      name = "time"
      type = "string"
    }

    columns {
      name = "elb"
      type = "string"
    }

    columns {
      name = "client_ip"
      type = "string"
    }

    columns {
      name = "client_port"
      type = "int"
    }

    columns {
      name = "target_ip"
      type = "string"
    }

    columns {
      name = "target_port"
      type = "int"
    }

    columns {
      name = "request_processing_time"
      type = "double"
    }

    columns {
      name = "target_processing_time"
      type = "double"
    }

    columns {
      name = "response_processing_time"
      type = "double"
    }

    columns {
      name = "elb_status_code"
      type = "string"
    }

    columns {
      name = "target_status_code"
      type = "string"
    }

    columns {
      name = "received_bytes"
      type = "bigint"
    }

    columns {
      name = "sent_bytes"
      type = "bigint"
    }

    columns {
      name = "request_verb"
      type = "string"
    }

    columns {
      name = "request_url"
      type = "string"
    }

    columns {
      name = "request_proto"
      type = "string"
    }

    columns {
      name = "user_agent"
      type = "string"
    }

    columns {
      name = "ssl_cipher"
      type = "string"
    }

    columns {
      name = "ssl_protocol"
      type = "string"
    }

    columns {
      name = "target_group_arn"
      type = "string"
    }

    columns {
      name = "trace_id"
      type = "string"
    }

    columns {
      name = "domain_name"
      type = "string"
    }

    columns {
      name = "chosen_cert_arn"
      type = "string"
    }

    columns {
      name = "matched_rule_priority"
      type = "string"
    }

    columns {
      name = "request_creation_time"
      type = "string"
    }

    columns {
      name = "actions_executed"
      type = "string"
    }

    columns {
      name = "redirect_url"
      type = "string"
    }

    columns {
      name = "lambda_error_reason"
      type = "string"
    }

    columns {
      name = "target_port_list"
      type = "string"
    }

    columns {
      name = "target_status_code_list"
      type = "string"
    }

    columns {
      name = "classification"
      type = "string"
    }

    columns {
      name = "classification_reason"
      type = "string"
    }
  }
}

# https://docs.aws.amazon.com/athena/latest/ug/cloudfront-logs.html
resource "aws_glue_catalog_table" "cdn_logs" {
  name          = "${var.short_project}_${local.short_environment}_cdn_logs"
  database_name = "default"

  table_type = "EXTERNAL_TABLE"

  parameters = {
    EXTERNAL                 = "TRUE"
    "skip.header.line.count" = "2"
  }

  storage_descriptor {
    location          = "s3://${aws_s3_bucket.logs.id}/CDN/"
    input_format      = "org.apache.hadoop.mapred.TextInputFormat"
    output_format     = "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat"
    number_of_buckets = "-1"

    ser_de_info {
      name                  = "${var.short_project}_${local.short_environment}_cdn_logs"
      serialization_library = "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe"

      parameters = {
        "field.delim"          = "	"
        "serialization.format" = "	"
      }
    }

    columns {
      name = "date"
      type = "date"
    }

    columns {
      name = "time"
      type = "string"
    }

    columns {
      name = "location"
      type = "string"
    }

    columns {
      name = "bytes"
      type = "bigint"
    }

    columns {
      name = "request_ip"
      type = "string"
    }

    columns {
      name = "method"
      type = "string"
    }

    columns {
      name = "host"
      type = "string"
    }

    columns {
      name = "uri"
      type = "string"
    }

    columns {
      name = "status"
      type = "int"
    }

    columns {
      name = "referrer"
      type = "string"
    }

    columns {
      name = "user_agent"
      type = "string"
    }

    columns {
      name = "query_string"
      type = "string"
    }

    columns {
      name = "cookie"
      type = "string"
    }

    columns {
      name = "result_type"
      type = "string"
    }

    columns {
      name = "request_id"
      type = "string"
    }

    columns {
      name = "host_header"
      type = "string"
    }

    columns {
      name = "request_protocol"
      type = "string"
    }

    columns {
      name = "request_bytes"
      type = "bigint"
    }

    columns {
      name = "time_taken"
      type = "float"
    }

    columns {
      name = "xforwarded_for"
      type = "string"
    }

    columns {
      name = "ssl_protocol"
      type = "string"
    }

    columns {
      name = "ssl_cipher"
      type = "string"
    }

    columns {
      name = "response_result_type"
      type = "string"
    }

    columns {
      name = "http_version"
      type = "string"
    }

    columns {
      name = "fle_status"
      type = "string"
    }

    columns {
      name = "fle_encrypted_fields"
      type = "int"
    }
  }
}

