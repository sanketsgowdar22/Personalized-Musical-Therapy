"""Auth service — business logic for authentication."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.schemas import LoginRequest, RegisterRequest, TokenResponse


class AuthService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)

    async def register(self, data: RegisterRequest) -> dict:
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise ConflictException("Email already registered")

        hashed = hash_password(data.password)
        user = await self.user_repo.create(email=data.email, password_hash=hashed, full_name=data.full_name)

        tokens = self._create_tokens(str(user.id))
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            **tokens,
        }

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.email)
        if not user or not user.password_hash:
            raise UnauthorizedException("Invalid email or password")

        if not verify_password(data.password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedException("Account is deactivated")

        await self.user_repo.update_last_login(user.id)
        tokens = self._create_tokens(str(user.id))
        return TokenResponse(**tokens)

    async def refresh(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid refresh token")

        user = await self.user_repo.get_by_id(uuid.UUID(payload["sub"]))
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive")

        tokens = self._create_tokens(str(user.id))
        return TokenResponse(**tokens)

    def _create_tokens(self, user_id: str) -> dict:
        access = create_access_token(data={"sub": user_id})
        refresh = create_refresh_token(data={"sub": user_id})
        return {"access_token": access, "refresh_token": refresh, "token_type": "bearer", "expires_in": 1800}
