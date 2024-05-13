import os
import uuid
from datetime import datetime, timezone

import boto3
import utils.logger as logger
from database.db import DynamoDBManager
from fastapi import HTTPException

# Logger instance
log = logger.get_logger()

# DynamoDB
table_name = "byteshare-apikey"
apikey_dynamodb = DynamoDBManager(table_name)

if os.getenv("ENVIRONMENT") == "production":
    api_gateway = boto3.client(
        "apigateway",
        region_name=os.getenv("AWS_APP_REGION"),
    )
else:
    api_gateway = boto3.client(
        "apigateway",
        aws_access_key_id=os.getenv("AWS_APP_ACCESS_KEY"),
        aws_secret_access_key=os.getenv("AWS_APP_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_APP_REGION"),
    )


def get_apikey_return_apikey(token_data):
    FUNCTION_NAME = "get_apikey_return_apikey()"
    log.info("Entering {}".format(FUNCTION_NAME))

    user_id = token_data["$id"]

    apikey_metadata = apikey_dynamodb.read_item({"user_id": user_id})
    exist = False
    if not apikey_metadata:
        exist = False
    else:
        exist = True

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {"exist": exist}


def create_apikey_return_apikey(token_data):
    FUNCTION_NAME = "create_apikey_return_apikey()"
    log.info("Entering {}".format(FUNCTION_NAME))

    user_id = token_data["$id"]

    api_key_response = api_gateway.create_api_key(name=str(uuid.uuid4()))

    api_key = api_key_response["value"]
    api_key_id = api_key_response["id"]
    usage_plan_name = "ByteShareDevUsagePlan"

    usage_plan_response = api_gateway.get_usage_plans()
    usage_plans = usage_plan_response["items"]

    for plan in usage_plans:
        if plan["name"] == usage_plan_name:
            usage_plan_id = plan["id"]
            break

    # TODO: Remove this
    # if os.getenv("ENVIRONMENT") == "dev" and not found_usage_plan:
    #     usage_plan_response = api_gateway.create_usage_plan(
    #         name="ByteShareDevUsagePlan",
    #         throttle={"burstLimit": 5, "rateLimit": 10},
    #         quota={"limit": 20, "offset": 0, "period": "DAY"},
    #     )

    #     usage_plan_id = usage_plan_response["id"]

    api_gateway.create_usage_plan_key(
        usagePlanId=usage_plan_id, keyId=api_key_id, keyType="API_KEY"
    )
    time_now = datetime.now(timezone.utc)

    apikey_metadata = apikey_dynamodb.read_item({"user_id": user_id})
    if not apikey_metadata:
        apikey_metadata = {
            "user_id": user_id,
            "apikey": api_key,
            "apikey_id": api_key_id,
            "used": 0,
            "updated_at": "",
            "created_at": time_now.isoformat(),
        }
        apikey_dynamodb.create_item(apikey_metadata)
    else:
        api_gateway.delete_api_key(apiKey=apikey_metadata["apikey_id"])

        keys = {"user_id": user_id}
        update_data = {
            "apikey": api_key,
            "apikey_id": api_key_id,
            "updated_at": time_now.isoformat(),
        }
        apikey_dynamodb.update_item(keys, update_data)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {"api_key": api_key}


def delete_apikey_return_done(token_data):
    FUNCTION_NAME = "delete_apikey_return_done()"
    log.info("Entering {}".format(FUNCTION_NAME))

    user_id = token_data["$id"]

    apikey_metadata = apikey_dynamodb.read_item({"user_id": user_id})
    if not apikey_metadata:
        raise HTTPException(status_code=400, detail="No API key found")
    else:
        api_gateway.delete_api_key(apiKey=apikey_metadata["apikey_id"])
        apikey_dynamodb.delete_item({"user_id": user_id})

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {"status": "Done"}
