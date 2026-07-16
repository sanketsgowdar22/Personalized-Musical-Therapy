"""Machine learning model service for emotion detection."""

import io
import sys
from pathlib import Path

from PIL import Image

# Add root directory to python path to import ml package
root_dir = Path(__file__).resolve().parent.parent.parent.parent
sys.path.append(str(root_dir))

try:
    from ml.inference import FaceEmotionPredictor
except ImportError:
    FaceEmotionPredictor = None


class EmotionDetectionService:
    _instance = None
    _predictor = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmotionDetectionService, cls).__new__(cls)
            cls._instance._initialize_model()
        return cls._instance

    def _initialize_model(self):
        """Load the ML model into memory."""
        if FaceEmotionPredictor is None:
            return

        # Path to best model, ideally fetched from MLflow or a fixed path
        model_path = root_dir / "ml" / "models" / "best_model.pth"

        # If the model file doesn't exist yet, we can't load it
        # This will happen because we haven't trained a model yet
        # We will use a mock prediction if the model fails to load
        try:
            self._predictor = FaceEmotionPredictor(model_path=str(model_path))
        except Exception as e:
            print(f"Warning: Failed to load ML model: {e}")
            self._predictor = None

    def predict_emotion(self, image_bytes: bytes) -> dict:
        """Predict emotion from image bytes."""
        if not self._predictor:
            # Mock response for development when model is not available
            return {
                "primary_emotion": "neutral",
                "confidence": 0.85,
                "all_emotions": {"neutral": 0.85, "happy": 0.10, "sad": 0.05},
            }

        try:
            image = Image.open(io.BytesIO(image_bytes))
            prediction = self._predictor.predict(image)
            return prediction
        except Exception as e:
            raise RuntimeError(f"Emotion detection failed: {str(e)}")
