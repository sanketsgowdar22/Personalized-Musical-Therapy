# 🏗️ System Architecture — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## 1. Architecture Overview

The platform follows a **modular monolith** architecture for MVP, with clear service boundaries to enable future microservice extraction.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React SPA (TypeScript + Vite)                │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────────┐  │  │
│  │  │ Emotion │ │ Therapy  │ │ Music  │ │  Analytics    │  │  │
│  │  │ Module  │ │ Module   │ │ Module │ │  Dashboard    │  │  │
│  │  └────┬────┘ └────┬─────┘ └───┬────┘ └──────┬────────┘  │  │
│  └───────┼───────────┼───────────┼──────────────┼───────────┘  │
└──────────┼───────────┼───────────┼──────────────┼──────────────┘
           │     HTTPS/REST + WebSocket           │
┌──────────▼───────────▼───────────▼──────────────▼──────────────┐
│                     API Gateway Layer                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           FastAPI Application (Python 3.11+)              │  │
│  │  ┌──────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌──────────┐   │  │
│  │  │ Auth │ │Emotion│ │ Music │ │Therapy│ │ Analytics│   │  │
│  │  │Router│ │Router │ │Router │ │Router │ │ Router   │   │  │
│  │  └──┬───┘ └──┬────┘ └──┬────┘ └──┬────┘ └────┬─────┘   │  │
│  │     │        │         │         │            │          │  │
│  │  ┌──▼────────▼─────────▼─────────▼────────────▼───────┐ │  │
│  │  │              Service Layer (Business Logic)         │ │  │
│  │  └──┬────────┬─────────┬─────────┬────────────┬───────┘ │  │
│  │     │        │         │         │            │          │  │
│  │  ┌──▼────────▼─────────▼─────────▼────────────▼───────┐ │  │
│  │  │           Repository Layer (Data Access)            │ │  │
│  │  └────────────────────────┬───────────────────────────┘ │  │
│  └───────────────────────────┼─────────────────────────────┘  │
└──────────────────────────────┼─────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────┐
│                        Data Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐ │
│  │ PostgreSQL  │  │   Redis     │  │   File Storage         │ │
│  │ (Primary DB)│  │   (Cache)   │  │   (Uploads/Models)     │ │
│  └─────────────┘  └─────────────┘  └────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────┐
│                        ML Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Face Emotion │  │ Text Emotion │  │ Voice Emotion        │ │
│  │ (CNN/ResNet) │  │ (Transformer)│  │ (MFCC + Classifier)  │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Fusion Layer (Multi-Modal Ensemble)          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, icons
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Buttons, inputs, cards, modals
│   │   ├── layout/        # Header, footer, sidebar, navigation
│   │   └── features/      # Feature-specific components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route-level page components
│   ├── services/          # API client and service layer
│   ├── store/             # Zustand state management
│   ├── styles/            # Global CSS, design tokens
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**Key Patterns**: Component-based architecture, custom hooks for logic reuse, centralized state via Zustand, API abstraction layer, CSS modules for scoped styling.

---

## 3. Backend Architecture

```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/     # Route handlers per domain
│   │   │   │   ├── auth.py
│   │   │   │   ├── emotions.py
│   │   │   │   ├── music.py
│   │   │   │   ├── therapy.py
│   │   │   │   ├── analytics.py
│   │   │   │   └── admin.py
│   │   │   └── router.py      # API v1 router aggregation
│   │   └── deps.py            # Dependency injection
│   ├── core/
│   │   ├── config.py          # Application configuration
│   │   ├── security.py        # JWT, hashing, auth utils
│   │   └── exceptions.py      # Custom exception classes
│   ├── models/                # SQLAlchemy ORM models
│   ├── schemas/               # Pydantic request/response schemas
│   ├── services/              # Business logic layer
│   ├── repositories/          # Data access layer
│   ├── ml/                    # ML inference integration
│   └── utils/                 # Utility functions
├── alembic/                   # Database migrations
├── tests/
├── main.py                    # FastAPI application entry
└── requirements.txt
```

**Key Patterns**: Clean architecture (Router → Service → Repository), dependency injection, Pydantic validation, async-first design, Alembic migrations.

---

## 4. ML Architecture

```
ml/
├── models/                # Trained model weights (gitignored)
├── src/
│   ├── face/              # Face emotion detection
│   │   ├── model.py       # CNN/ResNet model definition
│   │   ├── preprocess.py  # Image preprocessing
│   │   ├── train.py       # Training script
│   │   └── inference.py   # Inference pipeline
│   ├── text/              # Text emotion detection
│   │   ├── model.py       # Transformer-based model
│   │   ├── preprocess.py  # Text preprocessing
│   │   ├── train.py       # Training script
│   │   └── inference.py   # Inference pipeline
│   ├── voice/             # Voice emotion detection
│   │   ├── model.py       # MFCC + classifier
│   │   ├── preprocess.py  # Audio feature extraction
│   │   ├── train.py       # Training script
│   │   └── inference.py   # Inference pipeline
│   ├── fusion/            # Multi-modal fusion
│   │   └── ensemble.py    # Weighted ensemble
│   └── utils/             # Shared ML utilities
├── notebooks/             # Jupyter notebooks for research
├── configs/               # Training configurations
└── requirements.txt
```

