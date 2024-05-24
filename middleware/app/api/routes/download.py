import os
from enum import Enum as PythonEnum
from typing import Optional

import api.services.download as download_service
import utils.logger as logger
from fastapi import APIRouter, Depends, Header, HTTPException
from utils.auth import optional_authenticate, preprocess_external_call

router = APIRouter()

# Logger instance
log = logger.get_logger()


class StatusEnum(PythonEnum):
    initiated = "initiated"
    uploaded = "uploaded"


@router.get("/realtime/{code}")
def get_sender_return_peer_id(
    code: str,
    x_api_key: Optional[str] = Header(None),
    token_data: None = Depends(optional_authenticate),
):
    """
    Get sender details from DB.

    Parameters:
    - code: receive code

    Returns:
    - Sender peer id
    """
    FUNCTION_NAME = "get_sender_return_peer_id()"
    log.info("Entering {}".format(FUNCTION_NAME))

    if x_api_key != os.getenv("AWS_API_KEY"):
        raise HTTPException(status_code=400, detail="API Key not allowed")

    response = download_service.get_sender_return_peer_id(token_data, code)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.get("/{upload_id}")
def get_file_url_return_name_link(
    upload_id: str,
    x_api_key: Optional[str] = Header(None),
    token_data: None = Depends(optional_authenticate),
):
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

    if x_api_key != os.getenv("AWS_API_KEY"):
        token_data = preprocess_external_call(x_api_key)

    response = download_service.get_file_url_return_name_link(token_data, upload_id)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response
