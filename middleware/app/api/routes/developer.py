import api.services.developer as developer_service
import utils.logger as logger
from fastapi import APIRouter, Depends
from utils.auth import authenticate

router = APIRouter()

# Logger instance
log = logger.get_logger()

# Note: No API key get endpoint because the user can see the API key only once.


@router.get("/apikey")
def get_apikey_return_apikey(token_data: None = Depends(authenticate)):
    """
    Checks if API key is present for the user.
    Checks in the DB if API key is present.

    Parameters:
    - None

    Returns:
    - Status of API key already present.
    """
    FUNCTION_NAME = "get_apikey_return_apikey()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = developer_service.get_apikey_return_apikey(token_data)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.post("/apikey")
def create_apikey_return_apikey(token_data: None = Depends(authenticate)):
    """
    Create API key for users.
    Create API key in API Gateway and DB, if already present will replace it with new one

    Parameters:
    - None

    Returns:
    - API key
    """
    FUNCTION_NAME = "create_apikey_return_apikey()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = developer_service.create_apikey_return_apikey(token_data)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.delete("/apikey")
def delete_apikey_return_done(token_data: None = Depends(authenticate)):
    """
    Delete API key.
    Check if API key is present and deletes

    Parameters:
    - None

    Returns:
    - Done
    """
    FUNCTION_NAME = "delete_apikey_return_done()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = developer_service.delete_apikey_return_done(token_data)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response
