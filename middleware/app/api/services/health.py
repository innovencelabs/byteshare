import utils.logger as logger
from database.db import DynamoDBManager
from storage.cloudflare_r2 import CloudflareR2Manager

# Logger instance
log = logger.get_logger()

# DynamoDB
table_name = "byteshare-upload-metadata"
dynamodb = DynamoDBManager(table_name)

# Storage
BUCKET_NAME = "byteshare-blob"
storage = CloudflareR2Manager(BUCKET_NAME)


def health_check():
    FUNCTION_NAME = "health_check()"
    log.info("Entering {}".format(FUNCTION_NAME))

    dynamodb.health_check()
    storage.health_check()

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {"status": "ok", "details": "Service is running"}
