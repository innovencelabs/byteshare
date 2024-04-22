from fastapi import APIRouter
from database.db import DynamoDBManager
from datetime import datetime, timezone
from fastapi import HTTPException
from enum import Enum as PythonEnum
from storage.cloudflare_r2 import CloudflareR2Manager

router = APIRouter()

# Storage
BUCKET_NAME = "byteshare-blob"
storage = CloudflareR2Manager(BUCKET_NAME)

# DynamoDB
table_name = "byteshare-upload-metadata"
dynamodb = DynamoDBManager(table_name)


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

    file_data = {}
    time_now = datetime.now(timezone.utc).isoformat()
    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata == None:
        raise HTTPException(status_code=400, detail="Upload ID not valid")
    if upload_metadata["status"] != StatusEnum.uploaded.name:
        raise HTTPException(status_code=400, detail="It is an incomplete upload")

    expires_at = upload_metadata["expires_at"]
    if time_now > expires_at:
        raise HTTPException(status_code=400, detail="Link is expired")

    download_count = upload_metadata["download_count"]
    max_count = upload_metadata["max_download"]
    if user_id == None or upload_metadata["creator_id"] != user_id:
        if download_count >= max_count:
            raise HTTPException(status_code=400, detail="Download limit exceeded")

    file_names = set(upload_metadata["storage_file_names"])
    for file_name in file_names:
        file_path = upload_id + "/" + file_name

        file_format = _get_file_extension(file_name)
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
        file_data[file_name]["size"] = _format_size(file_size)
        file_data[file_name]["download_url"] = file_url

    if user_id == None or upload_metadata["creator_id"] != user_id:
        keys = {"upload_id": upload_id}
        update_data = {
            "download_count": download_count + 1,
            "updated_at": time_now,
        }
        dynamodb.update_item(keys, update_data)

    return file_data


def _get_file_extension(file_name):
    return file_name.split(".")[-1]


def _format_size(byte_size):
    if byte_size < 1024:
        return f"{byte_size} B"
    elif byte_size < 1024**2:
        return f"{byte_size / 1024:.2f} KB"
    elif byte_size < 1024**3:
        return f"{byte_size / (1024 ** 2):.2f} MB"
    else:
        return f"{byte_size / (1024 ** 3):.2f} GB"
