provider "aws" {
  region = "us-east-2"
}

# S3 Bucket
resource "aws_s3_bucket" "byteshare-blob" {
  bucket = "byteshare-blob"
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
