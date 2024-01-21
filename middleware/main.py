from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from db import DynamoDBManager
from enum import Enum as PythonEnum
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from dotenv import load_dotenv
import boto3
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

# S3 client
s3_client = boto3.client("s3")
S3_BUCKET_NAME = "byteshare-blob"

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

    try:
        dynamodb = boto3.client("dynamodb")
        dynamodb.list_tables()
    except Exception as e:
        print(f"Database connection failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Database connection failed")

    try:
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME)
    except Exception as e:
        print(f"S3 connection failed: {str(e)}")
        raise HTTPException(status_code=503, detail="S3 connection failed")

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
def initiate_upload_return_presigned_url(body: InitiateUpload, request: Request):
    """
    Initiate upload to S3.
    checks for file size under limit for current user type, creates presigned URL for upload and add to DB.
    Stores the file as <UPLOAD_ID>/<FILE_NAME> in S3

    Parameters:
    - file_name: name of the file to be uploaded
    - creator_email: email of the creator
    - creator_ip: ip address of the creator
    - content-length: file size of the uploaded file

    Returns:
    - Presigned URL for upload
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
    presigned_url = s3_client.generate_presigned_url(
        "put_object",
        Params={"Bucket": S3_BUCKET_NAME, "Key": file_path},
        ExpiresIn=expiration_time,
        HttpMethod="PUT",
    )

    time_now = datetime.now(timezone.utc)

    upload_metadata = {
        "upload_id": upload_id,
        "status": StatusEnum.initiated.name,
        "creator_email": body.creator_email,
        "creator_ip": body.creator_ip,
        "download_count": 0,
        "max_download": 5,
        "s3_file_name": file_name,
        "s3_qr_name": "",
        "expires_at": "",
        "updated_at": "",
        "created_at": time_now.isoformat(),
    }
    dynamodb.create_item(upload_metadata)

    return {"presigned_url": presigned_url, "upload_id": upload_id}


@app.post("/postUpload/{upload_id}")
def post_upload_return_link_qr(upload_id: str):
    """
    Post upload to S3.
    Update status to DB, check for the file present in S3, generate sharable link and QR

    Parameters:
    - upload_id: upload id of the upload process

    Returns:
    - Sharable Link and QR code of frontend page
    """

    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata == None:
        raise HTTPException(status_code=400, detail="Upload ID not valid")
    file_name = upload_metadata["s3_file_name"]
    file_path = upload_id + "/" + file_name
    upload_expiration_time = 604800  # 7 days

    # Check for file present in S3
    try:
        response = s3_client.head_object(Bucket=S3_BUCKET_NAME, Key=file_path)
    except s3_client.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "404":
            print(f"File '{file_path}' does not exist in bucket '{S3_BUCKET_NAME}'")
            raise HTTPException(status_code=400, detail="Upload not found")
        else:
            print("Error in checking availability in S3: " + e)
            raise HTTPException(
                status_code=500, detail="Internal error connecting to S3"
            )

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
    qr_s3_file_name = upload_id + "/" + qr_name

    # Upload the QR code to S3
    try:
        s3_client.upload_file(temp_qr_path, S3_BUCKET_NAME, qr_s3_file_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    # Remove the local file
    os.remove(temp_qr_path)

    # Generate presigned URL for the uploaded QR code
    qr_presigned_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": S3_BUCKET_NAME, "Key": qr_s3_file_name},
        ExpiresIn=upload_expiration_time,
    )

    keys = {"upload_id": upload_id}
    update_data = {
        "status": StatusEnum.uploaded.name,
        "s3_qr_name": qr_name,
        "expires_at": expires_at.isoformat(),
        "updated_at": time_now.isoformat(),
    }
    dynamodb.update_item(keys, update_data)

    return {"url": file_url, "QR": qr_presigned_url}


@app.get("/fileURL/{upload_id}")
def get_file_url_return_name_link(upload_id: str):
    """
    Get presigned file url from S3.
    Checks for the expires at, download count < max download and updates the count in DB

    Parameters:
    - upload_id: upload id of the upload process

    Returns:
    - File name and presigned url
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

    file_name = upload_metadata["s3_file_name"]
    file_path = upload_id + "/" + file_name
    upload_expiration_time = 86400  # 1 days

    # Generate share presigned link
    file_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": S3_BUCKET_NAME, "Key": file_path},
        ExpiresIn=upload_expiration_time,
    )

    keys = {"upload_id": upload_id}
    update_data = {
        "download_count": download_count + 1,
        "updated_at": time_now.isoformat()
    }
    dynamodb.update_item(keys, update_data)

    return {"file_name": file_name, "url": file_url}


def _get_file_extension(file_name):
    return file_name.split(".")[-1]


# Create a Handler from FastAPI for lambda.
handler = Mangum(app)
