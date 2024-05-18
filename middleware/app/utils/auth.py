import base64
import os
from datetime import datetime, timezone
from typing import Optional

import utils.logger as logger
from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.users import Users
from database.db import DynamoDBManager
from dotenv import load_dotenv
from fastapi import Header, HTTPException

# Load Environment variables
load_dotenv()

# Logger instance
log = logger.get_logger()

# DynamoDB
table_name = "byteshare-apikey"
apikey_dynamodb = DynamoDBManager(table_name)


async def authenticate(
    x_auth_token: Optional[str] = Header(None), x_api_key: Optional[str] = Header(None)
):
    FUNCTION_NAME = "authenticate()"
    log.info("Entering {}".format(FUNCTION_NAME))

    if x_auth_token is None:
        raise HTTPException(
            status_code=401,
            detail="X-Auth-Token header is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if x_api_key != os.getenv("AWS_API_KEY"):
        raise HTTPException(
            status_code=403,
            detail="Given API Key not allowed",
        )

    try:
        token_type, token = x_auth_token.split()
        if token_type.lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        client = Client()
        (
            client.set_endpoint(os.getenv("APPWRITE_URL"))
            .set_project(os.getenv("APPWRITE_PROJECT_ID"))
            .set_jwt(token)
        )

        account = Account(client)

        log.info("Authenticated.")
        log.info("Exiting {}".format(FUNCTION_NAME))
        return account.get()

    except Exception as e:
        log.error("EXCEPTION authenticating: {}".format(str(e)))
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def optional_authenticate(x_auth_token: Optional[str] = Header(None)):
    FUNCTION_NAME = "optional_authenticate()"
    log.info("Entering {}".format(FUNCTION_NAME))

    if x_auth_token is None:
        return None

    try:
        token_type, token = x_auth_token.split()
        if token_type.lower() != "bearer":
            return None
        client = Client()
        (
            client.set_endpoint(os.getenv("APPWRITE_URL"))
            .set_project(os.getenv("APPWRITE_PROJECT_ID"))
            .set_jwt(token)
        )

        account = Account(client)

        log.info("Authenticated.")
        log.info("Exiting {}".format(FUNCTION_NAME))
        return account.get()

    except Exception as e:
        log.error("EXCEPTION authenticating: {}".format(str(e)))
        return None


async def authenticate_appwrite_webhook(authorization: Optional[str] = Header(None)):
    if authorization == None:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    try:
        auth_type, encoded_credentials = authorization.split(" ")
        if auth_type.lower() != "basic":
            raise HTTPException(
                status_code=401, detail="Only Basic authentication is supported"
            )

        decoded_credentials = base64.b64decode(encoded_credentials).decode("utf-8")
        username, password = decoded_credentials.split(":")

        if username != os.getenv("APPWRITE_WEBHOOK_USER") or password != os.getenv(
            "APPWRITE_WEBHOOK_PASS"
        ):
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials"
            )
    except ValueError:
        raise HTTPException(
            status_code=401, detail="Invalid authorization header format"
        )


async def authenticate_scan(x_auth_token: Optional[str] = Header(None)):
    if x_auth_token == None:
        raise HTTPException(status_code=401, detail="X-Auth-Token header is missing")

    try:
        auth_type, encoded_credentials = x_auth_token.split(" ")
        if auth_type.lower() != "basic":
            raise HTTPException(
                status_code=401, detail="Only Basic authentication is supported"
            )

        decoded_credentials = base64.b64decode(encoded_credentials).decode("utf-8")
        username, password = decoded_credentials.split(":")

        if username != os.getenv("SCAN_USER") or password != os.getenv("SCAN_PASS"):
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials"
            )
    except ValueError:
        raise HTTPException(
            status_code=401, detail="Invalid X-Auth-Token header format"
        )


async def preprocess_external_call(api_key: str):
    if api_key == os.getenv("AWS_API_KEY"):
        raise HTTPException(
            status_code=401,
            detail="Given API Key not allowed",
        )

    client = Client()
    client.set_endpoint(os.getenv("APPWRITE_URL"))
    client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
    client.set_key(os.getenv("APPWRITE_API_KEY"))

    users = Users(client)

    apikey_metadatas = apikey_dynamodb.read_items("apikey", api_key, "apikey-gsi")

    user_id = apikey_metadatas[0]["user_id"]
    used_per_apikey = apikey_metadatas[0]["used_per_apikey"]
    total_used = apikey_metadatas[0]["total_used"]

    result = users.get(user_id=user_id)
    time_now = datetime.now(timezone.utc)

    keys = {"user_id": user_id}
    update_data = {
        "used_per_apikey": used_per_apikey + 1,
        "total_used": total_used + 1,
        "last_used_per_apikey": time_now.isoformat(),
    }
    apikey_dynamodb.update_item(keys, update_data)

    return result
