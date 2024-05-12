from api.routes.webhook.routes import user
from fastapi import APIRouter

webhook_api_router = APIRouter(prefix="/webhook")

webhook_api_router.include_router(user.router, prefix="/user", tags=["User Routes"])
