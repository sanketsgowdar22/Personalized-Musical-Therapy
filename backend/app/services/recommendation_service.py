"""Music Recommendation Engine - Spotify-first, emotion-aware, unlimited playlists.

Architecture:
- PRIMARY: Spotify Recommendations API (audio features + seed genres)
- SECONDARY: Spotify Search API (search by emotion keywords) - catches API deprecations
- FALLBACK: Labeled mock when no Spotify credentials (dev/test mode)

The caller sets `limit` (default 20, max 100). No hardcoded song lists.
"""

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

try:
    import spotipy
    from spotipy.oauth2 import SpotifyClientCredentials
except ImportError:
    spotipy = None  # type: ignore[assignment]

# ---------------------------------------------------------------------------
# Emotion → Spotify audio feature targets + seed genres
# ---------------------------------------------------------------------------
# Each entry drives the Spotify Recommendations API.
# seed_genres: up to 5 values (Spotify allows max 5 seeds total).
# valence: musical positivity  0.0 (sad) → 1.0 (happy)
# energy: intensity/activity   0.0 (calm) → 1.0 (intense)
# danceability: groove         0.0 → 1.0
# acousticness: acoustic-ness  0.0 → 1.0
# tempo: BPM target (optional)
# ---------------------------------------------------------------------------
EMOTION_PROFILE: dict[str, dict[str, Any]] = {
    "happy": {
        "target_valence": 0.85,
        "target_energy": 0.80,
        "target_danceability": 0.75,
        "min_valence": 0.60,
        "seed_genres": ["pop", "happy", "dance", "funk", "disco"],
        "search_query": "feel good upbeat happy",
        "therapy_note": "Sustain and amplify positive mood.",
    },
    "sad": {
        "target_valence": 0.25,
        "target_energy": 0.20,
        "target_acousticness": 0.80,
        "max_energy": 0.45,
        "seed_genres": ["sad", "acoustic", "piano", "singer-songwriter", "indie"],
        "search_query": "acoustic sad emotional healing",
        "therapy_note": "ISO principle — meet sadness, then gently lift.",
    },
    "angry": {
        "target_valence": 0.35,
        "target_energy": 0.90,
        "target_tempo": 140,
        "min_energy": 0.70,
        "seed_genres": ["metal", "hard-rock", "punk", "hardcore", "rock"],
        "search_query": "intense powerful cathartic rock metal",
        "therapy_note": "Catharsis release — channel anger through music.",
    },
    "fear": {
        "target_valence": 0.40,
        "target_energy": 0.20,
        "target_acousticness": 0.75,
        "max_energy": 0.40,
        "seed_genres": ["ambient", "sleep", "chill", "new-age", "study"],
        "search_query": "calming grounding ambient soothing",
        "therapy_note": "Grounding — reduce physiological arousal.",
    },
    "surprise": {
        "target_valence": 0.70,
        "target_energy": 0.75,
        "target_danceability": 0.70,
        "seed_genres": ["electronic", "synth-pop", "indie-pop", "alternative", "indie"],
        "search_query": "energetic vibrant exciting indie electronic",
        "therapy_note": "Channel heightened arousal positively.",
    },
    "disgust": {
        "target_valence": 0.50,
        "target_energy": 0.40,
        "target_instrumentalness": 0.60,
        "seed_genres": ["classical", "jazz", "blues", "soul", "r-n-b"],
        "search_query": "smooth jazz soul uplifting classical",
        "therapy_note": "Mood shift — cleanse with refined, structured sound.",
    },
    "neutral": {
        "target_valence": 0.55,
        "target_energy": 0.50,
        "target_danceability": 0.55,
        "seed_genres": ["indie", "pop", "chill", "lo-fi", "study"],
        "search_query": "chill indie lo-fi background",
        "therapy_note": "Exploration — open to any direction.",
    },
}

# Audio feature keys that map directly to Spotify recommendation params
_SPOTIFY_FEATURE_KEYS = {
    "target_valence",
    "target_energy",
    "target_danceability",
    "target_acousticness",
    "target_instrumentalness",
    "target_tempo",
    "min_valence",
    "max_valence",
    "min_energy",
    "max_energy",
    "min_danceability",
    "max_danceability",
}


