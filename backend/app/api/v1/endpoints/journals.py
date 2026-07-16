"""Journal API endpoints."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.models import JournalEntry, User
from app.schemas.schemas import (
    JournalCreateRequest,
    JournalResponse,
    JournalUpdateRequest,
)

router = APIRouter(prefix="/journals", tags=["Journals"])


@router.post("/", response_model=JournalResponse, status_code=201)
async def create_journal(
    data: JournalCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new journal entry."""
    entry = JournalEntry(
        user_id=current_user.id,
        title=data.title,
        content=data.content,
        word_count=len(data.content.split()),
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.get("/", response_model=list[JournalResponse])
async def list_journals(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all journal entries for the current user."""
    result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    return list(result.scalars().all())


@router.get("/{journal_id}", response_model=JournalResponse)
async def get_journal(
    journal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific journal entry."""
    result = await db.execute(
        select(JournalEntry).where(
            JournalEntry.id == journal_id, JournalEntry.user_id == current_user.id
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise NotFoundException("Journal entry")
    return entry


@router.put("/{journal_id}", response_model=JournalResponse)
async def update_journal(
    journal_id: uuid.UUID,
    data: JournalUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a journal entry."""
    result = await db.execute(
        select(JournalEntry).where(
            JournalEntry.id == journal_id, JournalEntry.user_id == current_user.id
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise NotFoundException("Journal entry")

    if data.title is not None:
        entry.title = data.title
    if data.content is not None:
        entry.content = data.content
        entry.word_count = len(data.content.split())

    await db.flush()
    await db.refresh(entry)
    return entry


@router.delete("/{journal_id}", status_code=204)
async def delete_journal(
    journal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a journal entry."""
    result = await db.execute(
        select(JournalEntry).where(
            JournalEntry.id == journal_id, JournalEntry.user_id == current_user.id
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise NotFoundException("Journal entry")
    await db.delete(entry)
