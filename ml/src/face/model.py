import torch
import torch.nn as nn
from torchvision.models import resnet50, ResNet50_Weights

class FaceEmotionModel(nn.Module):
    def __init__(self, num_classes: int = 7, pretrained: bool = True, unfreeze_layers_from: int = 40):
        """
        ResNet-50 based model for facial emotion recognition.
        """
        super(FaceEmotionModel, self).__init__()
        
        # Load pre-trained ResNet-50
        weights = ResNet50_Weights.DEFAULT if pretrained else None
        self.backbone = resnet50(weights=weights)
        
        # Freeze initial layers
        if pretrained:
            child_counter = 0
            for child in self.backbone.children():
                if child_counter < unfreeze_layers_from:
                    for param in child.parameters():
                        param.requires_grad = False
                child_counter += 1
                
        # Remove the final classification layer
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()
        
        # Custom classification head
        self.classifier = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.
        Returns raw logits. Apply softmax later if needed.
        """
        features = self.backbone(x)
        logits = self.classifier(features)
        return logits

if __name__ == "__main__":
    # Quick test
    model = FaceEmotionModel()
    dummy_input = torch.randn(1, 3, 224, 224)
    output = model(dummy_input)
    print(f"Output shape: {output.shape}")  # Expected: [1, 7]
