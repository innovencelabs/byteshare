terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5"
    }
  }
}

variable "r2_access_key" {}
variable "r2_secret_key" {}
variable "r2_account_id" {}

provider "aws" {
  alias = "r2"
  region = "auto"

  access_key = var.r2_access_key
  secret_key = var.r2_secret_key

  skip_credentials_validation = true
  skip_region_validation      = true
  skip_requesting_account_id  = true

  endpoints {
    s3 = "https://${var.r2_account_id}.r2.cloudflarestorage.com"
  }
}


# Bucket
resource "aws_s3_bucket" "byteshare-blob" {
  provider = aws.r2
  bucket = "byteshare-blob"
}

resource "aws_s3_bucket_lifecycle_configuration" "expire-object" {
  provider = aws.r2
  bucket = aws_s3_bucket.byteshare-blob.id

  rule {
    id     = "expire_object"
    status = "Enabled"
    expiration {
      days = 60
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "allow-cors" {
  provider = aws.r2
  bucket = aws_s3_bucket.byteshare-blob.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["Content-Length", "Content-Type"]
  }
}