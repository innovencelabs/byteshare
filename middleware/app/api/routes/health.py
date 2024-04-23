from fastapi import APIRouter
from database.db import DynamoDBManager
from storage.cloudflare_r2 import CloudflareR2Manager

router = APIRouter()

# DynamoDB
table_name = "byteshare-upload-metadata"
dynamodb = DynamoDBManager(table_name)

# Storage
BUCKET_NAME = "byteshare-blob"
storage = CloudflareR2Manager(BUCKET_NAME)


@router.get("/")
def health_check():
    """
    Perform checks to verify system health.
    For instance, check database connection, external services, etc.

    Parameters:
    - None

    Returns:
    - Status of application and external services
    """

    dynamodb.health_check()
    storage.health_check()

    return {"status": "ok", "details": "Service is running"}
