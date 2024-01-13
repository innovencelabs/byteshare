from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import boto3
import uuid
import qrcode
import io


app = FastAPI()

# CORS (Cross Origin Resource Sharing)
origins = ["*"]
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

    return {"status": "ok", "details": "Service is running"}


@app.post("/initiateUpload")
def initiate_upload_return_presigned_url(file_name: str):
    """
    Initiate upload to S3.
    Creates presigned URL for upload and add to DB.
    Stores the file as <UPLOAD_ID>/<FILE_NAME> in S3

    Parameters:
    - file_name: name of the file to be uploaded

    Returns:
    - Presigned URL for upload
    """

    upload_id = uuid.uuid4().hex
    file_name = upload_id + "/" + file_name
    presigned_url = s3_client.generate_presigned_url(
        "put_object",
        Params={"Bucket": S3_BUCKET_NAME, "Key": file_name},
        ExpiresIn=10800,
        HttpMethod="PUT",
    )

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

    # Get file name from DB and get presigned URL from S3
    file_url = "https://github.com/ambujraj"  # TODO: Ambuj

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

    img_bytes_io = io.BytesIO()
    img.save(img_bytes_io)

    qr_s3_file_name = upload_id + '/QRCode.png'

    # Upload the QR code to S3
    try:
        s3_client.upload_file(img_bytes_io, S3_BUCKET_NAME, qr_s3_file_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    # Generate presigned URL for the uploaded QR code
    qr_presigned_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": S3_BUCKET_NAME, "Key": qr_s3_file_name},
        ExpiresIn=3600,
    )

    return {"url": file_url, "QR": qr_presigned_url}


def _get_file_extension(file_name):
    return file_name.split(".")[-1]


# Create a Handler from FastAPI for lambda.
handler = Mangum(app)
