# 🧠 ML Pipeline — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## 1. Overview

The ML pipeline handles three emotion detection modalities (face, text, voice) plus a fusion layer for multi-modal analysis.

```
Raw Data → Cleaning → Preprocessing → Augmentation → Training → Validation → Evaluation → Registry → Inference
```

---

## 2. Datasets

| Model | Dataset | Size | Classes | Source |
|-------|---------|------|---------|--------|
| Face Emotion | FER-2013 | 35,887 images | 7 emotions | Kaggle |
| Face Emotion | AffectNet | 450K images | 8 emotions | Academic |
| Text Emotion | GoEmotions | 58K comments | 27 emotions → 7 mapped | Google Research |
| Text Emotion | ISEAR | 7,666 sentences | 7 emotions | Academic |
| Voice Emotion | RAVDESS | 7,356 clips | 8 emotions | Ryerson University |
| Voice Emotion | TESS | 2,800 clips | 7 emotions | University of Toronto |

### Dataset Preparation
```bash
scripts/download_datasets.py   # Download from sources
ml/src/face/preprocess.py      # Image preprocessing
ml/src/text/preprocess.py      # Text tokenization
ml/src/voice/preprocess.py     # Audio feature extraction
```

---

## 3. Cleaning & Preprocessing

### Face
- Resize to 48×48 (FER-2013) or 224×224 (transfer learning)
- Grayscale conversion for FER, RGB for pretrained
- Face detection and cropping (MTCNN/Haar Cascade)
- Histogram equalization for contrast normalization
- Augmentation: rotation (±15°), flip, brightness, zoom

### Text
- Lowercasing, punctuation removal
- Tokenization (WordPiece/BPE via Hugging Face)
- Stop word retention (important for emotion context)
- Max sequence length: 512 tokens
- Padding and truncation

### Voice
- Sample rate normalization to 16kHz
- MFCC extraction (13-40 coefficients)
- Mel spectrogram generation
- Pitch, energy, zero-crossing rate
- Fixed-length windowing (3 seconds)
- Augmentation: noise injection, time stretching, pitch shifting

---

## 4. Model Architecture

### Face Emotion (Primary: ResNet-50 Transfer Learning)
```
Input (224×224×3) → ResNet-50 (pretrained ImageNet, frozen layers 1-40)
→ Global Average Pooling → Dense(256, ReLU) → Dropout(0.5)
→ Dense(128, ReLU) → Dropout(0.3) → Dense(7, Softmax) → Output
```

### Text Emotion (Primary: DistilBERT Fine-tuned)
```
Input Text → DistilBERT Tokenizer → DistilBERT (fine-tuned last 2 layers)
→ [CLS] token → Dense(256, ReLU) → Dropout(0.3)
→ Dense(7, Softmax) → Output
```

### Voice Emotion (Primary: CNN + LSTM Hybrid)
```
MFCC Input (n_mfcc×time) → Conv1D(64) → BatchNorm → ReLU → MaxPool
→ Conv1D(128) → BatchNorm → ReLU → MaxPool
→ LSTM(128) → Dense(64, ReLU) → Dropout(0.4)
→ Dense(7, Softmax) → Output
```

---

## 5. Training

| Hyperparameter | Face | Text | Voice |
|----------------|------|------|-------|
| Optimizer | Adam | AdamW | Adam |
| Learning Rate | 1e-4 | 2e-5 | 1e-3 |
| Batch Size | 32 | 16 | 32 |
| Epochs | 50 | 10 | 30 |
| Early Stopping | patience=5 | patience=3 | patience=5 |
| LR Scheduler | ReduceOnPlateau | Linear warmup | StepLR |

### Training Commands
```bash
python ml/src/face/train.py --config ml/configs/face_config.yaml
python ml/src/text/train.py --config ml/configs/text_config.yaml
python ml/src/voice/train.py --config ml/configs/voice_config.yaml
```

---

## 6. Validation & Evaluation

- **Split**: 70% train / 15% validation / 15% test (stratified)
- **Metrics**: Accuracy, F1-score (macro & weighted), Confusion Matrix, Per-class Precision/Recall
- **Cross-validation**: 5-fold for final evaluation
- **Minimum thresholds**: Accuracy ≥85%, F1-macro ≥0.80

---

## 7. Inference

```python
# Example inference flow
class EmotionPredictor:
    def predict_face(self, image: np.ndarray) -> EmotionResult:
        preprocessed = self.face_preprocessor.transform(image)
        prediction = self.face_model.predict(preprocessed)
        return self._format_result(prediction, modality="face")
```

**Performance Targets**: Face <500ms, Text <300ms, Voice <1000ms

---

## 8. Model Registry (MLflow)

- **Tracking URI**: `http://localhost:5000`
- **Experiment naming**: `{modality}-emotion-detection`
- **Model stages**: `Staging` → `Production` → `Archived`
- **Logged artifacts**: Model weights, configs, metrics, confusion matrices

---

## 9. Model Versioning

```
ml/models/
├── face/
│   ├── v1.0.0/          # ResNet-50 base
│   └── v1.1.0/          # Improved with AffectNet
├── text/
│   └── v1.0.0/          # DistilBERT fine-tuned
└── voice/
    └── v1.0.0/          # CNN-LSTM hybrid
```

**Naming**: `{modality}_v{major}.{minor}.{patch}.{format}` (e.g., `face_v1.0.0.pt`)

---

## 10. Experiment Tracking

All experiments logged to MLflow with: parameters, metrics per epoch, model artifacts, dataset version, git commit hash, environment info.

---

## 11. Future Models

| Model | Timeline | Description |
|-------|----------|-------------|
| Emotion-to-Music Mapping ML | Phase 08 | Learned mapping instead of rules |
| Multi-modal Attention Fusion | Phase 12 | Attention-based modal weighting |
| Personalized Emotion Model | v2.0 | User-adapted emotion recognition |
| Music Emotion Classification | v2.0 | Classify music by emotion |

---

> **All ML changes must update this document. No new models without architecture review.**
