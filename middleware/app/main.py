import os
import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum as PythonEnum
from typing import Optional

import qrcode
import resend
from appwrite.client import Client
from appwrite.services.account import Account
from db import DynamoDBManager
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel, Field
from storage.cloudflare_r2 import CloudflareR2Manager

app = FastAPI()

# Load Environment variables
load_dotenv()

# CORS (Cross Origin Resource Sharing) (for local)
web_base_url = str(os.getenv("WEB_BASE_URL"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resend
resend.api_key = str(os.getenv("RESEND_API_KEY"))

# Storage
BUCKET_NAME = "byteshare-blob"
storage = CloudflareR2Manager(BUCKET_NAME)

# DynamoDB
table_name = "byteshare-upload-metadata"
user_table_name = "byteshare-user"
subscriber_table_name = "byteshare-subscriber"
feedback_table_name = "byteshare-feedback"
dynamodb = DynamoDBManager(table_name)
user_dynamodb = DynamoDBManager(user_table_name)
subscriber_dynamodb = DynamoDBManager(subscriber_table_name)
feedback_dynamodb = DynamoDBManager(feedback_table_name)


class StatusEnum(PythonEnum):
    initiated = "initiated"
    uploaded = "uploaded"


class Subscribe(BaseModel):
    email: str


class InitiateUpload(BaseModel):
    file_name: str
    creator_id: str
    creator_email: str
    creator_ip: str
    share_email_as_source: bool


class ContinueUpload(BaseModel):
    file_name: str
    continue_id: str


class PostUpload(BaseModel):
    file_names: list
    receiver_email: str
    sender_name: str


class AddUser(BaseModel):
    id: str = Field(..., alias="$id")
    name: str
    registration: str
    email: str


class Feedback(BaseModel):
    name: str
    email: str
    message: str


class DeleteUpload(BaseModel):
    user_id: str


async def _authenticate(authorization: Optional[str] = Header(None)):
    if authorization is None:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_type, token = authorization.split()
    if token_type.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        client = Client()
        (
            client.set_endpoint(os.getenv("APPWRITE_URL"))
            .set_project(os.getenv("APPWRITE_PROJECT_ID"))
            .set_jwt(token)
        )

        account = Account(client)

        result = account.get()

        print(result)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


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
def initiate_upload_return_upload_url(
    body: InitiateUpload, request: Request, token_data: None = Depends(_authenticate)
):
    """
    Initiate upload to Storage.
    checks for file size under limit for current user type, creates upload URL for upload and add to DB.
    Stores the file as <UPLOAD_ID>/<FILE_NAME> in Storage

    Parameters:
    - file_name: name of the file to be uploaded
    - creator_email: email of the creator
    - creator_ip: ip address of the creator
    - Fontent-Length: file size of the uploaded file

    Returns:
    - Upload URL for upload and Upload id
    """
    client_ip = request.headers.get("x-forwarded-for") or request.client.host
    content_length = int(request.headers.get("File-Length"))
    if content_length is None:
        raise HTTPException(status_code=400, detail="file-Length header not found.")

    max_file_size = 2 * 1024 * 1024 * 1024  # 2GB

    if int(content_length) > max_file_size:
        raise HTTPException(status_code=400, detail="File size exceeds the limit.")

    file_name = body.file_name
    share_email_as_source = body.share_email_as_source
    upload_id = uuid.uuid4().hex
    continue_id = uuid.uuid4().hex
    file_path = upload_id + "/" + file_name
    expiration_time = 10800
    upload_url = storage.generate_upload_url(file_path, expiration_time)

    time_now = datetime.now(timezone.utc)

    upload_metadata = {
        "upload_id": upload_id,
        "status": StatusEnum.initiated.name,
        "title": "Upload with " + file_name,
        "creator_id": body.creator_id,
        "creator_email": body.creator_email,
        "creator_ip": client_ip,
        "receiver_email": "",
        "share_email_as_source": share_email_as_source,
        "download_count": 0,
        "max_download": 5,
        "continue_id": continue_id,
        "total_size": content_length,
        "storage_file_names": [file_name],
        "storage_qr_name": "",
        "expires_at": "",
        "updated_at": "",
        "created_at": time_now.isoformat(),
    }
    dynamodb.create_item(upload_metadata)

    return {
        "upload_url": upload_url,
        "upload_id": upload_id,
        "continue_id": continue_id,
    }


@app.post("/initiateUpload/{upload_id}")
def initiate_upload_with_upload_id_return_upload_url(
    body: ContinueUpload,
    upload_id: str,
    request: Request,
    token_data: None = Depends(_authenticate),
):
    """
    Initiate upload to Storage for existing upload_id.
    checks for file size under limit for current user type, creates upload URL for upload and add to DB.
    Stores the file as <UPLOAD_ID>/<FILE_NAME> in Storage

    Parameters:
    - upload_id: upload id of the upload process
    - file_name: name of the file to be uploaded
    - continue_id: continue id to continue multifile upload
    - creator_email: email of the creator
    - creator_ip: ip address of the creator
    - content-length: file size of the uploaded file

    Returns:
    - Upload URL for upload
    """

    content_length = int(request.headers.get("File-Length"))
    if content_length is None:
        raise HTTPException(status_code=400, detail="File-Length header not found")

    max_file_size = 2 * 1024 * 1024 * 1024  # 2GB

    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata == None:
        raise HTTPException(status_code=400, detail="Upload ID not valid")
    if upload_metadata["continue_id"] != body.continue_id:
        raise HTTPException(status_code=400, detail="Continue ID not valid")

    if int(content_length) + int(upload_metadata["total_size"]) > max_file_size:
        raise HTTPException(status_code=400, detail="File size exceeds the limit")

    file_name = body.file_name
    file_path = upload_id + "/" + file_name
    expiration_time = 10800
    upload_url = storage.generate_upload_url(file_path, expiration_time)
    storage_file_names = list(
        upload_metadata["storage_file_names"]
        if upload_metadata["storage_file_names"] != None
        else []
    )
    storage_file_names.append(file_name)
    content_length = content_length + int(upload_metadata["total_size"])

    time_now = datetime.now(timezone.utc)

    keys = {"upload_id": upload_id}
    update_data = {
        "total_size": content_length,
        "storage_file_names": storage_file_names,
        "updated_at": time_now.isoformat(),
    }
    dynamodb.update_item(keys, update_data)

    return {"upload_url": upload_url}


@app.post("/postUpload/{upload_id}")
def post_upload_return_link_qr(
    body: PostUpload, upload_id: str, token_data: None = Depends(_authenticate)
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

    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata == None:
        raise HTTPException(status_code=400, detail="Upload ID not valid")
    if upload_metadata["status"] == StatusEnum.uploaded.name:
        raise HTTPException(status_code=400, detail="Upload already completed")

    file_names = body.file_names
    for file_name in file_names:
        file_path = upload_id + "/" + file_name

        # Check for file present in Storage
        is_file_present = storage.is_file_present(file_path)
        if not is_file_present:
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
    qr.add_data(file_url + '?autodownload=true')
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

            <p>Best regards,</p>
            <p>The ByteShare Team</p>

            </body>
            """.format(
                name, file_url, expires_at.isoformat()
            ),
        }

        resend.Emails.send(params)

    return {
        "url": file_url,
        "QR": qr_download_url,
        "expiration_date": formatted_expires_at,
        "downloads_allowed": str(upload_metadata["max_download"]),
    }


@app.post("/feedback")
def post_feedback_return_none(body: Feedback):
    """
    Add feedback received from users to DB

    Parameters:
    - name: name of the user
    - email: email address of user
    - message: feedback


    Returns:
    - None
    """

    feedback = {
        "feedback_id": uuid.uuid4().hex,
        "email": body.email,
        "name": body.name,
        "message": body.message,
    }
    feedback_dynamodb.create_item(feedback)


@app.post("/user")
def webhook_post_user_send_email(body: AddUser):
    """
    Add new user to DB
    sends a welcome email to the user

    Parameters:
    - name: name of the user
    - registration: registeration date
    - email: email address of user

    Returns:
    - Sends a welcome email to the user.
    """

    user = {
        "user_id": body.id,
        "name": body.name,
        "email": body.email,
        "created_at": body.registration,
    }
    user_dynamodb.create_item(user)

    params = {
        "from": "ByteShare <hello@byteshare.io>",
        "to": [body.email],
        "subject": "Welcome to ByteShare",
        "html": """
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
  <p>Hey {},</p>

  <p style="font-size: 18px;"></p>

  <p>I'm Ambuj, the founder of ByteShare.io, and I'd like to personally thank you for signing up to our service.</p>

  <p>We established ByteShare to make file sharing easy, hassle-free and secure.</p>

  <p>I’d love to hear what you think of our product. Is there anything we should work on or improve? <a href="https://byteshare.io" style="color: #007bff; text-decoration: none;">Let us know</a>.</p>
  <p>You can also <a href="https://github.com/ambujraj/ByteShare" style="color: #007bff; text-decoration: none;">star us on Github</a></p>

  <p>I'm always happy to help and read our customers' suggestions.</p>
  
  <p>Thanks</p>
  <p>Ambuj Raj<br>
  ByteShare.io</p>

</body>
""".format(
            body.name.split(" ")[0]
        ),
    }

    resend.Emails.send(params)


@app.get("/history/{user_id}")
def get_history_return_all_shares_list(
    user_id: str, token_data: None = Depends(_authenticate)
):
    """
    Get history for a given User.
    Reads the DB to find all the shares made by the user.

    Parameters:
    - user_id: user id

    Returns:
    - List of json of the transfer details.
    """
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

    return history


@app.delete("/upload/{upload_id}")
def delete_upload_return_done(
    upload_id: str, body: DeleteUpload, token_data: None = Depends(_authenticate)
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
    upload_metadata = dynamodb.read_item({"upload_id": upload_id})
    if upload_metadata["creator_id"] != body.user_id:
        raise HTTPException(
            status_code=400, detail="User is not the owner of the upload"
        )

    keys = {"upload_id": upload_id}
    dynamodb.delete_item(keys)

    return {"status": "Done"}


@app.get("/download/{upload_id}")
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


def _sort_by_date_desc(upload):
    return upload["created_at"]


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


# Create a Handler from FastAPI for lambda.
handler = Mangum(app)
