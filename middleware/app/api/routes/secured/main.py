from api.routes.secured.routes import (developer, feedback, scan, subscribe,
                                       user)
from fastapi import APIRouter

secured_api_router = APIRouter(prefix="/secured")
secured_api_router.include_router(
    feedback.router, prefix="/feedback", tags=["Feedback Routes"]
)
secured_api_router.include_router(
    subscribe.router, prefix="/subscribe", tags=["Subscribe Routes"]
)
secured_api_router.include_router(user.router, prefix="/user", tags=["User Routes"])
secured_api_router.include_router(scan.router, prefix="/scan", tags=["Scan Routes"])
secured_api_router.include_router(
    developer.router, prefix="/developer", tags=["Developer Routes"]
)
