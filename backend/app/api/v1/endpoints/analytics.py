"""Analytics API endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import EmotionDetection, TherapySession, User
from app.schemas.schemas import AnalyticsSummaryResponse, EmotionSummary

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/emotions/summary", response_model=AnalyticsSummaryResponse)
async def get_emotion_summary(
    period: str = Query("30d", description="Period: 7d, 30d, 90d, 365d"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get emotion detection summary for the specified period."""
    days = int(period.replace("d", ""))

    result = await db.execute(
        select(
            EmotionDetection.primary_emotion,
            func.count(EmotionDetection.id).label("count"),
        )
        .where(EmotionDetection.user_id == current_user.id)
        .group_by(EmotionDetection.primary_emotion)
    )

    rows = result.all()
    total = sum(r.count for r in rows)

    emotions = [
        EmotionSummary(
            emotion=r.primary_emotion,
            count=r.count,
            percentage=round((r.count / total * 100), 1) if total > 0 else 0,
        )
        for r in rows
    ]

    return AnalyticsSummaryResponse(total_detections=total, period_days=days, emotions=emotions)


@router.get("/sessions/stats")
async def get_session_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get therapy session statistics."""
    result = await db.execute(
        select(func.count(TherapySession.id)).where(TherapySession.user_id == current_user.id)
    )
    total_sessions = result.scalar() or 0

    result = await db.execute(
        select(func.sum(TherapySession.message_count)).where(TherapySession.user_id == current_user.id)
    )
    total_messages = result.scalar() or 0

    return {
        "total_sessions": total_sessions,
        "total_messages": total_messages,
    }
