# 📂 Folder Structure — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## Complete Repository Layout

```
AI-Musical-Therapy/
│
├── .github/                          # GitHub configuration
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE/
│   │   └── pull_request_template.md
│   ├── workflows/
│   │   └── ci.yml
│   └── dependabot.yml
│
├── docs/                             # Project documentation (21 files)
│   ├── 00_Master_Project_Guide.md
│   ├── 01_Project_Vision.md
│   ├── ... (through 20)
│   └── 20_Project_Wiki.md
│
├── frontend/                         # React frontend application
│   ├── public/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── assets/                   # Images, fonts, icons
│   │   ├── components/
│   │   │   ├── common/               # Button, Input, Card, Modal, Loader
│   │   │   ├── layout/               # Header, Footer, Sidebar, Layout
│   │   │   └── features/             # Feature-specific components
│   │   │       ├── emotion/          # EmotionDetector, EmotionResult
│   │   │       ├── music/            # MusicPlayer, Playlist, TrackCard
│   │   │       ├── therapy/          # ChatWindow, MessageBubble
│   │   │       ├── journal/          # JournalEditor, JournalList
│   │   │       ├── dashboard/        # Charts, StatsCards, Timeline
│   │   │       └── admin/            # UserTable, SystemHealth
│   │   ├── hooks/                    # Custom hooks (useAuth, useEmotion, etc.)
│   │   ├── pages/                    # Route pages
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EmotionDetection.tsx
│   │   │   ├── MusicTherapy.tsx
│   │   │   ├── Journal.tsx
│   │   │   ├── TherapyChat.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Admin.tsx
│   │   ├── services/                 # API client layer
│   │   ├── store/                    # Zustand stores
│   │   ├── styles/                   # Global CSS, design tokens
│   │   ├── types/                    # TypeScript interfaces
│   │   ├── utils/                    # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                          # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/        # auth, emotions, music, therapy, analytics, admin
│   │   │   │   └── router.py
│   │   │   └── deps.py              # Dependency injection
│   │   ├── core/                     # config, security, exceptions
│   │   ├── models/                   # SQLAlchemy models
│   │   ├── schemas/                  # Pydantic schemas
│   │   ├── services/                 # Business logic
│   │   ├── repositories/            # Data access
│   │   ├── ml/                       # ML inference integration
│   │   └── utils/
│   ├── alembic/                      # Database migrations
│   ├── tests/
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── ml/                               # Machine learning
│   ├── models/                       # Trained weights (.gitignored)
│   ├── src/
│   │   ├── face/                     # model, preprocess, train, inference
│   │   ├── text/                     # model, preprocess, train, inference
│   │   ├── voice/                    # model, preprocess, train, inference
│   │   ├── fusion/                   # Multi-modal ensemble
│   │   └── utils/
│   ├── notebooks/                    # Research notebooks
│   ├── configs/                      # Training configs (YAML)
│   └── requirements.txt
│
├── datasets/                         # Training data
│   ├── raw/                          # Original datasets (.gitignored)
│   ├── processed/                    # Preprocessed data (.gitignored)
│   └── README.md                     # Dataset documentation
│
├── tests/                            # Integration & E2E tests
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
│
├── deployment/                       # Deployment configs
│   ├── kubernetes/
│   ├── nginx/
│   └── ssl/
│
├── docker/                           # Docker configurations
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── ml.Dockerfile
│
├── scripts/                          # Utility scripts
│   ├── setup.sh
│   ├── seed_db.py
│   └── download_datasets.py
│
├── research/                         # Research references
│   └── papers/
│
├── assets/                           # Static assets (logos, images)
│   └── logo.png
│
├── database/                         # Database files
│   ├── migrations/
│   ├── seeds/
│   └── init/
│
├── .github/                          # GitHub config (above)
├── .editorconfig
├── .env.example
├── .eslintrc
├── .gitignore
├── .prettierrc
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CODEOWNERS
├── CONTRIBUTING.md
├── docker-compose.yml
├── LICENSE
├── README.md
├── ROADMAP.md
├── SECURITY.md
└── SUPPORT.md
```

## Rules

1. **Never modify this structure** without updating this document first
2. **Feature components** go in `frontend/src/components/features/<domain>/`
3. **New API endpoints** go in `backend/app/api/v1/endpoints/`
4. **New ML models** get their own directory under `ml/src/`
5. **Tests mirror source** structure for easy discovery

---

> **This document is the canonical folder structure. All phases must follow it.**
