provider "aws" {
  region = "us-east-2"
}

# S3 Bucket
resource "aws_s3_bucket" "byteshare-blob" {
  bucket = "byteshare-blob"
}

resource "aws_s3_bucket_cors_configuration" "allow_upload" {
  bucket = "byteshare-blob"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers = ["ETag", "Content-Length", "Content-Type"]
  }
}

# DynamoDB table
resource "aws_dynamodb_table" "byteshare-upload-metadata" {
  name           = "byteshare-upload-metadata"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "upload_id"

  attribute {
    name = "upload_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "byteshare-subscriber" {
  name           = "byteshare-subscriber"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "email"
  range_key      = "created_at"

  attribute {
    name = "email"
    type = "S"
  }
  attribute {
    name = "created_at"
    type = "S"
  }
}