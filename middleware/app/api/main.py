from api.routes import (download, feedback, health, scan, subscribe, upload,
                        user)
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(download.router, prefix="/download", tags=["download"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(subscribe.router, prefix="/subscribe", tags=["subscribe"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(scan.router, prefix="/scan", tags=["scan"])
