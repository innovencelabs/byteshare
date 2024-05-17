import api.services.subscribe as subscribe_service
import utils.logger as logger
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Logger instance
log = logger.get_logger()


class Subscribe(BaseModel):
    email: str


@router.post("/")
def add_subscriber_return_done(body: Subscribe):
    """
    Adds new subscriber to DB.

    Parameters:
    - email: email of the subscriber

    Returns:
    - Done
    """
    FUNCTION_NAME = "add_subscriber_return_done()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = subscribe_service.add_subscriber_return_done(body)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response
