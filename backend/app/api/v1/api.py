"""API v1 router configuration."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, characters, chat, missions, payments

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router)
api_router.include_router(characters.router)
api_router.include_router(chat.router)
api_router.include_router(missions.router)
api_router.include_router(payments.router)

