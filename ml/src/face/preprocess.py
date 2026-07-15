import os
from PIL import Image, ImageOps
import torch
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms

class HistogramEqualization(object):
    """Applies histogram equalization to the image."""
    def __call__(self, img):
        # Convert to grayscale to apply equalization, then back to RGB
        img_gray = ImageOps.grayscale(img)
        img_eq = ImageOps.equalize(img_gray)
        return img_eq.convert('RGB')

def get_transforms(img_size: int = 224, is_training: bool = True):
    """
    Returns the compose of transformations for training or inference.
    """
    base_transforms = [
        transforms.Resize((img_size, img_size)),
        HistogramEqualization(),
    ]
    
    if is_training:
        # Augmentations for training
        augmentations = [
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(degrees=15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2),
        ]
        base_transforms.extend(augmentations)
        
    # Final tensor conversion and normalization (ImageNet stats)
    base_transforms.extend([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                             std=[0.229, 0.224, 0.225])
    ])
    
    return transforms.Compose(base_transforms)

class FaceEmotionDataset(Dataset):
    def __init__(self, data_dir: str, classes: list, transform=None):
        """
        Custom Dataset for Face Emotion images.
        Expected directory structure:
        data_dir/
            angry/
            happy/
            ...
        """
        self.data_dir = data_dir
        self.classes = classes
        self.transform = transform
        self.samples = []
        
        # Populate samples
        if os.path.exists(data_dir):
            for label_idx, class_name in enumerate(self.classes):
                class_dir = os.path.join(data_dir, class_name)
                if os.path.isdir(class_dir):
                    for img_name in os.listdir(class_dir):
                        if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                            self.samples.append((os.path.join(class_dir, img_name), label_idx))
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        img = Image.open(img_path).convert('RGB')
        
        if self.transform:
            img = self.transform(img)
            
        return img, torch.tensor(label, dtype=torch.long)

def create_dataloaders(train_dir: str, val_dir: str, classes: list, batch_size: int = 32, img_size: int = 224):
    """Creates training and validation dataloaders."""
    train_transform = get_transforms(img_size=img_size, is_training=True)
    val_transform = get_transforms(img_size=img_size, is_training=False)
    
    train_dataset = FaceEmotionDataset(train_dir, classes, transform=train_transform)
    val_dataset = FaceEmotionDataset(val_dir, classes, transform=val_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=4, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=4, pin_memory=True)
    
    return train_loader, val_loader
