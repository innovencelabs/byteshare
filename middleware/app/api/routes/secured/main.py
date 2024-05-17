from api.routes.secured.routes import developer, scan
from fastapi import APIRouter

secured_api_router = APIRouter(prefix="/secured")

secured_api_router.include_router(scan.router, prefix="/scan", tags=["Scan Routes"])
secured_api_router.include_router(
    developer.router, prefix="/developer", tags=["Developer Routes"]
)
