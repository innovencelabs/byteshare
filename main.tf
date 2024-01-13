provider "aws" {
  region = "us-east-2"
}

# S3 Bucket
resource "aws_s3_bucket" "byteshare-blob" {
  bucket = "byteshare-blob"
}

# DynamoDB table
resource "aws_dynamodb_table" "byteshare-files-metadata" {
  name           = "byteshare-files-metadata"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "upload_id"
  range_key      = "timestamp"

  attribute {
    name = "upload_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }
}
