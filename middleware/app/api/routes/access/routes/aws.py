import api.services.access.aws as aws_service
import utils.logger as logger
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.auth import authenticate

router = APIRouter()

# Logger instance
log = logger.get_logger()


class Options(BaseModel):
    apiURL: str
    method: str
    jwtToken: str


@router.post("/")
def post_secured_access_aws_return_header(
    body: Options,
    token_data: None = Depends(authenticate),
):
    """
    Sign the request options

    Parameters:
    - apiURL: URL of the API endpoint
    - method: method of the API request
    - jwtToken: JWT token of the authorised user


    Returns:
    - Signed Header
    """
    FUNCTION_NAME = "post_secured_access_aws_return_header()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = aws_service.post_secured_access_aws_return_header(body)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response
