from datetime import datetime, timezone
from enum import Enum as PythonEnum

import utils.helper as helper
import utils.logger as logger
from database.db import DynamoDBManager
from fastapi import HTTPException
from storage.cloudflare_r2 import CloudflareR2Manager

# Logger instance
log = logger.get_logger()

# Storage
BUCKET_NAME = "byteshare-blob"
storage = CloudflareR2Manager(BUCKET_NAME)

# DynamoDB
table_name = "byteshare-upload-metadata"
dynamodb = DynamoDBManager(table_name)

queue_table_name = "byteshare-queue"
queue_dynamodb = DynamoDBManager(queue_table_name)


class StatusEnum(PythonEnum):
    initiated = "initiated"
    uploaded = "uploaded"


def get_file_url_return_name_link(token_data, upload_id: str):
    FUNCTION_NAME = "get_file_url_return_name_link()"
    log.info("Entering {}".format(FUNCTION_NAME))

    file_data = {}
    time_now = datetime.now(timezone.utc).isoformat()
    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata == None:
        log.warning(
            "BAD REQUEST for UploadID: {} ERROR: {}".format(
                upload_id, "Upload ID not valid."
            )
        )
        raise HTTPException(status_code=400, detail="Upload ID not valid")
    if upload_metadata["status"] != StatusEnum.uploaded.name:
        log.warning(
            "BAD REQUEST for UploadID: {} ERROR: {}".format(
                upload_id, "Incomplete upload."
            )
        )
        raise HTTPException(status_code=400, detail="Incomplete upload")

    expires_at = upload_metadata["expires_at"]
    if time_now > expires_at:
        log.warning(
            "BAD REQUEST for UploadID: {} ERROR: {}".format(
                upload_id, "Link is expired."
            )
        )
        raise HTTPException(status_code=400, detail="Link is expired")

    download_count = upload_metadata["download_count"]
    max_count = upload_metadata["max_download"]
    if token_data == None or upload_metadata["creator_id"] != token_data["$id"]:
        if download_count >= max_count:
            log.warning(
                "BAD REQUEST for UploadID: {} ERROR: {}".format(
                    upload_id, "Download limit exceeded"
                )
            )
            raise HTTPException(status_code=400, detail="Download limit exceeded")

    file_names = set(upload_metadata["storage_file_names"])
    for file_name in file_names:
        file_path = upload_id + "/" + file_name

        file_format = helper.get_file_extension(file_name)
        file_size = storage.get_file_info(file_path)

        download_expiration_time = 21600  # 6 hours
        # Generate share download link
        file_url = storage.generate_download_url(file_path, download_expiration_time)
        if upload_metadata["share_email_as_source"]:
            file_data["user_email"] = upload_metadata["creator_email"]
        else:
            file_data["user_email"] = None
        file_data[file_name] = {}
        file_data[file_name]["format"] = file_format
        file_data[file_name]["size"] = helper.format_size(file_size)
        file_data[file_name]["download_url"] = file_url

    if token_data == None or upload_metadata["creator_id"] != token_data["$id"]:
        keys = {"upload_id": upload_id}
        update_data = {
            "download_count": download_count + 1,
            "updated_at": time_now,
        }
        dynamodb.update_item(keys, update_data)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return file_data


def get_sender_return_peer_id(token_data, code: str):
    FUNCTION_NAME = "get_sender_return_peer_id()"
    log.info("Entering {}".format(FUNCTION_NAME))

    queue_response = queue_dynamodb.read_item({"code": code})
    if queue_response == None:
        log.warning(
            "BAD REQUEST for Code: {} ERROR: {}".format(
                code, "Code not valid or expired."
            )
        )
        raise HTTPException(status_code=400, detail="Code not valid or expired")

    time_now = datetime.now(timezone.utc)

    keys = {"code": code}
    update_data = {
        "download_count": 1,
        "updated_at": time_now.isoformat(),
    }
    dynamodb.update_item(keys, update_data)

    sender_peer_id = queue_response["sender_peer_id"]

    log.info("Exiting {}".format(FUNCTION_NAME))
    return {"sender_peer_id": sender_peer_id}
