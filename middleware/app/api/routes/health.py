from fastapi import APIRouter
from database.db import DynamoDBManager
from storage.cloudflare_r2 import CloudflareR2Manager
import utils.logger as logger

router = APIRouter()

# Logger instance
log = logger.get_logger()

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
    FUNCTION_NAME = "health_check()"
    log.info("Entering {}".format(FUNCTION_NAME))

    dynamodb.health_check()
    storage.health_check()

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {"status": "ok", "details": "Service is running"}
