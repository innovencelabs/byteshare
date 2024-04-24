from fastapi import APIRouter, Request, HTTPException, Depends
from database.db import DynamoDBManager
from api.auth import authenticate
from storage.cloudflare_r2 import CloudflareR2Manager
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from typing import List
import concurrent.futures
from enum import Enum as PythonEnum
from dotenv import load_dotenv
import utils.logger as logger
import qrcode
import resend
import pika
import uuid
import os

router = APIRouter()

# Logger instance
log = logger.get_logger()

# Load Environment variables
load_dotenv()

# Resend
resend.api_key = str(os.getenv("RESEND_API_KEY"))


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


# Storage
BUCKET_NAME = "byteshare-blob"
storage = CloudflareR2Manager(BUCKET_NAME)

# DynamoDB
table_name = "byteshare-upload-metadata"
dynamodb = DynamoDBManager(table_name)

# RabbitMQ
params = pika.URLParameters(os.getenv("RABBITMQ_URL"))
connection = pika.BlockingConnection(params)
channel = connection.channel()
channel.queue_declare(queue=os.getenv("RABBITMQ_QUEUE"))

web_base_url = str(os.getenv("WEB_BASE_URL"))


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

    client_ip = request.headers.get("x-forwarded-for") or request.client.host
    content_length = int(request.headers.get("File-Length"))
    if content_length is None:
        log.warning("BAD REQUEST\nERROR: {}".format("file-Length header not found."))
        raise HTTPException(status_code=400, detail="file-Length header not found.")

    max_file_size = 2 * 1024 * 1024 * 1024  # 2GB

    if len(body.file_names) == 0:
        log.warning("BAD REQUEST\nERROR: {}".format("No files present."))
        raise HTTPException(status_code=400, detail="No files present.")

    if int(content_length) > max_file_size:
        log.warning("BAD REQUEST\nERROR: {}".format("File size exceeds the limit."))
        raise HTTPException(status_code=400, detail="File size exceeds the limit.")

    file_names = body.file_names
    share_email_as_source = body.share_email_as_source
    upload_id = uuid.uuid4().hex
    continue_id = uuid.uuid4().hex

    result = {}
    result["upload_id"] = upload_id
    result["upload_urls"] = {}

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_file_name = {
            executor.submit(_generate, upload_id, file_name): file_name
            for file_name in file_names
        }

        responses = []
        for future in concurrent.futures.as_completed(future_to_file_name):
            file_name = future_to_file_name[future]
            try:
                response = future.result()
                responses.append(response)
            except Exception as e:
                log.error(
                    "EXCEPTION occurred for Upload ID: {}\nFile {}: \nERROR:{}".format(
                        upload_id, file_name, str(e)
                    )
                )

        for response in responses:
            result["upload_urls"][response["file_name"]] = response["upload_url"]

    time_now = datetime.now(timezone.utc)

    upload_metadata = {
        "upload_id": upload_id,
        "status": StatusEnum.initiated.name,
        "title": "Upload with " + file_names[0],
        "scanned": False,
        "creator_id": body.creator_id,
        "creator_email": body.creator_email,
        "creator_ip": client_ip,
        "receiver_email": "",
        "share_email_as_source": share_email_as_source,
        "download_count": 0,
        "max_download": 5,
        "continue_id": continue_id,
        "total_size": content_length,
        "storage_file_names": body.file_names,
        "storage_qr_name": "",
        "expires_at": "",
        "updated_at": "",
        "created_at": time_now.isoformat(),
    }
    dynamodb.create_item(upload_metadata)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return result


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

    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata == None:
        log.warning(
            "BAD REQUEST for UploadID: {}\nERROR: {}".format(
                upload_id, "Upload ID not valid."
            )
        )
        raise HTTPException(status_code=400, detail="Upload ID not valid")
    if upload_metadata["status"] == StatusEnum.uploaded.name:
        log.warning(
            "BAD REQUEST for UploadID: {}\nERROR: {}".format(
                upload_id, "Upload already completed."
            )
        )
        raise HTTPException(status_code=400, detail="Upload already completed")

    file_names = body.file_names
    for file_name in file_names:
        file_path = upload_id + "/" + file_name

        # Check for file present in Storage
        is_file_present = storage.is_file_present(file_path)
        if not is_file_present:
            log.warning(
                "BAD REQUEST for UploadID: {}\nERROR: {}".format(
                    upload_id, "Upload not found."
                )
            )
            raise HTTPException(status_code=400, detail="Upload not found")

    # Generate share link
    file_url = web_base_url + "/share/" + upload_id

    time_now = datetime.now(timezone.utc)
    upload_expiration_time = 604800  # 7 days
    expires_at = time_now + timedelta(seconds=upload_expiration_time)
    formatted_expires_at = expires_at.strftime("%B %d, %Y UTC")

    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(file_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    temp_qr_path = "/tmp/" + "{}.png".format(upload_id)
    img.save(temp_qr_path)

    qr_name = "QRCode_" + upload_id + ".png"
    qr_storage_file_name = upload_id + "/" + qr_name

    # Upload the QR code to Storage
    storage.upload_file(temp_qr_path, qr_storage_file_name)

    # Remove the local file
    os.remove(temp_qr_path)

    # Generate Download URL for the uploaded QR code
    qr_download_url = storage.generate_download_url(
        qr_storage_file_name, upload_expiration_time
    )

    keys = {"upload_id": upload_id}
    if body.receiver_email:
        update_data = {
            "status": StatusEnum.uploaded.name,
            "receiver_email": body.receiver_email,
            "storage_qr_name": qr_name,
            "expires_at": expires_at.isoformat(),
            "updated_at": time_now.isoformat(),
        }
    else:
        update_data = {
            "status": StatusEnum.uploaded.name,
            "storage_qr_name": qr_name,
            "expires_at": expires_at.isoformat(),
            "updated_at": time_now.isoformat(),
        }
    dynamodb.update_item(keys, update_data)

    # Send the share link to email, if given
    if body.receiver_email:
        name = body.sender_name
        params = {
            "from": "ByteShare <share@byteshare.io>",
            "to": [body.receiver_email],
            "subject": "You've Received a File from {}".format(name),
            "html": """
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
            <p>Hey,</p>

            <p style="font-size: 18px;"></p>

            <p>You have received a file via ByteShare, a secure file sharing platform.</p> 
            
            <p><b>{}</b> has sent you a file. You can download it using the link below:</p>

            <p><b>{}</b></p>

            <p>Please note that this link will expire after {}, so be sure to download the file promptly.</p>

            <p>If you have any questions or concerns, feel free to contact us at contact@byteshare.io</p>
            <p>Thank you for using ByteShare!</p>

            <p>Best regards,<br/>
            The ByteShare Team</p>

            </body>
            """.format(
                name, file_url, expires_at.isoformat()
            ),
        }

        resend.Emails.send(params)

    channel.basic_publish(
        exchange="", routing_key=os.getenv("RABBITMQ_QUEUE"), body=upload_id
    )

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {
        "url": file_url,
        "QR": qr_download_url,
        "expiration_date": formatted_expires_at,
        "downloads_allowed": str(upload_metadata["max_download"]),
    }


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

    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata["creator_id"] != body.user_id:
        log.warning(
            "BAD REQUEST for UploadID: {}\nERROR: {}".format(
                upload_id, "User is not the owner of the upload."
            )
        )
        raise HTTPException(
            status_code=400, detail="User is not the owner of the upload"
        )

    keys = {"upload_id": upload_id}
    dynamodb.delete_item(keys)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {"status": "Done"}


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

    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata["creator_id"] != body.user_id:
        log.warning(
            "BAD REQUEST for UploadID: {}\nERROR: {}".format(
                upload_id, "User is not the owner of the upload."
            )
        )
        raise HTTPException(
            status_code=400, detail="User is not the owner of the upload"
        )
    if not body.title:
        log.warning(
            "BAD REQUEST for UploadID: {}\nERROR: {}".format(
                upload_id, "Title is not valid."
            )
        )
        raise HTTPException(status_code=400, detail="Title is not valid")

    time_now = datetime.now(timezone.utc)

    keys = {"upload_id": upload_id}
    update_data = {
        "title": body.title,
        "updated_at": time_now.isoformat(),
    }
    dynamodb.update_item(keys, update_data)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {"status": "Done"}


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

    history = []

    # Note: will be uncommented later
    # user = user_dynamodb.read_item({"user_id": user_id})
    # if(user==None):
    #     raise HTTPException(status_code=400, detail="User does not exist")

    upload_metadatas = dynamodb.read_items("creator_id", user_id)
    for upload_metadata in upload_metadatas:
        upload = {
            "upload_id": upload_metadata["upload_id"],
            "title": upload_metadata["title"],
            "created_at": upload_metadata["created_at"],
            "downloaded": upload_metadata["download_count"],
            "max_download": upload_metadata["max_download"],
            "total_size": _format_size(upload_metadata["total_size"]),
        }

        history.append(upload)

        # Sort the history by date in place
        history.sort(key=_sort_by_date_desc, reverse=True)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return history


def _generate(upload_id, file_name):
    FUNCTION_NAME = "_generate()"
    log.info("Entering {}".format(FUNCTION_NAME))

    expiration_time = 10800
    file_path = upload_id + "/" + file_name
    upload_url = storage.generate_upload_url(file_path, expiration_time)

    response_url = {"file_name": file_name, "upload_url": upload_url}

    log.info("File name: {} completed".format(file_name))

    log.info("Exiting {}".format(FUNCTION_NAME))
    return response_url


def _format_size(byte_size):
    if byte_size < 1024:
        return f"{byte_size} B"
    elif byte_size < 1024**2:
        return f"{byte_size / 1024:.2f} KB"
    elif byte_size < 1024**3:
        return f"{byte_size / (1024 ** 2):.2f} MB"
    else:
        return f"{byte_size / (1024 ** 3):.2f} GB"


def _sort_by_date_desc(upload):
    return upload["created_at"]
