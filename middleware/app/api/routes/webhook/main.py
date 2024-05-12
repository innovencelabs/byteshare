from fastapi import APIRouter
from api.routes.webhook.routes import user

webhook_api_router = APIRouter(prefix="/webhook")

webhook_api_router.include_router(user.router, prefix="/user", tags=["User Routes"])
