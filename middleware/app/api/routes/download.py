from enum import Enum as PythonEnum

import api.services.download as download_service
import utils.logger as logger
from fastapi import APIRouter

router = APIRouter()

# Logger instance
log = logger.get_logger()


class StatusEnum(PythonEnum):
    initiated = "initiated"
    uploaded = "uploaded"


@router.get("/{upload_id}")
def get_file_url_return_name_link(upload_id: str, user_id: str | None = None):
    """
    Get download url from Storage.
    Checks for the expires at, download count < max download and updates the count in DB

    Parameters:
    - upload_id: upload id of the upload process
    - user_id: user id of the user(Optional)

    Returns:
    - File details and download url
    """
    FUNCTION_NAME = "get_file_url_return_name_link()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = download_service.get_file_url_return_name_link(upload_id, user_id)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response
