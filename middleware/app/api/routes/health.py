import api.services.health as health_service
import utils.logger as logger
from fastapi import APIRouter

router = APIRouter()

# Logger instance
log = logger.get_logger()


@router.get("/")
def health_check():
    """
    Perform checks to verify system health.
    For instance, check database connection, external services, etc.

    Parameters:
    - None

    Returns:
    - Status of application and external services
    """
    FUNCTION_NAME = "health_check()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = health_service.health_check()

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response
