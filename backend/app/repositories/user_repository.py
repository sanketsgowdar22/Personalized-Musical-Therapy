"""User repository — data access layer for User model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, email: str, password_hash: str, full_name: str) -> User:
        user = User(email=email, password_hash=password_hash, full_name=full_name)
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email, User.deleted_at.is_(None)))
        return result.scalar_one_or_none()

    async def update_last_login(self, user_id: uuid.UUID) -> None:
        await self.db.execute(
            update(User).where(User.id == user_id).values(last_login_at=datetime.now(timezone.utc))
        )

    async def update_user(self, user_id: uuid.UUID, **kwargs) -> User | None:
        await self.db.execute(update(User).where(User.id == user_id).values(**kwargs))
        return await self.get_by_id(user_id)

    async def soft_delete(self, user_id: uuid.UUID) -> None:
        await self.db.execute(
            update(User).where(User.id == user_id).values(deleted_at=datetime.now(timezone.utc), is_active=False)
        )

    async def get_all(self, skip: int = 0, limit: int = 20) -> tuple[list[User], int]:
        result = await self.db.execute(
            select(User).where(User.deleted_at.is_(None)).offset(skip).limit(limit)
        )
        users = list(result.scalars().all())
        count_result = await self.db.execute(
            select(User).where(User.deleted_at.is_(None))
        )
        total = len(list(count_result.scalars().all()))
        return users, total
