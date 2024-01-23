from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from db import DynamoDBManager
from storage.s3_cloudfront import S3CloudfrontManager
from enum import Enum as PythonEnum
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from dotenv import load_dotenv
import uuid
import qrcode
import os


app = FastAPI()

# Load Environment variables
load_dotenv()

# CORS (Cross Origin Resource Sharing)
web_base_url = str(os.getenv("WEB_BASE_URL"))
origins = [web_base_url]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage
S3_BUCKET_NAME = "byteshare-blob"
storage = S3CloudfrontManager(S3_BUCKET_NAME)

# DynamoDB
table_name = "byteshare-upload-metadata"
subscriber_table_name = "byteshare-subscriber"
dynamodb = DynamoDBManager(table_name)
subscriber_dynamodb = DynamoDBManager(subscriber_table_name)


class StatusEnum(PythonEnum):
    initiated = "initiated"
    uploaded = "uploaded"


class Subscribe(BaseModel):
    email: str


class InitiateUpload(BaseModel):
    file_name: str
    creator_email: str
    creator_ip: str


@app.get("/health")
def health_check():
    """
    Perform checks to verify system health.
    For instance, check database connection, external services, etc.

    Parameters:
    - None

    Returns:
    - Status of application and external services
    """

    dynamodb.health_check()
    storage.health_check()

    return {"status": "ok", "details": "Service is running"}


@app.post("/subscribe")
def add_subscriber_return_done(body: Subscribe):
    """
    Adds new subscriber to DB.

    Parameters:
    - email: email of the subscriber

    Returns:
    - Done
    """

    subscriber = {
        "email": body.email,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    subscriber_dynamodb.create_item(subscriber)

    return {"status": "Done"}


@app.post("/initiateUpload")
def initiate_upload_return_upload_url(body: InitiateUpload, request: Request):
    """
    Initiate upload to Storage.
    checks for file size under limit for current user type, creates upload URL for upload and add to DB.
    Stores the file as <UPLOAD_ID>/<FILE_NAME> in Storage

    Parameters:
    - file_name: name of the file to be uploaded
    - creator_email: email of the creator
    - creator_ip: ip address of the creator
    - content-length: file size of the uploaded file

    Returns:
    - Upload URL for upload
    """

    content_length = request.headers.get("content-length")
    if content_length is None:
        raise HTTPException(status_code=400, detail="Content-Length header not found")

    max_file_size = 2 * 1024 * 1024 * 1024  # 2GB

    if int(content_length) > max_file_size:
        raise HTTPException(status_code=400, detail="File size exceeds the limit")

    file_name = body.file_name
    upload_id = uuid.uuid4().hex
    file_path = upload_id + "/" + file_name
    expiration_time = 10800
    upload_url = storage.generate_upload_url(file_path, expiration_time)

    time_now = datetime.now(timezone.utc)

    upload_metadata = {
        "upload_id": upload_id,
        "status": StatusEnum.initiated.name,
        "creator_email": body.creator_email,
        "creator_ip": body.creator_ip,
        "download_count": 0,
        "max_download": 5,
        "storage_file_name": file_name,
        "storage_qr_name": "",
        "expires_at": "",
        "updated_at": "",
        "created_at": time_now.isoformat(),
    }
    dynamodb.create_item(upload_metadata)

    return {"upload_url": upload_url, "upload_id": upload_id}


@app.post("/postUpload/{upload_id}")
def post_upload_return_link_qr(upload_id: str):
    """
    Post upload to Storage.
    Update status to DB, check for the file present in Storage, generate sharable link and QR

    Parameters:
    - upload_id: upload id of the upload process

    Returns:
    - Sharable Link and QR code of frontend page
    """

    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata == None:
        raise HTTPException(status_code=400, detail="Upload ID not valid")
    file_name = upload_metadata["storage_file_name"]
    file_path = upload_id + "/" + file_name
    upload_expiration_time = 604800  # 7 days

    # Check for file present in Storage
    is_file_present = storage.is_file_present(file_path)
    if not is_file_present:
        raise HTTPException(status_code=400, detail="Upload not found")

    # Generate share link
    file_url = web_base_url + "/share/" + upload_id

    time_now = datetime.now(timezone.utc)
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

    temp_qr_path = "{}.png".format(upload_id)
    img.save(temp_qr_path)

    qr_name = "QRCode.png"
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
    update_data = {
        "status": StatusEnum.uploaded.name,
        "storage_qr_name": qr_name,
        "expires_at": expires_at.isoformat(),
        "updated_at": time_now.isoformat(),
    }
    dynamodb.update_item(keys, update_data)

    return {"url": file_url, "QR": qr_download_url}


@app.get("/download/{upload_id}")
def get_file_url_return_name_link(upload_id: str):
    """
    Get download url from Storage.
    Checks for the expires at, download count < max download and updates the count in DB

    Parameters:
    - upload_id: upload id of the upload process

    Returns:
    - File name and download url
    """

    time_now = datetime.now(timezone.utc).isoformat()
    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata == None:
        raise HTTPException(status_code=400, detail="Upload ID not valid")

    expires_at = upload_metadata["expires_at"]
    if time_now > expires_at:
        raise HTTPException(status_code=400, detail="Link is expired")

    download_count = upload_metadata["download_count"]
    max_count = upload_metadata["max_download"]
    if download_count >= max_count:
        raise HTTPException(status_code=400, detail="Download limit exceeded")

    file_name = upload_metadata["storage_file_name"]
    file_path = upload_id + "/" + file_name
    download_expiration_time = 21600  # 6 hours

    # Generate share download link
    file_url = storage.generate_download_url(file_path, download_expiration_time)

    keys = {"upload_id": upload_id}
    update_data = {
        "download_count": download_count + 1,
        "updated_at": time_now.isoformat(),
    }
    dynamodb.update_item(keys, update_data)

    return {"file_name": file_name, "url": file_url}


def _get_file_extension(file_name):
    return file_name.split(".")[-1]


# Create a Handler from FastAPI for lambda.
handler = Mangum(app)