**Training Pipeline**: Data Collection → Preprocessing → Augmentation → Training → Validation → Evaluation → Model Registry (MLflow)

**Inference Pipeline**: Input → Preprocessing → Model Inference → Post-processing → Confidence Scoring → Result

---

## 5. Authentication Flow

```
┌────────┐          ┌─────────┐          ┌──────────┐
│ Client │          │ Backend │          │ Database │
└───┬────┘          └────┬────┘          └────┬─────┘
    │ POST /auth/login   │                    │
    │───────────────────>│                    │
    │                    │ Verify credentials  │
    │                    │───────────────────>│
    │                    │    User data       │
    │                    │<───────────────────│
    │                    │ Generate JWT       │
    │  Access + Refresh  │                    │
    │<───────────────────│                    │
    │                    │                    │
    │ GET /api/v1/...    │                    │
    │ Authorization:     │                    │
    │ Bearer <token>     │                    │
    │───────────────────>│                    │
    │                    │ Validate JWT       │
    │                    │ Extract user       │
    │    Response data   │                    │
    │<───────────────────│                    │
```

**Token Strategy**: Access token (30 min TTL) + Refresh token (7 day TTL). Refresh tokens stored in Redis blacklist on logout.

---

## 6. Recommendation Engine

```
┌─────────────────┐     ┌──────────────────────────────────┐
│ Detected Emotion│────>│ Recommendation Engine             │
└─────────────────┘     │                                    │
                        │ 1. Emotion-to-Music Mapping       │
┌─────────────────┐     │    (Therapy-based rules)          │
│ User Preferences│────>│                                    │
└─────────────────┘     │ 2. Content-Based Filtering        │
                        │    (Audio features, genre, BPM)    │
┌─────────────────┐     │                                    │
│ Listening History│───>│ 3. Collaborative Filtering         │
└─────────────────┘     │    (Similar user preferences)      │
                        │                                    │
┌─────────────────┐     │ 4. Hybrid Ranking                  │
│ Track Feedback  │────>│    (Weighted combination)          │
└─────────────────┘     │                                    │
                        │ 5. Diversity Injection              │
                        │    (Avoid filter bubbles)           │
                        └──────────────┬───────────────────┘
                                       │
                              ┌────────▼────────┐
                              │ Ranked Playlist  │
                              └─────────────────┘
```

---

## 7. Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Cloud Infrastructure                      │
│                                                              │
│  ┌─────────────┐    ┌─────────────────────────────────────┐ │
│  │   CDN       │    │       Container Orchestration        │ │
│  │ (Frontend)  │    │  ┌──────────┐  ┌──────────────────┐ │ │
│  └──────┬──────┘    │  │ Backend  │  │  ML Worker       │ │ │
│         │           │  │ (x2-4)   │  │  (x1-2)          │ │ │
│         │           │  └────┬─────┘  └────┬─────────────┘ │ │
│         │           │       │              │               │ │
│         │           │  ┌────▼──────────────▼─────────────┐ │ │
│         │           │  │      Internal Network           │ │ │
│         │           │  └────┬──────────────┬─────────────┘ │ │
│         │           │  ┌────▼─────┐  ┌─────▼────┐         │ │
│         │           │  │PostgreSQL│  │  Redis   │         │ │
│         │           │  │ (Primary │  │  Cluster │         │ │
│         │           │  │ +Replica)│  │          │         │ │
│         │           │  └──────────┘  └──────────┘         │ │
│         │           └─────────────────────────────────────┘ │
└─────────┼──────────────────────────────────────────────────┘
          │
┌─────────▼──────────────────────────────────────────────────┐
│                     Monitoring Stack                        │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │Prometheus │  │ Grafana  │  │  Sentry  │  │  MLflow  │ │
│  └───────────┘  └──────────┘  └──────────┘  └──────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Database Architecture

See [06_Database_Design.md](06_Database_Design.md) for full schema. Key design decisions:
- **PostgreSQL** for ACID compliance, JSON support, and full-text search
- **UUID primary keys** for distributed-friendly IDs
- **Soft deletes** via `deleted_at` timestamp
- **Audit columns** (`created_at`, `updated_at`) on all tables
- **Indexed** on all foreign keys and frequently queried columns

---

## 9. API Flow

```
Client Request
     │
     ▼
┌─────────────┐
│  Middleware  │ → CORS, Rate Limit, Request ID
└──────┬──────┘
       ▼
┌─────────────┐
│  Auth Guard │ → JWT Validation, Role Check
└──────┬──────┘
       ▼
┌─────────────┐
│   Router    │ → Route matching, parameter extraction
└──────┬──────┘
       ▼
┌─────────────┐
│  Validator  │ → Pydantic schema validation
└──────┬──────┘
       ▼
┌─────────────┐
│  Service    │ → Business logic execution
└──────┬──────┘
       ▼
┌─────────────┐
│ Repository  │ → Database query execution
└──────┬──────┘
       ▼
┌─────────────┐
│  Response   │ → Serialization, status code
└─────────────┘
```

---

> **This architecture document is the technical blueprint. All implementation must follow these patterns.**
