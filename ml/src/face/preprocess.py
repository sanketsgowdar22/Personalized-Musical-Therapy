"""Data preprocessing, augmentation, and DataLoader utilities for FER-2013."""

import os

import torch
import torchvision.transforms as transforms
from PIL import Image, ImageOps
from torch.utils.data import DataLoader, Dataset


class HistogramEqualization(object):
    """Apply histogram equalization to a PIL image."""

    def __call__(self, img):
        """Equalise and return an RGB PIL image."""
        img_gray = ImageOps.grayscale(img)
        img_eq = ImageOps.equalize(img_gray)
        return img_eq.convert("RGB")


def get_transforms(img_size: int = 224, is_training: bool = True):
    """Return a composed transform pipeline for training or inference.

    Args:
        img_size: Target square image size in pixels.
        is_training: When ``True``, adds random augmentations.

    Returns:
        A ``transforms.Compose`` object.
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
    base_transforms.extend(
        [
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    return transforms.Compose(base_transforms)


class FaceEmotionDataset(Dataset):
    """PyTorch Dataset for a directory-structured FER-2013 split.

    Expected layout::

        data_dir/
            angry/   *.jpg
            happy/   *.jpg
            ...
    """

    def __init__(self, data_dir: str, classes: list, transform=None):
        """Initialise dataset by scanning ``data_dir`` for images.

        Args:
            data_dir: Root directory containing one sub-folder per class.
            classes: Ordered list of class names (must match folder names).
            transform: Optional torchvision transform to apply per sample.
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
                        if img_name.lower().endswith((".png", ".jpg", ".jpeg")):
                            self.samples.append(
                                (
                                    os.path.join(class_dir, img_name),
                                    label_idx,
                                )
                            )

    def __len__(self):
        """Return number of samples."""
        return len(self.samples)

    def __getitem__(self, idx):
        """Return (image_tensor, label_tensor) for a given index."""
        img_path, label = self.samples[idx]
        img = Image.open(img_path).convert("RGB")

        if self.transform:
            img = self.transform(img)

        return img, torch.tensor(label, dtype=torch.long)


def create_dataloaders(
    train_dir: str,
    val_dir: str,
    classes: list,
    batch_size: int = 32,
    img_size: int = 224,
):
    """Create training and validation DataLoaders.

    Args:
        train_dir: Path to the training split directory.
        val_dir: Path to the validation split directory.
        classes: List of emotion class names.
        batch_size: Samples per mini-batch.
        img_size: Square image side length passed to ``get_transforms``.

    Returns:
        Tuple of ``(train_loader, val_loader)``.
    """
    train_transform = get_transforms(img_size=img_size, is_training=True)
    val_transform = get_transforms(img_size=img_size, is_training=False)

    train_dataset = FaceEmotionDataset(train_dir, classes, transform=train_transform)
    val_dataset = FaceEmotionDataset(val_dir, classes, transform=val_transform)

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=4,
        pin_memory=True,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=4,
        pin_memory=True,
    )

    return train_loader, val_loader
