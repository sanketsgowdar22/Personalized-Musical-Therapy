"""Music recommendation and feedback API endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import MusicFeedback, MusicRecommendation, RecommendedTrack, User
from app.schemas.schemas import FeedbackRequest, FeedbackResponse, RecommendationResponse

router = APIRouter(prefix="/music", tags=["Music"])

# ── Emotion-to-Music mapping (rule-based, per docs/08_ML_Pipeline.md) ────────
EMOTION_MUSIC_MAP = {
    "happy": {"strategy": "enhance_sustain", "genres": ["pop", "dance", "funk"], "valence_range": (0.7, 1.0), "energy_range": (0.6, 1.0)},
    "sad": {"strategy": "iso_principle", "genres": ["acoustic", "classical", "ambient"], "valence_range": (0.2, 0.5), "energy_range": (0.1, 0.4)},
    "angry": {"strategy": "catharsis_then_calm", "genres": ["rock", "metal", "electronic"], "valence_range": (0.3, 0.6), "energy_range": (0.7, 1.0)},
    "fear": {"strategy": "grounding", "genres": ["ambient", "classical", "lo-fi"], "valence_range": (0.3, 0.6), "energy_range": (0.1, 0.4)},
    "surprise": {"strategy": "channel_energy", "genres": ["indie", "electronic", "pop"], "valence_range": (0.5, 0.8), "energy_range": (0.5, 0.8)},
    "disgust": {"strategy": "mood_shift", "genres": ["jazz", "soul", "r&b"], "valence_range": (0.4, 0.7), "energy_range": (0.3, 0.6)},
    "neutral": {"strategy": "exploration", "genres": ["indie", "lo-fi", "chill"], "valence_range": (0.4, 0.7), "energy_range": (0.3, 0.6)},
}

# ── Sample track database (will be replaced by Spotify API in Phase 10) ──────
SAMPLE_TRACKS = {
    "happy": [
        {"track_name": "Happy", "artist_name": "Pharrell Williams", "genre": "pop", "bpm": 160, "valence": 0.96, "energy": 0.82},
        {"track_name": "Walking on Sunshine", "artist_name": "Katrina and the Waves", "genre": "pop", "bpm": 110, "valence": 0.91, "energy": 0.78},
        {"track_name": "Don't Stop Me Now", "artist_name": "Queen", "genre": "rock", "bpm": 156, "valence": 0.88, "energy": 0.84},
        {"track_name": "Good as Hell", "artist_name": "Lizzo", "genre": "pop", "bpm": 96, "valence": 0.85, "energy": 0.71},
        {"track_name": "Uptown Funk", "artist_name": "Bruno Mars", "genre": "funk", "bpm": 115, "valence": 0.93, "energy": 0.89},
    ],
    "sad": [
        {"track_name": "Skinny Love", "artist_name": "Bon Iver", "genre": "indie", "bpm": 76, "valence": 0.18, "energy": 0.23},
        {"track_name": "The Night We Met", "artist_name": "Lord Huron", "genre": "indie", "bpm": 82, "valence": 0.22, "energy": 0.30},
        {"track_name": "Hurt", "artist_name": "Johnny Cash", "genre": "country", "bpm": 68, "valence": 0.15, "energy": 0.18},
        {"track_name": "Fix You", "artist_name": "Coldplay", "genre": "rock", "bpm": 70, "valence": 0.25, "energy": 0.35},
        {"track_name": "Someone Like You", "artist_name": "Adele", "genre": "pop", "bpm": 67, "valence": 0.20, "energy": 0.22},
    ],
    "angry": [
        {"track_name": "Break Stuff", "artist_name": "Limp Bizkit", "genre": "rock", "bpm": 95, "valence": 0.35, "energy": 0.92},
        {"track_name": "Killing in the Name", "artist_name": "Rage Against the Machine", "genre": "rock", "bpm": 86, "valence": 0.30, "energy": 0.95},
        {"track_name": "Bodies", "artist_name": "Drowning Pool", "genre": "metal", "bpm": 110, "valence": 0.28, "energy": 0.97},
    ],
    "neutral": [
        {"track_name": "Weightless", "artist_name": "Marconi Union", "genre": "ambient", "bpm": 60, "valence": 0.45, "energy": 0.15},
        {"track_name": "Breathe Me", "artist_name": "Sia", "genre": "pop", "bpm": 72, "valence": 0.35, "energy": 0.28},
        {"track_name": "Clair de Lune", "artist_name": "Claude Debussy", "genre": "classical", "bpm": 52, "valence": 0.40, "energy": 0.10},
        {"track_name": "Electric Feel", "artist_name": "MGMT", "genre": "indie", "bpm": 100, "valence": 0.55, "energy": 0.60},
    ],
    "fear": [
        {"track_name": "Weightless", "artist_name": "Marconi Union", "genre": "ambient", "bpm": 60, "valence": 0.45, "energy": 0.15},
        {"track_name": "Gymnopédie No.1", "artist_name": "Erik Satie", "genre": "classical", "bpm": 48, "valence": 0.38, "energy": 0.08},
    ],
    "surprise": [
        {"track_name": "Mr. Brightside", "artist_name": "The Killers", "genre": "indie", "bpm": 148, "valence": 0.65, "energy": 0.78},
        {"track_name": "Take On Me", "artist_name": "a-ha", "genre": "pop", "bpm": 168, "valence": 0.72, "energy": 0.85},
    ],
    "disgust": [
        {"track_name": "Feeling Good", "artist_name": "Nina Simone", "genre": "jazz", "bpm": 72, "valence": 0.55, "energy": 0.45},
        {"track_name": "Lovely Day", "artist_name": "Bill Withers", "genre": "soul", "bpm": 98, "valence": 0.68, "energy": 0.52},
    ],
}


@router.get("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    emotion: str = Query(..., description="Target emotion"),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get music recommendations based on detected emotion."""
    emotion_lower = emotion.lower()
    mapping = EMOTION_MUSIC_MAP.get(emotion_lower, EMOTION_MUSIC_MAP["neutral"])
    tracks_data = SAMPLE_TRACKS.get(emotion_lower, SAMPLE_TRACKS["neutral"])[:limit]

    rec = MusicRecommendation(
        user_id=current_user.id,
        target_emotion=emotion_lower,
        strategy=mapping["strategy"],
    )
    db.add(rec)
    await db.flush()
    await db.refresh(rec)

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
        strategy=mapping["strategy"],
        tracks=track_objects,
    )


@router.post("/feedback", response_model=FeedbackResponse, status_code=201)
async def submit_feedback(
    data: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit feedback/rating for a track."""
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
