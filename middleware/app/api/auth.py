import os
import utils.logger as logger
from dotenv import load_dotenv
from typing import Optional
from fastapi import Header, HTTPException
from appwrite.client import Client
from appwrite.services.account import Account

# Load Environment variables
load_dotenv()

# Logger instance
log = logger.get_logger()


async def authenticate(authorization: Optional[str] = Header(None)):
    FUNCTION_NAME = "authenticate()"
    log.info("Entering {}".format(FUNCTION_NAME))

    if authorization is None:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_type, token = authorization.split()
    if token_type.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        client = Client()
        (
            client.set_endpoint(os.getenv("APPWRITE_URL"))
            .set_project(os.getenv("APPWRITE_PROJECT_ID"))
            .set_jwt(token)
        )

        account = Account(client)

        result = account.get()
        log.info("Authenticated.")
    except Exception as e:
        log.error("ERROR authenticating: {}".format(str(e)))
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    log.info("Exiting {}".format(FUNCTION_NAME))
