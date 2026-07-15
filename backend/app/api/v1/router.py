"""V1 API router — aggregates all endpoint routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import admin, analytics, auth, emotions, journals, music, therapy, users

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(users.router)
router.include_router(emotions.router)
router.include_router(music.router)
router.include_router(therapy.router)
router.include_router(journals.router)
router.include_router(analytics.router)
router.include_router(admin.router)
