"""Music recommendation and feedback API endpoints."""

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import MusicFeedback, MusicRecommendation, RecommendedTrack, User
from app.schemas.schemas import FeedbackRequest, FeedbackResponse, RecommendationResponse
from app.services.recommendation_service import RecommendationService
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/music", tags=["Music"])

# Module-level singleton — Spotify client is initialised once
_rec_service = RecommendationService()

# Therapy strategies supported by the recommendation engine
STRATEGIES = ["iso_principle", "compensatory", "validating"]


@router.get("/recommendations", response_model=RecommendationResponse)
async def get_music_recommendations(
    emotion: str = Query(..., description="Detected emotion label (happy/sad/angry/fear/surprise/disgust/neutral)"),
    limit: int = Query(20, ge=1, le=100, description="Number of tracks to return (1-100, default 20)"),
    strategy: str = Query("iso_principle", description="Therapy strategy: iso_principle | compensatory | validating"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a Spotify-powered playlist of N tracks tuned to the detected emotion.

    - **emotion**: The emotion detected by the ML service (face/text/voice).
    - **limit**: How many tracks you want — from 1 to 100. Default is 20.
    - **strategy**: Therapy approach:
      - `iso_principle` (default): Match the emotion, guide towards positive
      - `compensatory`: Counter negative emotion with uplifting music immediately
      - `validating`: Mirror the emotion exactly for validation

    Returns a full playlist with Spotify URIs, preview URLs, and album art.
    """
    emotion_lower = emotion.lower().strip()
    strategy_lower = strategy.lower().strip() if strategy in STRATEGIES else "iso_principle"

    tracks_data = _rec_service.get_recommendations(
        emotion=emotion_lower,
        limit=limit,
        strategy=strategy_lower,
        user_id=str(current_user.id),
    )

    # Persist recommendation session
    rec = MusicRecommendation(
        user_id=current_user.id,
        target_emotion=emotion_lower,
        strategy=strategy_lower,
    )
    db.add(rec)
    await db.flush()
    await db.refresh(rec)

    # Persist each track in the playlist
    track_objects = []
    for i, t in enumerate(tracks_data):
        track = RecommendedTrack(
            recommendation_id=rec.id,
            track_name=t["track_name"],
            artist_name=t["artist_name"],
            genre=t.get("genre"),
            bpm=t.get("bpm"),
            valence=t.get("valence"),
            energy=t.get("energy"),
            position=i + 1,
        )
        db.add(track)
        track_objects.append(track)

    await db.flush()
    for t in track_objects:
        await db.refresh(t)

    return RecommendationResponse(
        recommendation_id=rec.id,
        emotion=emotion_lower,
        strategy=strategy_lower,
        tracks=track_objects,
    )


@router.post("/feedback", response_model=FeedbackResponse, status_code=201)
async def submit_feedback(
    data: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a rating/feedback for a recommended track.

    Used to train future personalisation. Rating: 1 (dislike) to 5 (love).
    """
    feedback = MusicFeedback(
        user_id=current_user.id,
        track_id=data.track_id,
        rating=data.rating,
        emotion_context=data.emotion_context,
    )
    db.add(feedback)
    await db.flush()
    await db.refresh(feedback)
    return FeedbackResponse(id=feedback.id)
