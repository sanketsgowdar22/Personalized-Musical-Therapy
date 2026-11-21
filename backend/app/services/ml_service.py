"""Emotion detection service powered by NVIDIA Nemotron-3-Nano-Omni API.

Uses nvidia/nemotron-3-nano-omni-30b-a3b-reasoning via the NVIDIA NIM API
(https://integrate.api.nvidia.com/v1/chat/completions).

The model accepts Image, Audio, and Text inputs and returns a structured
emotion analysis — no local GPU or trained weights required.
"""

import base64
import json
import logging
import os
from typing import Optional

import requests

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NEMOTRON_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning"

EMOTION_CLASSES = ["happy", "sad", "angry", "surprise", "fear", "disgust", "neutral"]

# Prompt template shared across all three modalities
_EMOTION_SYSTEM_PROMPT = (
    "You are an expert emotion analysis AI. "
    "Analyse the provided content and return ONLY valid JSON with this exact schema: "
    '{"primary_emotion": "<one of happy|sad|angry|surprise|fear|disgust|neutral>", '
    '"confidence": <float 0.0-1.0>, '
    '"all_emotions": {"happy": <float>, "sad": <float>, "angry": <float>, '
    '"surprise": <float>, "fear": <float>, "disgust": <float>, "neutral": <float>}} '
    "where all_emotions values sum to 1.0. Output nothing except the JSON object."
)


def _get_api_key() -> Optional[str]:
    """Return the NVIDIA API key from env or app settings."""
    key = os.getenv("NVIDIA_API_KEY", "")
    if not key:
        try:
            from app.core.config import get_settings

            key = get_settings().NVIDIA_API_KEY
        except Exception:
            pass
    return key or None


def _call_nemotron(messages: list, timeout: int = 30) -> dict:
    """POST to the Nemotron NIM endpoint and return parsed JSON response.

    Args:
        messages: OpenAI-style chat messages list.
        timeout: Request timeout in seconds.

    Returns:
        Parsed emotion dict with keys primary_emotion, confidence, all_emotions.

    Raises:
        RuntimeError: If the API call fails or returns unexpected data.
    """
    api_key = _get_api_key()
    if not api_key:
        raise RuntimeError(
            "NVIDIA_API_KEY is not set. Add it to your .env file. " "Get a free key at https://build.nvidia.com"
        )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    payload = {
        "model": NEMOTRON_MODEL,
        "messages": messages,
        "max_tokens": 256,
        "temperature": 0.1,
        "stream": False,
    }

    response = requests.post(NVIDIA_API_URL, headers=headers, json=payload, timeout=timeout)
    response.raise_for_status()

    raw_text = response.json()["choices"][0]["message"]["content"].strip()

    # Strip markdown code fences if the model wraps JSON in ```json ... ```
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.strip()

    return json.loads(raw_text)


def _normalise_result(raw: dict) -> dict:
    """Ensure the result dict always has all required keys and valid values.

    Args:
        raw: Parsed dict from Nemotron response.

    Returns:
        Sanitised emotion result dict.
    """
    primary = raw.get("primary_emotion", "neutral").lower()
    if primary not in EMOTION_CLASSES:
        primary = "neutral"

    all_emotions = raw.get("all_emotions", {})
    # Fill any missing emotion classes with 0.0
    for cls in EMOTION_CLASSES:
        all_emotions.setdefault(cls, 0.0)
    # Keep only the 7 standard classes
    all_emotions = {k: float(v) for k, v in all_emotions.items() if k in EMOTION_CLASSES}

    confidence = float(raw.get("confidence", all_emotions.get(primary, 0.0)))

    return {
        "primary_emotion": primary,
        "confidence": min(max(confidence, 0.0), 1.0),
        "all_emotions": all_emotions,
    }


# ---------------------------------------------------------------------------
# Public service class
# ---------------------------------------------------------------------------


