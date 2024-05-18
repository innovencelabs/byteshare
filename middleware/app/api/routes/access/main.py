from api.routes.access.routes import aws
from fastapi import APIRouter

access_api_router = APIRouter(prefix="/access")

access_api_router.include_router(aws.router, prefix="/aws", tags=["AWS API access"])
