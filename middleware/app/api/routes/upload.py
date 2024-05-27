import os
from enum import Enum as PythonEnum
from typing import List, Optional

import api.services.upload as upload_service
import utils.logger as logger
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from utils.auth import (authenticate, optional_authenticate,
                        preprocess_external_call)

router = APIRouter()

# Logger instance
log = logger.get_logger()


class StatusEnum(PythonEnum):
    initiated = "initiated"
    uploaded = "uploaded"


class InitiateUpload(BaseModel):
    file_names: List[str]
    share_email_as_source: bool


class FinaliseUpload(BaseModel):
    file_names: list
    receiver_email: str


class EditTitle(BaseModel):
    title: str


class FileMetadata(BaseModel):
    name: str
    size: int


class InitiateRealtimeUpload(BaseModel):
    files_metadata: List[FileMetadata]
    peer_id: str


@router.post("/initiate")
def initiate_upload(
    body: InitiateUpload,
    request: Request,
    x_api_key: Optional[str] = Header(None),
    token_data: None = Depends(optional_authenticate),
):
    """
    Batch initiate upload to Storage.
    get the list of files names to initiate upload for, checks for file size under limit for current user type, creates upload URL for upload and add to DB.
    Stores the file as <UPLOAD_ID>/<FILE_NAME> in Storage

    Parameters:
    - file_names: list of name of the file to be uploaded
    - File-Length: total file size of the uploaded file

    Returns:
    - List of Upload URL for upload and Upload id
    """
    FUNCTION_NAME = "initiate_upload()"
    log.info("Entering {}".format(FUNCTION_NAME))

    if x_api_key != os.getenv("AWS_API_KEY"):
        token_data = preprocess_external_call(x_api_key)

    if token_data is None:
        raise HTTPException(
            status_code=401,
            detail="Not authorised",
            headers={"WWW-Authenticate": "Bearer"},
        )

    response = upload_service.initiate_upload(token_data, body, request)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.post("/finalise/{upload_id}")
def post_upload_return_link_qr(
    body: FinaliseUpload,
    upload_id: str,
    x_api_key: Optional[str] = Header(None),
    token_data: None = Depends(optional_authenticate),
):
    """
    Post upload to Storage.
    Update status to DB, check for the file present in Storage, generate sharable link and QR, send the share link to email if given

    Parameters:
    - upload_id: upload id of the upload process
    - file_name: name of the file uploaded
    - receiver_email: receiver email address

    Returns:
    - Sharable Link and QR code of frontend page
    """
    FUNCTION_NAME = "post_upload_return_link_qr()"
    log.info("Entering {}".format(FUNCTION_NAME))

    if x_api_key != os.getenv("AWS_API_KEY"):
        token_data = preprocess_external_call(x_api_key)

    if token_data is None:
        raise HTTPException(
            status_code=401,
            detail="Not authorised",
            headers={"WWW-Authenticate": "Bearer"},
        )

    response = upload_service.post_upload_return_link_qr(token_data, body, upload_id)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.post("/realtime/initiate")
def initiate_realtime_upload_return_code(
    body: InitiateRealtimeUpload,
    request: Request,
    token_data: None = Depends(authenticate),
):
    """
    Initiate the Realtime peer to peer filesharing.
    Generate the receive code and add to queue table and metadata table in DB

    Parameters:
    - peer_id: sender peer id
    - files_metadata: list of file metadata

    Returns:
    - Recieve code and expires at
    """
    FUNCTION_NAME = "initiate_realtime_upload_return_code()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = upload_service.initiate_realtime_upload_return_code(
        token_data, body, request
    )

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.delete("/{upload_id}")
def delete_upload_return_done(
    upload_id: str,
    x_api_key: Optional[str] = Header(None),
    token_data: None = Depends(optional_authenticate),
):
    """
    Delete the upload of the user
    Reads the DB to find the upload and deletes.

    Parameters:
    - upload_id: upload id to be deleted

    Returns:
    - Done
    """
    FUNCTION_NAME = "delete_upload_return_done()"
    log.info("Entering {}".format(FUNCTION_NAME))

    if x_api_key != os.getenv("AWS_API_KEY"):
        token_data = preprocess_external_call(x_api_key)

    if token_data is None:
        raise HTTPException(
            status_code=401,
            detail="Not authorised",
            headers={"WWW-Authenticate": "Bearer"},
        )

    response = upload_service.delete_upload_return_done(token_data, upload_id)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.put("/{upload_id}/title")
def update_upload_title_return_done(
    body: EditTitle,
    upload_id: str,
    x_api_key: Optional[str] = Header(None),
    token_data: None = Depends(optional_authenticate),
):
    """
    Edit the upload title
    Find the upload with ID in DB and update with new title.

    Parameters:
    - title: new title
    - upload_id: upload id to be edited

    Returns:
    - Done
    """
    FUNCTION_NAME = "update_upload_title_return_done()"
    log.info("Entering {}".format(FUNCTION_NAME))

    if x_api_key != os.getenv("AWS_API_KEY"):
        token_data = preprocess_external_call(x_api_key)

    if token_data is None:
        raise HTTPException(
            status_code=401,
            detail="Not authorised",
            headers={"WWW-Authenticate": "Bearer"},
        )

    response = upload_service.update_upload_title_return_done(
        token_data, body, upload_id
    )

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.get("/history")
def get_history_return_all_shares_list(
    x_api_key: Optional[str] = Header(None),
    token_data: None = Depends(optional_authenticate),
):
    """
    Get history for a given User.
    Reads the DB to find all the shares made by the user.

    Parameters:
    - None

    Returns:
    - List of json of the transfer details.
    """
    FUNCTION_NAME = "get_history_return_all_shares_list()"
    log.info("Entering {}".format(FUNCTION_NAME))

    if x_api_key != os.getenv("AWS_API_KEY"):
        token_data = preprocess_external_call(x_api_key)

    if token_data is None:
        raise HTTPException(
            status_code=401,
            detail="Not authorised",
            headers={"WWW-Authenticate": "Bearer"},
        )

    response = upload_service.get_history_return_all_shares_list(token_data)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response
