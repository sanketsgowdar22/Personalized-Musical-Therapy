"""Emotion detection API endpoints."""

import uuid

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import EmotionDetection, EmotionModality, SourceType, User
from app.schemas.schemas import EmotionDetectionResponse
from app.services.ml_service import EmotionDetectionService
from fastapi import APIRouter, Depends, File, Query, UploadFile, WebSocket
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/emotions", tags=["Emotions"])

_ml_service = EmotionDetectionService()


@router.post("/detect/face", response_model=EmotionDetectionResponse)
async def detect_face_emotion(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Detect emotion from a facial image upload using NVIDIA Nemotron."""
    image_bytes = await image.read()
    prediction = _ml_service.predict_emotion(image_bytes)

    detection = EmotionDetection(
        user_id=current_user.id,
        modality=EmotionModality.face,
        primary_emotion=prediction["primary_emotion"],
        confidence=prediction["confidence"],
        all_emotions=prediction["all_emotions"],
        source_type=SourceType.upload,
    )
    db.add(detection)
    await db.flush()
    await db.refresh(detection)
    return detection


@router.websocket("/ws/detect/face")
async def ws_detect_face_emotion(websocket: WebSocket):
    """Real-time emotion detection via WebSocket."""
    await websocket.accept()

    try:
        while True:
            image_bytes = await websocket.receive_bytes()
            try:
                prediction = _ml_service.predict_emotion(image_bytes)
                await websocket.send_json({"status": "success", "prediction": prediction})
            except Exception as exc:
                await websocket.send_json({"status": "error", "message": str(exc)})
    except Exception:
        pass  # Client disconnected


@router.post("/detect/text", response_model=EmotionDetectionResponse)
async def detect_text_emotion(
    text: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Detect emotion from free-form text input."""
    text_content = text.get("text", "")
    prediction = _ml_service.predict_text_emotion(text_content)

    detection = EmotionDetection(
        user_id=current_user.id,
        modality=EmotionModality.text,
        primary_emotion=prediction["primary_emotion"],
        confidence=prediction["confidence"],
        all_emotions=prediction["all_emotions"],
        source_type=SourceType.journal,
    )
    db.add(detection)
    await db.flush()
    await db.refresh(detection)
    return detection


@router.post("/detect/voice", response_model=EmotionDetectionResponse)
async def detect_voice_emotion(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Detect emotion from a voice recording."""
    audio_bytes = await audio.read()
    prediction = _ml_service.predict_voice_emotion(audio_bytes)

    detection = EmotionDetection(
        user_id=current_user.id,
        modality=EmotionModality.voice,
        primary_emotion=prediction["primary_emotion"],
        confidence=prediction["confidence"],
        all_emotions=prediction["all_emotions"],
        source_type=SourceType.recording,
    )
    db.add(detection)
    await db.flush()
    await db.refresh(detection)
    return detection


@router.get("/history", response_model=list[EmotionDetectionResponse])
async def get_emotion_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    modality: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated emotion detection history for the current user."""
    query = select(EmotionDetection).where(EmotionDetection.user_id == current_user.id)
    if modality:
        query = query.where(EmotionDetection.modality == modality)
    query = query.order_by(EmotionDetection.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{detection_id}", response_model=EmotionDetectionResponse)
async def get_emotion_detection(
    detection_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific emotion detection record by ID."""
    result = await db.execute(
        select(EmotionDetection).where(
            EmotionDetection.id == detection_id,
            EmotionDetection.user_id == current_user.id,
        )
    )
    detection = result.scalar_one_or_none()
    if not detection:
        from app.core.exceptions import NotFoundException

        raise NotFoundException("Emotion detection")
    return detection
