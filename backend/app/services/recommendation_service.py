"""Music Recommendation Engine Service."""

import random
from typing import Dict, List, Any


class RecommendationStrategy:
    ISO_PRINCIPLE = (
        "iso_principle"  # Match emotion exactly, then gradually shift to positive
    )
    COMPENSATORY = (
        "compensatory"  # Directly oppose negative emotion with positive music
    )
    VALIDATING = "validating"  # Match emotion exactly to provide validation


class RecommendationService:
    """
    Hybrid Recommendation Engine for Musical Therapy.

    Combines:
    1. Emotion-to-Audio Feature Mapping (Content-based)
    2. Heuristic algorithms based on music therapy principles
    3. User Feedback Loop (Collaborative/Reinforcement)
    """

    def __init__(self):
        # Base mapping of emotions to Spotify-like audio features
        # Features range from 0.0 to 1.0
        self.emotion_feature_map = {
            "happy": {
                "valence": (0.7, 1.0),
                "energy": (0.6, 1.0),
                "danceability": (0.6, 1.0),
            },
            "sad": {
                "valence": (0.0, 0.4),
                "energy": (0.0, 0.4),
                "acousticness": (0.5, 1.0),
            },
            "angry": {"valence": (0.1, 0.5), "energy": (0.7, 1.0), "tempo": (120, 200)},
            "fear": {
                "valence": (0.2, 0.5),
                "energy": (0.2, 0.6),
                "acousticness": (0.4, 0.9),
            },
            "surprise": {
                "valence": (0.5, 0.9),
                "energy": (0.6, 0.9),
                "danceability": (0.5, 0.8),
            },
            "disgust": {
                "valence": (0.1, 0.4),
                "energy": (0.4, 0.7),
                "instrumentalness": (0.4, 1.0),
            },
            "neutral": {
                "valence": (0.4, 0.6),
                "energy": (0.4, 0.6),
                "acousticness": (0.3, 0.7),
            },
        }

        # Mock track database for Content-Based Filtering
        # In a real app, this would be a local database of analyzed tracks or fetched dynamically
        self.track_database = [
            {
                "id": "1",
                "name": "Weightless",
                "artist": "Marconi Union",
                "valence": 0.3,
                "energy": 0.1,
                "genre": "Ambient",
            },
            {
                "id": "2",
                "name": "Clair de Lune",
                "artist": "Claude Debussy",
                "valence": 0.2,
                "energy": 0.05,
                "genre": "Classical",
            },
            {
                "id": "3",
                "name": "Walking on Sunshine",
                "artist": "Katrina & The Waves",
                "valence": 0.9,
                "energy": 0.9,
                "genre": "Pop",
            },
            {
                "id": "4",
                "name": "Don't Stop Me Now",
                "artist": "Queen",
                "valence": 0.85,
                "energy": 0.95,
                "genre": "Rock",
            },
            {
                "id": "5",
                "name": "Someone Like You",
                "artist": "Adele",
                "valence": 0.2,
                "energy": 0.3,
                "genre": "Pop",
            },
            {
                "id": "6",
                "name": "Breathe",
                "artist": "Pink Floyd",
                "valence": 0.4,
                "energy": 0.3,
                "genre": "Rock",
            },
            {
                "id": "7",
                "name": "Chop Suey!",
                "artist": "System Of A Down",
                "valence": 0.3,
                "energy": 0.9,
                "genre": "Metal",
            },
            {
                "id": "8",
                "name": "Three Little Birds",
                "artist": "Bob Marley",
                "valence": 0.8,
                "energy": 0.5,
                "genre": "Reggae",
            },
            {
                "id": "9",
                "name": "Nocturne op.9 No.2",
                "artist": "Chopin",
                "valence": 0.3,
                "energy": 0.1,
                "genre": "Classical",
            },
            {
                "id": "10",
                "name": "Uptown Funk",
                "artist": "Mark Ronson",
                "valence": 0.9,
                "energy": 0.8,
                "genre": "Funk",
            },
        ]

    def _get_target_features(self, emotion: str, strategy: str) -> Dict[str, tuple]:
        """Determine target audio features based on emotion and therapeutic strategy."""
        base_features = self.emotion_feature_map.get(
            emotion, self.emotion_feature_map["neutral"]
        )

        if strategy == RecommendationStrategy.VALIDATING:
            return base_features
        elif strategy == RecommendationStrategy.COMPENSATORY:
            if emotion in ["sad", "fear", "angry"]:
                return self.emotion_feature_map["happy"]
            return base_features
        elif strategy == RecommendationStrategy.ISO_PRINCIPLE:
            # First validate, then we can transition. For this single-request calculation,
            # we provide a mix or bias towards positive
            return (
                base_features  # The transition logic is handled by playlist sequencing
            )
        return base_features

    def _score_track(
        self, track: Dict[str, Any], target_features: Dict[str, tuple]
    ) -> float:
        """Score a track based on how well it matches target features (Content-Based Filtering)."""
        score = 0.0
        total_features = len(target_features)

        if total_features == 0:
            return 1.0

        for feature, (min_val, max_val) in target_features.items():
            if feature in track:
                val = track[feature]
                if min_val <= val <= max_val:
                    # Perfect match within range
                    score += 1.0
                else:
                    # Partial match based on distance
                    distance = min(abs(val - min_val), abs(val - max_val))
                    score += max(0, 1.0 - distance * 2)  # Penalty for distance

        return score / total_features

    def get_recommendations(
        self, emotion: str, strategy: str, limit: int = 5, user_id: str = None
    ) -> List[Dict]:
        """
        Generate hybrid recommendations.
        """
        # 1. Map Emotion to Target Audio Features
        target_features = self._get_target_features(emotion, strategy)

        # 2. Content-Based Filtering (Score available tracks)
        scored_tracks = []
        for track in self.track_database:
            score = self._score_track(track, target_features)
            scored_tracks.append((score, track))

        # 3. Sort by score
        scored_tracks.sort(key=lambda x: x[0], reverse=True)

        # 4. Collaborative/Feedback Layer (Mock)
        # In a real scenario, we would adjust scores based on User's historical `MusicFeedback`
        # and similar users' preferences.

        # Select top candidates, adding slight randomness for variety
        top_candidates = scored_tracks[: limit + 3]
        random.shuffle(top_candidates)

        selected_tracks = [t[1] for t in top_candidates[:limit]]

        # Format for API response
        return [
            {
                "id": t["id"],
                "track_name": t["name"],
                "artist_name": t["artist"],
                "album_name": "Single",
                "album_image_url": "https://placehold.co/300x300",
                "preview_url": None,
                "duration_ms": 200000,
                "spotify_uri": f"spotify:track:{t['id']}",
                "genre": t.get("genre", "Unknown"),
            }
            for t in selected_tracks
        ]