class EmotionDetectionService:
    """Singleton emotion detection service backed by NVIDIA Nemotron Omni.

    Supports three detection modalities:
    - Face / image  (predict_emotion)
    - Text          (predict_text_emotion)
    - Voice / audio (predict_voice_emotion)

    Falls back to a labelled mock response when NVIDIA_API_KEY is absent,
    so local development works without credentials.
    """

    _instance = None

    def __new__(cls):
        """Return the singleton instance, creating it on first call."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._api_key = _get_api_key()
            if cls._instance._api_key:
                logger.info("EmotionDetectionService: NVIDIA Nemotron API ready.")
            else:
                logger.warning(
                    "EmotionDetectionService: NVIDIA_API_KEY not set — "
                    "returning mock responses. Set the key in .env to enable real detection."
                )
        return cls._instance

    # ------------------------------------------------------------------
    # Face / Image
    # ------------------------------------------------------------------

    def predict_emotion(self, image_bytes: bytes) -> dict:
        """Predict emotion from raw image bytes using Nemotron vision.

        Args:
            image_bytes: Raw bytes of a JPEG/PNG image.

        Returns:
            Emotion result dict: primary_emotion, confidence, all_emotions.
        """
        if not self._api_key:
            return self._mock_response("face")

        try:
            b64 = base64.b64encode(image_bytes).decode("utf-8")
            # Detect MIME type from magic bytes (JPEG = FF D8, PNG = 89 50)
            mime = "image/jpeg" if image_bytes[:2] == b"\xff\xd8" else "image/png"

            messages = [
                {"role": "system", "content": _EMOTION_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{b64}"},
                        },
                        {
                            "type": "text",
                            "text": (
                                "Analyse the facial expression in this image. " "Return the emotion JSON as instructed."
                            ),
                        },
                    ],
                },
            ]
            raw = _call_nemotron(messages)
            return _normalise_result(raw)

        except Exception as exc:
            logger.error("Face emotion detection failed: %s", exc)
            return self._mock_response("face")

    # ------------------------------------------------------------------
    # Text
    # ------------------------------------------------------------------

    def predict_text_emotion(self, text: str) -> dict:
        """Predict emotion from free-form text using Nemotron language understanding.

        Args:
            text: User-written text (e.g. a journal entry).

        Returns:
            Emotion result dict: primary_emotion, confidence, all_emotions.
        """
        if not self._api_key:
            return self._mock_response("text")

        if not text or not text.strip():
            return self._mock_response("text")

        try:
            messages = [
                {"role": "system", "content": _EMOTION_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f'Analyse the emotional tone of this text:\n\n"{text}"\n\n'
                        "Return the emotion JSON as instructed."
                    ),
                },
            ]
            raw = _call_nemotron(messages)
            return _normalise_result(raw)

        except Exception as exc:
            logger.error("Text emotion detection failed: %s", exc)
            return self._mock_response("text")

    # ------------------------------------------------------------------
    # Voice / Audio
    # ------------------------------------------------------------------

    def predict_voice_emotion(self, audio_bytes: bytes) -> dict:
        """Predict emotion from audio bytes using Nemotron audio understanding.

        The audio is base64-encoded and sent as a data URI. Supported formats:
        WAV, MP3, WebM (browser MediaRecorder default).

        Args:
            audio_bytes: Raw audio file bytes.

        Returns:
            Emotion result dict: primary_emotion, confidence, all_emotions.
        """
        if not self._api_key:
            return self._mock_response("voice")

        try:
            b64 = base64.b64encode(audio_bytes).decode("utf-8")

            # Detect format from magic bytes
            if audio_bytes[:4] == b"RIFF":
                mime = "audio/wav"
            elif audio_bytes[:3] == b"ID3" or audio_bytes[:2] == b"\xff\xfb":
                mime = "audio/mpeg"
            else:
                mime = "audio/webm"  # MediaRecorder default

            messages = [
                {"role": "system", "content": _EMOTION_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "audio_url",
                            "audio_url": {"url": f"data:{mime};base64,{b64}"},
                        },
                        {
                            "type": "text",
                            "text": (
                                "Analyse the emotional tone of this voice recording. "
                                "Consider speech pace, pitch, and prosody. "
                                "Return the emotion JSON as instructed."
                            ),
                        },
                    ],
                },
            ]
            raw = _call_nemotron(messages)
            return _normalise_result(raw)

        except Exception as exc:
            logger.error("Voice emotion detection failed: %s", exc)
            return self._mock_response("voice")

    # ------------------------------------------------------------------
    # Fallback
    # ------------------------------------------------------------------

    @staticmethod
    def _mock_response(modality: str = "unknown") -> dict:
        """Return a clearly-labelled development mock response.

        Args:
            modality: One of 'face', 'text', 'voice', 'unknown'.

        Returns:
            Mock emotion dict indicating MOCK_ML mode is active.
        """
        logger.debug("EmotionDetectionService: returning mock response for %s", modality)
        return {
            "primary_emotion": "neutral",
            "confidence": 0.0,
            "all_emotions": {
                "neutral": 1.0,
                "happy": 0.0,
                "sad": 0.0,
                "angry": 0.0,
                "surprise": 0.0,
                "fear": 0.0,
                "disgust": 0.0,
            },
            "_mock": True,
            "_reason": f"NVIDIA_API_KEY not set — {modality} detection disabled",
        }
