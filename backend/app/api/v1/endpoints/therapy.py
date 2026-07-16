"""Therapy chat API endpoints."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.models import MessageRole, SessionStatus, TherapyMessage, TherapySession, User
from app.schemas.schemas import TherapyMessageRequest, TherapyMessageResponse, TherapySessionResponse

router = APIRouter(prefix="/therapy", tags=["Therapy"])


@router.post("/sessions", response_model=TherapySessionResponse, status_code=201)
async def create_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a new therapy session."""
    session = TherapySession(user_id=current_user.id)
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return session


@router.post("/sessions/{session_id}/messages", response_model=TherapyMessageResponse)
async def send_message(
    session_id: uuid.UUID,
    data: TherapyMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message in a therapy session and get AI response."""
    result = await db.execute(
        select(TherapySession).where(TherapySession.id == session_id, TherapySession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise NotFoundException("Therapy session")

    # Save user message
    user_msg = TherapyMessage(session_id=session_id, role=MessageRole.user, content=data.content)
    db.add(user_msg)

    # Generate AI response (placeholder — real LLM integration in Phase 13)
    ai_response = (
        "I hear you. It sounds like you're going through something difficult. "
        "Can you tell me more about how that makes you feel?"
    )
    ai_msg = TherapyMessage(session_id=session_id, role=MessageRole.assistant, content=ai_response)
    db.add(ai_msg)

    session.message_count = (session.message_count or 0) + 2
    await db.flush()
    await db.refresh(ai_msg)
    return ai_msg


@router.get("/sessions", response_model=list[TherapySessionResponse])
async def list_sessions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all therapy sessions for the current user."""
    result = await db.execute(
        select(TherapySession)
        .where(TherapySession.user_id == current_user.id)
        .order_by(TherapySession.started_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    return list(result.scalars().all())


@router.get("/sessions/{session_id}", response_model=TherapySessionResponse)
async def get_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a therapy session with its messages."""
    result = await db.execute(
        select(TherapySession).where(TherapySession.id == session_id, TherapySession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise NotFoundException("Therapy session")
    return session


@router.put("/sessions/{session_id}/end", response_model=TherapySessionResponse)
async def end_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """End a therapy session."""
    result = await db.execute(
        select(TherapySession).where(TherapySession.id == session_id, TherapySession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise NotFoundException("Therapy session")

    session.status = SessionStatus.completed
    session.ended_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(session)
    return session
