"""SQLAlchemy ORM models for all database tables."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


# ── Enums ────────────────────────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    super_admin = "super_admin"


class AuthProvider(str, enum.Enum):
    local = "local"
    google = "google"
    spotify = "spotify"


class EmotionModality(str, enum.Enum):
    face = "face"
    text = "text"
    voice = "voice"
    multi = "multi"


class SourceType(str, enum.Enum):
    upload = "upload"
    webcam = "webcam"
    journal = "journal"
    recording = "recording"


class SessionStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    abandoned = "abandoned"


class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class ThemePreference(str, enum.Enum):
    light = "light"
    dark = "dark"
    system = "system"


# ── Models ───────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(100), nullable=False)
    avatar_url = Column(Text, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.local, nullable=False)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    emotion_detections = relationship("EmotionDetection", back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    therapy_sessions = relationship("TherapySession", back_populates="user", cascade="all, delete-orphan")
    music_feedback = relationship("MusicFeedback", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    spotify_token = relationship("SpotifyToken", back_populates="user", uselist=False, cascade="all, delete-orphan")


class EmotionDetection(Base):
    __tablename__ = "emotion_detections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    modality = Column(Enum(EmotionModality), nullable=False)
    primary_emotion = Column(String(20), nullable=False)
    confidence = Column(Numeric(5, 4), nullable=False)
    all_emotions = Column(JSONB, nullable=False)
    source_type = Column(Enum(SourceType), nullable=False)
    source_reference = Column(Text, nullable=True)
    session_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="emotion_detections")
    recommendations = relationship("MusicRecommendation", back_populates="emotion_detection")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=False)
    word_count = Column(Integer, nullable=False)
    emotion_detection_id = Column(
        UUID(as_uuid=True), ForeignKey("emotion_detections.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="journal_entries")


class TherapySession(Base):
    __tablename__ = "therapy_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(SessionStatus), default=SessionStatus.active)
    initial_emotion = Column(String(20), nullable=True)
    final_emotion = Column(String(20), nullable=True)
    message_count = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="therapy_sessions")
    messages = relationship("TherapyMessage", back_populates="session", cascade="all, delete-orphan")


class TherapyMessage(Base):
    __tablename__ = "therapy_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("therapy_sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    is_crisis = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("TherapySession", back_populates="messages")


class MusicRecommendation(Base):
    __tablename__ = "music_recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    emotion_detection_id = Column(
        UUID(as_uuid=True), ForeignKey("emotion_detections.id", ondelete="SET NULL"), nullable=True
    )
    target_emotion = Column(String(20), nullable=False)
    strategy = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    emotion_detection = relationship("EmotionDetection", back_populates="recommendations")
    tracks = relationship("RecommendedTrack", back_populates="recommendation", cascade="all, delete-orphan")


class RecommendedTrack(Base):
    __tablename__ = "recommended_tracks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recommendation_id = Column(
        UUID(as_uuid=True), ForeignKey("music_recommendations.id", ondelete="CASCADE"), nullable=False
    )
    track_name = Column(String(300), nullable=False)
    artist_name = Column(String(300), nullable=False)
    spotify_track_id = Column(String(50), nullable=True)
    genre = Column(String(50), nullable=True)
    bpm = Column(Integer, nullable=True)
    valence = Column(Numeric(3, 2), nullable=True)
    energy = Column(Numeric(3, 2), nullable=True)
    position = Column(Integer, nullable=False)

    recommendation = relationship("MusicRecommendation", back_populates="tracks")


class MusicFeedback(Base):
    __tablename__ = "music_feedback"
    __table_args__ = (UniqueConstraint("user_id", "track_id", name="uq_user_track_feedback"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    track_id = Column(String(50), nullable=False)
    rating = Column(SmallInteger, nullable=False)
    emotion_context = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="music_feedback")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preferred_genres = Column(JSONB, default=list)
    preferred_bpm_range = Column(JSONB, default=dict)
    theme = Column(Enum(ThemePreference), default=ThemePreference.system)
    notifications_enabled = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="preferences")


class SpotifyToken(Base):
    __tablename__ = "spotify_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    scopes = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="spotify_token")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(50), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(JSONB, nullable=True)
    ip_address = Column(INET, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
