import concurrent.futures
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

    file_names = list(upload_metadata["storage_file_metadata"].keys())

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_file_name = {
            executor.submit(_generate_download_url, upload_id, file_name): file_name
            for file_name in file_names
        }
        for future in concurrent.futures.as_completed(future_to_file_name):
            file_name = future_to_file_name[future]
            try:
                response = future.result()
                # file_format, file_size, file_url = future.result()

                if upload_metadata["share_email_as_source"]:
                    file_data["user_email"] = upload_metadata["creator_email"]
                else:
                    file_data["user_email"] = None
                file_data[file_name] = {}
                file_data[file_name]["format"] = response["file_format"]
                file_data[file_name]["size"] = helper.format_size(response["file_size"])
                file_data[file_name]["download_url"] = response["file_url"]
            except Exception as e:
                log.error(
                    "EXCEPTION occurred for Upload ID: {}\nFile {}: \nERROR:{}".format(
                        upload_id, file_name, str(e)
                    )
                )

    if token_data == None or upload_metadata["creator_id"] != token_data["$id"]:
        keys = {"upload_id": upload_id}
        update_data = {
            "download_count": download_count + 1,
            "updated_at": time_now,
        }
        dynamodb.update_item(keys, update_data)

    log.info("Exiting {}".format(FUNCTION_NAME))
    return file_data


def _generate_download_url(upload_id, file_name):
    FUNCTION_NAME = "_generate_download_url()"
    log.info("Entering {}".format(FUNCTION_NAME))

    file_path = upload_id + "/" + file_name

    file_format = helper.get_file_extension(file_name)
    file_size = storage.get_file_info(file_path)

    download_expiration_time = 21600  # 6 hours

    # Generate share download link
    file_url = storage.generate_download_url(file_path, download_expiration_time)

    log.info("Exiting {}".format(FUNCTION_NAME))

    return {"file_format": file_format, "file_size": file_size, "file_url": file_url}
