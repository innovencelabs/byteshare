import os
from typing import Optional

import api.services.subscribe as subscribe_service
import utils.logger as logger
from fastapi import APIRouter, Header
from pydantic import BaseModel
from utils.auth import preprocess_external_call

router = APIRouter()

# Logger instance
log = logger.get_logger()


class Subscribe(BaseModel):
    email: str


@router.post("/")
def add_subscriber_return_done(
    body: Subscribe,
    x_api_key: Optional[str] = Header(None),
):
    """
    Adds new subscriber to DB.

    Parameters:
    - email: email of the subscriber

    Returns:
    - Done
    """
    FUNCTION_NAME = "add_subscriber_return_done()"
    log.info("Entering {}".format(FUNCTION_NAME))

    if x_api_key != os.getenv("AWS_API_KEY"):
        preprocess_external_call(x_api_key)

    response = subscribe_service.add_subscriber_return_done(body)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response
