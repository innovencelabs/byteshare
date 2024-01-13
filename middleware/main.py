from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import boto3


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
