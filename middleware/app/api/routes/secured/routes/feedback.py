import api.services.secured.feedback as feedback_service
import utils.logger as logger
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Logger instance
log = logger.get_logger()


class Feedback(BaseModel):
    name: str
    email: str
    message: str


@router.post("/")
def post_feedback_return_none(body: Feedback):
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

    feedback_service.post_feedback_return_none(body)

    log.info("Exiting {}".format(FUNCTION_NAME))
