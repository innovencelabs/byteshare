from enum import Enum as PythonEnum
from typing import List

import api.services.upload as upload_service
import utils.logger as logger
from api.auth import authenticate
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

router = APIRouter()

# Logger instance
log = logger.get_logger()


class StatusEnum(PythonEnum):
    initiated = "initiated"
    uploaded = "uploaded"


class InitiateUpload(BaseModel):
    file_names: List[str]
    creator_id: str
    creator_email: str
    creator_ip: str
    share_email_as_source: bool


class FinaliseUpload(BaseModel):
    file_names: list
    receiver_email: str
    sender_name: str


class EditTitle(BaseModel):
    title: str
    user_id: str


class DeleteUpload(BaseModel):
    user_id: str


@router.post("/initiate")
def initiate_upload(
    body: InitiateUpload,
    request: Request,
    token_data: None = Depends(authenticate),
):
    """
    Batch initiate upload to Storage.
    get the list of files names to initiate upload for, checks for file size under limit for current user type, creates upload URL for upload and add to DB.
    Stores the file as <UPLOAD_ID>/<FILE_NAME> in Storage

    Parameters:
    - file_names: list of name of the file to be uploaded
    - creator_email: email of the creator
    - creator_ip: ip address of the creator
    - File-Length: total file size of the uploaded file

    Returns:
    - List of Upload URL for upload and Upload id
    """
    FUNCTION_NAME = "initiate_upload()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = upload_service.initiate_upload(body, request)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.post("/finalise/{upload_id}")
def post_upload_return_link_qr(
    body: FinaliseUpload, upload_id: str, token_data: None = Depends(authenticate)
):
    """
    Post upload to Storage.
    Update status to DB, check for the file present in Storage, generate sharable link and QR, send the share link to email if given

    Parameters:
    - upload_id: upload id of the upload process
    - file_name: name of the file uploaded
    - receiver_email: receiver email address
    - user_id: user id of the sender

    Returns:
    - Sharable Link and QR code of frontend page
    """
    FUNCTION_NAME = "post_upload_return_link_qr()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = upload_service.post_upload_return_link_qr(body, upload_id)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.delete("/{upload_id}")
def delete_upload_return_done(
    upload_id: str, body: DeleteUpload, token_data: None = Depends(authenticate)
):
    """
    Delete the upload of the user
    Reads the DB to find the upload and deletes.

    Parameters:
    - user_id: user id
    - upload_id: upload id to be deleted

    Returns:
    - Done
    """
    FUNCTION_NAME = "delete_upload_return_done()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = upload_service.delete_upload_return_done(upload_id, body)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.put("/{upload_id}/title")
def update_upload_title_return_done(
    body: EditTitle, upload_id: str, token_data: None = Depends(authenticate)
):
    """
    Edit the upload title
    Find the upload with ID in DB and update with new title.

    Parameters:
    - title: new title
    - user_id: user id
    - upload_id: upload id to be edited

    Returns:
    - Done
    """
    FUNCTION_NAME = "update_upload_title_return_done()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = upload_service.update_upload_title_return_done(body, upload_id)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response


@router.get("/history/{user_id}")
def get_history_return_all_shares_list(
    user_id: str, token_data: None = Depends(authenticate)
):
    """
    Get history for a given User.
    Reads the DB to find all the shares made by the user.

    Parameters:
    - user_id: user id

    Returns:
    - List of json of the transfer details.
    """
    FUNCTION_NAME = "get_history_return_all_shares_list()"
    log.info("Entering {}".format(FUNCTION_NAME))

    response = upload_service.get_history_return_all_shares_list(user_id)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response
