import concurrent.futures
import os
import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum as PythonEnum
from typing import List

import pika
import qrcode
import resend
import utils.helper as helper
import utils.logger as logger
from database.db import DynamoDBManager
from dotenv import load_dotenv
from fastapi import HTTPException, Request
from pydantic import BaseModel
from storage.cloudflare_r2 import CloudflareR2Manager

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
    share_email_as_source: bool


class FinaliseUpload(BaseModel):
    file_names: list
    receiver_email: str


class EditTitle(BaseModel):
    title: str


# Storage
BUCKET_NAME = "byteshare-blob"
storage = CloudflareR2Manager(BUCKET_NAME)

# DynamoDB
table_name = "byteshare-upload-metadata"
dynamodb = DynamoDBManager(table_name)

# RabbitMQ
if os.getenv("ENVIRONMENT") == "production":
    params = pika.URLParameters(os.getenv("RABBITMQ_URL"))
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=os.getenv("RABBITMQ_QUEUE"))

web_base_url = str(os.getenv("WEB_BASE_URL"))


def initiate_upload(
    token_data,
    body: InitiateUpload,
    request: Request,
):
    FUNCTION_NAME = "initiate_upload()"
    log.info("Entering {}".format(FUNCTION_NAME))

    client_ip = request.headers.get("x-forwarded-for") or request.client.host
    content_length = int(request.headers.get("File-Length"))
    if content_length is None:
        log.warning("BAD REQUEST: {}".format("file-Length header not found."))
        raise HTTPException(status_code=400, detail="file-Length header not found.")

    max_file_size = 2 * 1024 * 1024 * 1024  # 2GB

    if len(body.file_names) == 0:
        log.warning("BAD REQUEST: {}".format("No files present."))
        raise HTTPException(status_code=400, detail="No files present.")

    if int(content_length) > max_file_size:
        log.warning("BAD REQUEST: {}".format("File size exceeds the limit."))
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
        "creator_id": token_data["$id"],
        "creator_email": token_data["email"],
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


def post_upload_return_link_qr(token_data, body: FinaliseUpload, upload_id: str):
    FUNCTION_NAME = "post_upload_return_link_qr()"
    log.info("Entering {}".format(FUNCTION_NAME))

    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata == None:
        log.warning(
            "BAD REQUEST for UploadID: {} ERROR: {}".format(
                upload_id, "Upload ID not valid."
            )
        )
        raise HTTPException(status_code=400, detail="Upload ID not valid")
    if upload_metadata["status"] == StatusEnum.uploaded.name:
        log.warning(
            "BAD REQUEST for UploadID: {} ERROR: {}".format(
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
                "BAD REQUEST for UploadID: {} ERROR: {}".format(
                    upload_id, "Upload not found."
                )
            )
            raise HTTPException(status_code=400, detail="Upload not found")

    # Generate share link
    file_url = web_base_url + "/share/" + upload_id

    time_now = datetime.now(timezone.utc)
    upload_expiration_time = 604800  # 7 days
    expires_at = time_now + timedelta(seconds=upload_expiration_time)

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
        name = token_data["name"]
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

    if os.getenv("ENVIRONMENT") == "production":
        channel.basic_publish(
            exchange="", routing_key=os.getenv("RABBITMQ_QUEUE"), body=upload_id
        )

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {
        "url": file_url,
        "QR": qr_download_url,
        "expiration_date": expires_at.isoformat(),
        "downloads_allowed": str(upload_metadata["max_download"]),
    }


def delete_upload_return_done(token_data, upload_id: str):
    FUNCTION_NAME = "delete_upload_return_done()"
    log.info("Entering {}".format(FUNCTION_NAME))

    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata["creator_id"] != token_data["$id"]:
        log.warning(
            "BAD REQUEST for UploadID: {} ERROR: {}".format(
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


def update_upload_title_return_done(token_data, body: EditTitle, upload_id: str):
    FUNCTION_NAME = "update_upload_title_return_done()"
    log.info("Entering {}".format(FUNCTION_NAME))

    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata["creator_id"] != token_data["$id"]:
        log.warning(
            "BAD REQUEST for UploadID: {} ERROR: {}".format(
                upload_id, "User is not the owner of the upload."
            )
        )
        raise HTTPException(
            status_code=400, detail="User is not the owner of the upload"
        )
    if not body.title:
        log.warning(
            "BAD REQUEST for UploadID: {} ERROR: {}".format(
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


def get_history_return_all_shares_list(token_data):
    FUNCTION_NAME = "get_history_return_all_shares_list()"
    log.info("Entering {}".format(FUNCTION_NAME))

    history = []

    # Note: will be uncommented later
    # user = user_dynamodb.read_item({"user_id": user_id})
    # if(user==None):
    #     raise HTTPException(status_code=400, detail="User does not exist")

    upload_metadatas = dynamodb.read_items("creator_id", token_data["$id"])
    for upload_metadata in upload_metadatas:
        upload = {
            "upload_id": upload_metadata["upload_id"],
            "title": upload_metadata["title"],
            "created_at": upload_metadata["created_at"],
            "downloaded": upload_metadata["download_count"],
            "max_download": upload_metadata["max_download"],
            "total_size": helper.format_size(upload_metadata["total_size"]),
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


def _sort_by_date_desc(upload):
    return upload["created_at"]
