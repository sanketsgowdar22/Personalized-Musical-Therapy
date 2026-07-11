# Datasets

This directory contains training datasets for ML models.

## Structure

```
datasets/
├── raw/           # Original downloaded datasets (gitignored)
├── processed/     # Preprocessed data ready for training (gitignored)
└── README.md      # This file
```

## Datasets Used

| Dataset | Model | Size | Source |
|---------|-------|------|--------|
| FER-2013 | Face Emotion | 35,887 images | [Kaggle](https://www.kaggle.com/datasets/msambare/fer2013) |
| AffectNet | Face Emotion | 450K images | [Academic Request](http://mohammadmahoor.com/affectnet/) |
| GoEmotions | Text Emotion | 58K comments | [Google Research](https://github.com/google-research/google-research/tree/master/goemotions) |
| RAVDESS | Voice Emotion | 7,356 clips | [Zenodo](https://zenodo.org/record/1188976) |
| TESS | Voice Emotion | 2,800 clips | [University of Toronto](https://tspace.library.utoronto.ca/handle/1807/24487) |

## Download

```bash
python scripts/download_datasets.py
```

> **Raw and processed data directories are gitignored. Never commit datasets.**
