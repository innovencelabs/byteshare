from api.routes import download, feedback, health, subscribe, upload
from api.routes.access.main import access_api_router
from api.routes.secured.main import secured_api_router
from api.routes.webhook.main import webhook_api_router
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["Health Routes"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload Routes"])
api_router.include_router(download.router, prefix="/download", tags=["Download Routes"])
api_router.include_router(
    subscribe.router, prefix="/subscribe", tags=["Subscribe Routes"]
)
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback Routes"])
api_router.include_router(secured_api_router)
api_router.include_router(webhook_api_router)
api_router.include_router(access_api_router)
