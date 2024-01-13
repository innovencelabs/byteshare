from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import boto3
import uuid


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
    upload_id = uuid.uuid4().hex

    presigned_url = s3_client.generate_presigned_url(
        "put_object",
        Params={"Bucket": S3_BUCKET_NAME, "Key": file_name},
        ExpiresIn=10800,
        HttpMethod="PUT",
    )

    return {"presigned_url": presigned_url, "upload_id": upload_id}


# Create a Handler from FastAPI for lambda.
handler = Mangum(app)
