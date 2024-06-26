import api.services.webhook.user as user_service
import utils.logger as logger
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from utils.auth import authenticate_appwrite_webhook

router = APIRouter()

# Logger instance
log = logger.get_logger()


class AddUser(BaseModel):
    id: str = Field(..., alias="$id")
    name: str
    registration: str
    email: str


@router.post("/")
def webhook_post_user_send_email(
    body: AddUser,
    token_data: None = Depends(authenticate_appwrite_webhook),
):
    """
    Add new user to DB
    sends a welcome email to the user

    Parameters:
    - name: name of the user
    - registration: registeration date
    - email: email address of user

    Returns:
    - Sends a welcome email to the user.
    """
    FUNCTION_NAME = "webhook_post_user_send_email()"
    log.info("Entering {}".format(FUNCTION_NAME))

    user_service.webhook_post_user_send_email(body)

    log.info("Exiting {}".format(FUNCTION_NAME))
