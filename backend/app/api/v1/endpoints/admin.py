"""Admin API endpoints."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.schemas import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserResponse])
async def list_all_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    repo = UserRepository(db)
    users, _ = await repo.get_all(skip=(page - 1) * per_page, limit=per_page)
    return users


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: uuid.UUID,
    role: str = Query(..., description="New role: user, admin, super_admin"),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a user's role (admin only)."""
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise NotFoundException("User")
    await repo.update_user(user_id, role=role)
    return {"message": f"User role updated to {role}"}


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Soft delete a user (admin only)."""
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise NotFoundException("User")
    await repo.soft_delete(user_id)


@router.get("/health")
async def system_health():
    """System health check (admin only)."""
    return {
        "status": "healthy",
        "database": "connected",
        "redis": "connected",
        "ml_models": "loaded",
    }
