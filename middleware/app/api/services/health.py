import utils.logger as logger
from database.db import DynamoDBManager
from storage.cloudflare_r2 import CloudflareR2Manager
from fastapi import HTTPException
from appwrite.client import Client
from appwrite.services.health import Health
import os

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
    appwrite_health_check()

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {"status": "ok", "details": "Service is running"}


def appwrite_health_check():
    FUNCTION_NAME = "appwrite_health_check()"
    log.info("Entering {}".format(FUNCTION_NAME))
    client = Client()
    client.set_endpoint(os.getenv("APPWRITE_URL"))
    client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
    client.set_key(os.getenv("APPWRITE_API_KEY"))

    health = Health(client)

    result = health.get()
    if(not result):
        raise HTTPException(status_code=503, detail="Appwrite connection failed")
    
    log.info("Exiting {}".format(FUNCTION_NAME))
