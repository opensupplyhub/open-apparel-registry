locals {
  short_environment = "${var.environment == "Staging" ? "stg" : "${var.environment}" == "Production" ? "prd" : "${lower(var.environment)}"}"
}

# https://docs.aws.amazon.com/athena/latest/ug/cloudfront-logs.html
resource "aws_glue_catalog_table" "cdn_logs" {
  name          = "${local.short_environment}_cdn_logs"
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
      name                  = "${local.short_environment}_cdn_logs"
      serialization_library = "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe"

      parameters = {
        "field.delim"          = "\t"
        "serialization.format" = "\t"
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
