import os
import yaml
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau
import mlflow
import mlflow.pytorch
from sklearn.metrics import accuracy_score, f1_score
from model import FaceEmotionModel
from preprocess import create_dataloaders

def train():
    # Load config
    config_path = os.path.join(os.path.dirname(__file__), '../../configs/face_config.yaml')
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)

    # Set seeds
    torch.manual_seed(config['training']['seed'])

    # Setup device
    device = torch.device("cuda" if torch.cuda.is_available() and config['training']['device'] == 'cuda' else "cpu")
    print(f"Using device: {device}")

    # Setup MLflow
    mlflow.set_tracking_uri(config['mlflow']['tracking_uri'])
    mlflow.set_experiment(config['mlflow']['experiment_name'])

    # Load Data
    train_loader, val_loader = create_dataloaders(
        train_dir=config['data']['train_path'],
        val_dir=config['data']['val_path'],
        classes=config['data']['classes'],
        batch_size=config['training']['batch_size'],
        img_size=config['model']['input_size']
    )

    # Initialize model
    model = FaceEmotionModel(
        num_classes=config['model']['num_classes'],
        pretrained=config['model']['pretrained'],
        unfreeze_layers_from=config['model']['unfreeze_layers_from']
    ).to(device)

    # Loss and Optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=float(config['training']['learning_rate']))
    scheduler = ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=2, verbose=True)

    epochs = config['training']['epochs']
    patience = config['training']['early_stopping_patience']
    best_val_f1 = 0.0
    patience_counter = 0

    with mlflow.start_run():
        mlflow.log_params(config['training'])
        mlflow.log_params(config['model'])

        for epoch in range(epochs):
            # Training Phase
            model.train()
            train_loss = 0.0
            
            for images, labels in train_loader:
                images, labels = images.to(device), labels.to(device)
                
                optimizer.zero_grad()
                outputs = model(images)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
                train_loss += loss.item() * images.size(0)
                
            train_loss /= len(train_loader.dataset)

            # Validation Phase
            model.eval()
            val_loss = 0.0
            all_preds = []
            all_labels = []
            
            with torch.no_grad():
                for images, labels in val_loader:
                    images, labels = images.to(device), labels.to(device)
                    outputs = model(images)
                    loss = criterion(outputs, labels)
                    val_loss += loss.item() * images.size(0)
                    
                    _, preds = torch.max(outputs, 1)
                    all_preds.extend(preds.cpu().numpy())
                    all_labels.extend(labels.cpu().numpy())

            val_loss /= len(val_loader.dataset)
            val_acc = accuracy_score(all_labels, all_preds)
            val_f1 = f1_score(all_labels, all_preds, average='macro')

            print(f"Epoch {epoch+1}/{epochs} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f} | Val F1: {val_f1:.4f}")

            # Log metrics
            mlflow.log_metrics({
                "train_loss": train_loss,
                "val_loss": val_loss,
                "val_acc": val_acc,
                "val_f1": val_f1
            }, step=epoch)

            scheduler.step(val_f1)

            # Early Stopping and Model Saving
            if val_f1 > best_val_f1:
                best_val_f1 = val_f1
                patience_counter = 0
                
                # Save best model to mlflow
                mlflow.pytorch.log_model(model, "model")
                
                # Save locally
                model_dir = os.path.join(os.path.dirname(__file__), '../../models/face')
                os.makedirs(model_dir, exist_ok=True)
                torch.save(model.state_dict(), os.path.join(model_dir, 'best_model.pth'))
                print("-> Saved new best model")
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    print(f"Early stopping triggered at epoch {epoch+1}")
                    break

if __name__ == "__main__":
    train()
