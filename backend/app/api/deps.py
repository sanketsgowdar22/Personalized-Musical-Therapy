"""API dependency injection utilities."""

import uuid

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_token
from app.models.models import User
from app.repositories.user_repository import UserRepository


async def get_current_user(
    authorization: str = Header(..., description="Bearer <token>"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extracts and validates the current user from the Authorization header."""
    if not authorization.startswith("Bearer "):
        raise UnauthorizedException("Invalid authorization header format")

    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException("Invalid or expired token")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(uuid.UUID(payload["sub"]))
    if not user or not user.is_active:
        raise UnauthorizedException("User not found or inactive")

    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensures the current user has admin privileges."""
    if current_user.role.value not in ("admin", "super_admin"):
        from app.core.exceptions import ForbiddenException

        raise ForbiddenException()
    return current_user
