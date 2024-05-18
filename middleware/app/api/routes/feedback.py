import os
from typing import Optional

import api.services.feedback as feedback_service
import utils.logger as logger
from fastapi import APIRouter, Header
from pydantic import BaseModel
from utils.auth import preprocess_external_call

router = APIRouter()

# Logger instance
log = logger.get_logger()


class Feedback(BaseModel):
    name: str
    email: str
    message: str


@router.post("/")
def post_feedback_return_none(
    body: Feedback,
    x_api_key: Optional[str] = Header(None),
):
    """
    Add feedback received from users to DB

    Parameters:
    - name: name of the user
    - email: email address of user
    - message: feedback


    Returns:
    - None
    """
    FUNCTION_NAME = "post_feedback_return_none()"
    log.info("Entering {}".format(FUNCTION_NAME))

    if x_api_key != os.getenv("AWS_API_KEY"):
        preprocess_external_call(x_api_key)

    feedback_service.post_feedback_return_none(body)

    log.info("Exiting {}".format(FUNCTION_NAME))
