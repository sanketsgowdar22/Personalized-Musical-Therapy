"""Pydantic schemas for request/response validation."""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ── Auth Schemas ─────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800


class RefreshRequest(BaseModel):
    refresh_token: str


# ── User Schemas ─────────────────────────────────────────────────────────────
class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    avatar_url: str | None = None
    role: str
    is_active: bool
    email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None


# ── Emotion Schemas ──────────────────────────────────────────────────────────
class EmotionDetectionResponse(BaseModel):
    id: uuid.UUID
    modality: str
    primary_emotion: str
    confidence: float
    all_emotions: dict
    created_at: datetime

    class Config:
        from_attributes = True


# ── Journal Schemas ──────────────────────────────────────────────────────────
class JournalCreateRequest(BaseModel):
    title: str | None = None
    content: str = Field(..., min_length=1)


class JournalUpdateRequest(BaseModel):
    title: str | None = None
    content: str | None = None


class JournalResponse(BaseModel):
    id: uuid.UUID
    title: str | None
    content: str
    word_count: int
    emotion_detection_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Therapy Schemas ──────────────────────────────────────────────────────────
class TherapyMessageRequest(BaseModel):
    content: str = Field(..., min_length=1)


class TherapyMessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    is_crisis: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TherapySessionResponse(BaseModel):
    id: uuid.UUID
    status: str
    initial_emotion: str | None
    final_emotion: str | None
    message_count: int
    started_at: datetime
    ended_at: datetime | None

    class Config:
        from_attributes = True


# ── Music Schemas ────────────────────────────────────────────────────────────
class TrackResponse(BaseModel):
    id: uuid.UUID
    track_name: str
    artist_name: str
    spotify_track_id: str | None
    genre: str | None
    bpm: int | None
    valence: float | None
    energy: float | None
    position: int

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    recommendation_id: uuid.UUID
    emotion: str
    strategy: str
    tracks: list[TrackResponse]

    class Config:
        from_attributes = True


class FeedbackRequest(BaseModel):
    track_id: str
    rating: int = Field(..., ge=1, le=5)
    emotion_context: str | None = None


class FeedbackResponse(BaseModel):
    id: uuid.UUID
    message: str = "Feedback recorded"


# ── Preference Schemas ───────────────────────────────────────────────────────
class PreferenceUpdateRequest(BaseModel):
    preferred_genres: list[str] | None = None
    preferred_bpm_range: dict | None = None
    theme: str | None = None
    notifications_enabled: bool | None = None


class PreferenceResponse(BaseModel):
    preferred_genres: list
    preferred_bpm_range: dict
    theme: str
    notifications_enabled: bool

    class Config:
        from_attributes = True


# ── Analytics Schemas ────────────────────────────────────────────────────────
class EmotionSummary(BaseModel):
    emotion: str
    count: int
    percentage: float


class AnalyticsSummaryResponse(BaseModel):
    total_detections: int
    period_days: int
    emotions: list[EmotionSummary]


# ── Pagination ───────────────────────────────────────────────────────────────
class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool


class PaginatedResponse(BaseModel):
    data: list
    pagination: PaginationMeta
