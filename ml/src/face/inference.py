import os
import yaml
import torch
import torch.nn.functional as F
from PIL import Image
from model import FaceEmotionModel
from preprocess import get_transforms

class FaceEmotionPredictor:
    def __init__(self, model_path: str = None, config_path: str = None):
        """
        Initializes the model and loads weights for inference.
        """
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), '../../configs/face_config.yaml')
            
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
            
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.classes = self.config['data']['classes']
        self.transform = get_transforms(img_size=self.config['model']['input_size'], is_training=False)
        
        self.model = FaceEmotionModel(
            num_classes=self.config['model']['num_classes'],
            pretrained=False
        )
        
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), '../../models/face/best_model.pth')
            
        if os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        else:
            print(f"Warning: Model weights not found at {model_path}. Using uninitialized weights.")
            
        self.model.to(self.device)
        self.model.eval()

    def predict(self, image: Image.Image) -> dict:
        """
        Predicts emotion from a PIL Image.
        Returns a dictionary with primary emotion and confidence scores.
        """
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            logits = self.model(img_tensor)
            probabilities = F.softmax(logits, dim=1).squeeze()
            
        probs_dict = {self.classes[i]: float(probabilities[i]) for i in range(len(self.classes))}
        
        # Sort to find primary emotion
        sorted_probs = sorted(probs_dict.items(), key=lambda item: item[1], reverse=True)
        primary_emotion, confidence = sorted_probs[0]
        
        return {
            "modality": "face",
            "primary_emotion": primary_emotion,
            "confidence": confidence,
            "all_emotions": probs_dict
        }

if __name__ == "__main__":
    # Example usage
    predictor = FaceEmotionPredictor()
    dummy_img = Image.new('RGB', (224, 224), color = 'red')
    result = predictor.predict(dummy_img)
    print("Prediction Result:", result)