class RecommendationService:
    """Spotify-first music recommendation engine for musical therapy.

    Fetches a playlist of N songs (caller-defined) from Spotify using
    emotion-tuned audio feature targets. Falls back to Spotify Search
    if the Recommendations endpoint is unavailable, then to a labeled
    mock when credentials are absent.

    No hardcoded song lists. No fixed limits (caller passes `limit`).
    """

    def __init__(self) -> None:
        """Initialise the Spotify client from environment variables."""
        self.sp: spotipy.Spotify | None = None

        client_id = os.getenv("SPOTIFY_CLIENT_ID", "")
        client_secret = os.getenv("SPOTIFY_CLIENT_SECRET", "")

        if spotipy and client_id and client_secret:
            try:
                auth = SpotifyClientCredentials(
                    client_id=client_id,
                    client_secret=client_secret,
                )
                self.sp = spotipy.Spotify(auth_manager=auth)
                logger.info("Spotify API initialised successfully.")
            except Exception as exc:
                logger.warning("Spotify init failed: %s — using mock fallback.", exc)
        else:
            logger.warning(
                "SPOTIPY_CLIENT_ID / SPOTIPY_CLIENT_SECRET not set. "
                "Add them to .env to enable real Spotify playlists."
            )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_recommendations(
        self,
        emotion: str,
        limit: int = 20,
        strategy: str = "iso_principle",
        user_id: str | None = None,
    ) -> list[dict[str, Any]]:
        """Return a playlist of `limit` tracks tuned to the given emotion.

        Args:
            emotion: One of the 7 standard emotion labels.
            limit: Number of tracks to return (1–100). Default 20.
            strategy: Therapy strategy hint (iso_principle / compensatory / validating).
            user_id: Optional user ID for future personalisation.

        Returns:
            List of track dicts with Spotify metadata.
        """
        emotion = emotion.lower().strip()
        profile = EMOTION_PROFILE.get(emotion, EMOTION_PROFILE["neutral"])
        limit = max(1, min(limit, 100))

        # Apply therapy strategy overrides
        profile = self._apply_strategy(profile, emotion, strategy)

        if self.sp:
            tracks = self._spotify_recommendations(profile, limit)
            if not tracks:
                logger.warning("Recommendations endpoint returned 0 tracks — trying Search fallback.")
                tracks = self._spotify_search(profile, emotion, limit)
            if tracks:
                return tracks

        return self._mock_response(emotion, limit)

    # ------------------------------------------------------------------
    # Strategy layer
    # ------------------------------------------------------------------

    def _apply_strategy(self, profile: dict, emotion: str, strategy: str) -> dict:
        """Adjust audio feature targets based on the therapy strategy.

        Args:
            profile: Base emotion profile dict.
            emotion: Current emotion label.
            strategy: Therapy strategy name.

        Returns:
            Adjusted profile dict.
        """
        p = profile.copy()
        if strategy == "compensatory" and emotion in {"sad", "fear", "angry", "disgust"}:
            # Directly oppose negativity with uplifting music
            uplift = EMOTION_PROFILE["happy"]
            p["target_valence"] = uplift["target_valence"]
            p["target_energy"] = uplift["target_energy"]
            p["seed_genres"] = uplift["seed_genres"]
            p["search_query"] = uplift["search_query"]
        # iso_principle and validating keep the base profile as-is
        return p

    # ------------------------------------------------------------------
    # Spotify — Recommendations endpoint (audio-feature-based)
    # ------------------------------------------------------------------

    def _spotify_recommendations(self, profile: dict, limit: int) -> list[dict[str, Any]]:
        """Fetch tracks from Spotify /recommendations with audio feature targets.

        Args:
            profile: Emotion profile with target_* and seed_genres keys.
            limit: Number of tracks requested (Spotify max = 100).

        Returns:
            List of normalised track dicts, or empty list on error.
        """
        try:
            seed_genres = profile.get("seed_genres", ["pop"])[:5]
            kwargs: dict[str, Any] = {
                "seed_genres": seed_genres,
                "limit": min(limit, 100),
            }
            # Pass all matching audio feature params directly
            for key in _SPOTIFY_FEATURE_KEYS:
                if key in profile:
                    kwargs[key] = profile[key]

            result = self.sp.recommendations(**kwargs)  # type: ignore[union-attr]
            tracks = result.get("tracks", [])
            logger.info("Spotify Recommendations: %d tracks for genres=%s", len(tracks), seed_genres)
            return [self._normalise_track(t) for t in tracks]
        except Exception as exc:
            logger.error("Spotify Recommendations API error: %s", exc)
            return []

    # ------------------------------------------------------------------
    # Spotify — Search fallback (keyword-based)
    # ------------------------------------------------------------------

    def _spotify_search(self, profile: dict, emotion: str, limit: int) -> list[dict[str, Any]]:
        """Search Spotify by emotion keywords when Recommendations fails.

        Args:
            profile: Emotion profile (used for search_query).
            emotion: Emotion label for query construction.
            limit: Number of tracks requested.

        Returns:
            List of normalised track dicts, or empty list on error.
        """
        try:
            query = profile.get("search_query", f"{emotion} music therapy")
            # Spotify search returns max 50 per call; page if needed
            tracks: list[dict] = []
            offset = 0
            batch = 50

            while len(tracks) < limit:
                remaining = limit - len(tracks)
                result = self.sp.search(  # type: ignore[union-attr]
                    q=query,
                    type="track",
                    limit=min(remaining, batch),
                    offset=offset,
                )
                items = result.get("tracks", {}).get("items", [])
                if not items:
                    break
                tracks.extend(self._normalise_track(t) for t in items)
                offset += len(items)
                if len(items) < batch:
                    break  # No more results

            logger.info("Spotify Search: %d tracks for query='%s'", len(tracks), query)
            return tracks[:limit]
        except Exception as exc:
            logger.error("Spotify Search API error: %s", exc)
            return []

    # ------------------------------------------------------------------
    # Track normalisation
    # ------------------------------------------------------------------

    @staticmethod
    def _normalise_track(t: dict) -> dict[str, Any]:
        """Normalise a raw Spotify track dict into the app's schema.

        Args:
            t: Raw Spotify track object from the API.

        Returns:
            Normalised track dict with consistent keys.
        """
        artists = ", ".join(a["name"] for a in t.get("artists", []))
        images = t.get("album", {}).get("images", [])
        image_url = images[0]["url"] if images else None

        return {
            "id": t.get("id", ""),
            "track_name": t.get("name", "Unknown"),
            "artist_name": artists,
            "album_name": t.get("album", {}).get("name", ""),
            "album_image_url": image_url,
            "preview_url": t.get("preview_url"),
            "duration_ms": t.get("duration_ms", 0),
            "spotify_uri": t.get("uri", ""),
            "spotify_url": t.get("external_urls", {}).get("spotify", ""),
            "popularity": t.get("popularity", 0),
        }

    # ------------------------------------------------------------------
    # Mock fallback
    # ------------------------------------------------------------------

    @staticmethod
    def _mock_response(emotion: str, limit: int) -> list[dict[str, Any]]:
        """Return clearly-labelled mock tracks when Spotify is unavailable.

        Args:
            emotion: Current emotion label.
            limit: Number of placeholder tracks to generate.

        Returns:
            List of mock track dicts with _mock=True flag.
        """
        profile = EMOTION_PROFILE.get(emotion, EMOTION_PROFILE["neutral"])
        logger.debug("RecommendationService: returning %d mock tracks for '%s'", limit, emotion)
        return [
            {
                "id": f"mock-{emotion}-{i}",
                "track_name": f"[Mock] Track {i + 1} — {emotion.capitalize()}",
                "artist_name": "Add SPOTIPY_CLIENT_ID to .env for real tracks",
                "album_name": "Mock Playlist",
                "album_image_url": "https://placehold.co/300x300?text=MockTrack",
                "preview_url": None,
                "duration_ms": 180000,
                "spotify_uri": "",
                "spotify_url": "https://developer.spotify.com/dashboard",
                "popularity": 0,
                "_mock": True,
                "_therapy_note": profile.get("therapy_note", ""),
            }
            for i in range(limit)
        ]
