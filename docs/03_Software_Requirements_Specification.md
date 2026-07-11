# 📐 Software Requirements Specification (SRS) — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## 1. Introduction

### 1.1 Purpose
This document provides the complete software requirements specification for the AI Musical Therapy Platform. It defines functional and non-functional requirements, system interfaces, and technical constraints.

### 1.2 Scope
The system is a web-based platform that uses AI to detect user emotions through face, voice, and text analysis, then provides personalized music therapy recommendations and an AI therapy assistant.

### 1.3 Definitions

| Term | Definition |
|------|-----------|
| FER | Facial Emotion Recognition |
| MFCC | Mel-Frequency Cepstral Coefficients |
| NLP | Natural Language Processing |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| SPA | Single Page Application |
| API | Application Programming Interface |
| ML | Machine Learning |
| LLM | Large Language Model |

---

## 2. System Overview

### 2.1 System Context

```
┌──────────────────────────────────────────────────────────────────────┐
│                          External Systems                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Google OAuth  │  │ Spotify API  │  │ OpenAI API   │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
└─────────┼──────────────────┼──────────────────┼──────────────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼──────────────────────┐
│                    AI Musical Therapy Platform                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     Frontend (React SPA)                      │    │
│  └──────────────────────────┬───────────────────────────────────┘    │
│                             │ REST API                               │
│  ┌──────────────────────────▼───────────────────────────────────┐    │
│  │                     Backend (FastAPI)                          │    │
│  └──────┬───────────────────┬───────────────────┬───────────────┘    │
│         │                   │                   │                     │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌──────▼──────┐             │
│  │ PostgreSQL  │  │ ML Engine       │  │ Redis       │             │
│  │ Database    │  │ (TF/PyTorch)    │  │ Cache       │             │
│  └─────────────┘  └─────────────────┘  └─────────────┘             │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | 18.x |
| **Build Tool** | Vite | 5.x |
| **Styling** | CSS Modules + Design Tokens | — |
| **State Management** | Zustand | 4.x |
| **Backend** | FastAPI (Python) | 0.110+ |
| **ORM** | SQLAlchemy | 2.x |
| **Database** | PostgreSQL | 15+ |
| **Cache** | Redis | 7.x |
| **ML Framework** | TensorFlow / PyTorch | 2.15+ / 2.2+ |
| **NLP** | Hugging Face Transformers | 4.x |
| **Containerization** | Docker + Docker Compose | 24.x |
| **CI/CD** | GitHub Actions | — |
| **Monitoring** | Prometheus + Grafana | — |
| **Error Tracking** | Sentry | — |
| **Experiment Tracking** | MLflow | 2.x |

---

## 3. Functional Requirements

### 3.1 Authentication Module (AUTH)

| ID | Requirement | Input | Output | Validation |
|----|------------|-------|--------|-----------|
| AUTH-001 | Register user with email | Email, password, name | User object, JWT token | Email unique, password ≥8 chars, has uppercase + number |
| AUTH-002 | Login with credentials | Email, password | JWT access + refresh tokens | Credentials valid, account active |
| AUTH-003 | Google OAuth login | Google auth code | JWT tokens, user object | Valid Google token, email verified |
| AUTH-004 | Spotify OAuth login | Spotify auth code | JWT tokens, Spotify access token | Valid Spotify authorization |
| AUTH-005 | Refresh access token | Refresh token | New access token | Refresh token valid and not expired |
| AUTH-006 | Password reset request | Email | Reset email sent | Email exists in system |
| AUTH-007 | Password reset confirm | Reset token, new password | Password updated | Token valid, not expired, password meets policy |
| AUTH-008 | Logout | Access token | Token invalidated | Token exists in blacklist |

### 3.2 Emotion Detection Module (EMO)

| ID | Requirement | Input | Output | Constraints |
|----|------------|-------|--------|------------|
| EMO-001 | Detect face emotion from image | Image file (JPEG/PNG) | Emotion classification with confidence | Max 10MB, face must be detectable |
| EMO-002 | Detect face emotion from webcam | Video stream (WebRTC) | Real-time emotion overlay | Min 15 FPS, browser camera permission |
| EMO-003 | Detect text emotion | Text string (≥10 chars) | Emotion labels, sentiment score | Min 10 characters, max 5000 characters |
| EMO-004 | Detect voice emotion | Audio file (WAV/MP3) | Emotion classification | Max 25MB, max 5 minutes, sample rate ≥16kHz |
| EMO-005 | Multi-modal fusion | Multiple modality results | Weighted combined emotion | ≥2 modalities required |
| EMO-006 | Save detection result | Detection result | Stored in database | Linked to user and session |
| EMO-007 | Get detection history | User ID, date range | Paginated history list | Max 100 per page, sorted by date desc |

### 3.3 Music Module (MUS)

| ID | Requirement | Input | Output | Constraints |
|----|------------|-------|--------|------------|
| MUS-001 | Get recommendations by emotion | Emotion, user preferences | Ranked track list | Min 10 tracks, max 50 |
| MUS-002 | Create therapy playlist | Emotion, duration | Ordered playlist | Duration 15–60 minutes |
| MUS-003 | Record track feedback | Track ID, rating (1-5) | Updated recommendation profile | One rating per user per track |
| MUS-004 | Search Spotify tracks | Search query | Track results | Requires Spotify auth, max 50 results |
| MUS-005 | Sync Spotify playlist | Playlist data | Spotify playlist created/updated | Valid Spotify token required |
| MUS-006 | Play track (Spotify) | Track URI | Playback started | Spotify Premium required for full playback |

### 3.4 Therapy Module (THR)

| ID | Requirement | Input | Output | Constraints |
|----|------------|-------|--------|------------|
| THR-001 | Start therapy session | User context, emotion state | Session ID, initial message | Max 1 active session per user |
| THR-002 | Send message | Session ID, user message | AI response | Max 500 chars per message, rate limit 5/min |
| THR-003 | Get session history | User ID | List of sessions with messages | Paginated, max 50 sessions |
| THR-004 | Crisis detection | User message | Crisis flag, resources | Triggers on keyword patterns, always active |
| THR-005 | End therapy session | Session ID | Session summary, emotion analysis | Session data saved, analytics updated |

### 3.5 Analytics Module (ANA)

| ID | Requirement | Input | Output | Constraints |
|----|------------|-------|--------|------------|
| ANA-001 | Get emotion summary | User ID, date range | Aggregated emotion statistics | Default last 30 days |
| ANA-002 | Get mood timeline | User ID, granularity | Time-series emotion data | Daily, weekly, or monthly |
| ANA-003 | Get session statistics | User ID | Session count, duration, frequency | All-time and period-based |
| ANA-004 | Export user data | User ID, format | CSV/PDF file | GDPR data portability |
| ANA-005 | Admin analytics | Date range | Platform-wide statistics | Admin role required |

### 3.6 Admin Module (ADM)

| ID | Requirement | Input | Output | Constraints |
|----|------------|-------|--------|------------|
| ADM-001 | List users | Pagination, filters | User list with metadata | Admin role required |
| ADM-002 | Update user role | User ID, new role | Updated user | Super admin only |
| ADM-003 | Disable user account | User ID | Account deactivated | Admin role, cannot disable self |
| ADM-004 | View system health | — | CPU, memory, DB stats, API metrics | Admin role required |
| ADM-005 | Manage configurations | Config key, value | Updated config | Super admin only |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Metric | Requirement | Measurement |
|----|--------|------------|-------------|
| PERF-001 | API response time (p50) | < 100ms | APM monitoring |
| PERF-002 | API response time (p95) | < 200ms | APM monitoring |
| PERF-003 | API response time (p99) | < 500ms | APM monitoring |
| PERF-004 | ML inference time (face) | < 500ms | Profiling |
| PERF-005 | ML inference time (text) | < 300ms | Profiling |
| PERF-006 | ML inference time (voice) | < 1000ms | Profiling |
| PERF-007 | Page load time (FCP) | < 1.5s | Lighthouse |
| PERF-008 | Page load time (LCP) | < 2.5s | Lighthouse |
| PERF-009 | Time to Interactive | < 3.5s | Lighthouse |
| PERF-010 | Bundle size (JS) | < 500KB gzipped | Build tools |

### 4.2 Scalability

| ID | Metric | Requirement |
|----|--------|------------|
| SCALE-001 | Concurrent users | 1,000+ simultaneous |
| SCALE-002 | Database size | Support 1M+ users |
| SCALE-003 | File storage | Support 100GB+ uploads |
| SCALE-004 | Horizontal scaling | Stateless services behind load balancer |

### 4.3 Security

| ID | Requirement | Standard |
|----|------------|----------|
| SEC-001 | Encryption at rest | AES-256 |
| SEC-002 | Encryption in transit | TLS 1.3 |
| SEC-003 | Password hashing | bcrypt (12+ rounds) |
| SEC-004 | SQL injection prevention | Parameterized queries via ORM |
| SEC-005 | XSS prevention | Content Security Policy, output encoding |
| SEC-006 | CSRF protection | Double-submit cookie pattern |
| SEC-007 | Rate limiting | Per-IP and per-user limits |
| SEC-008 | Input validation | Server-side validation on all endpoints |
| SEC-009 | File upload security | Type validation, size limits, virus scan |
| SEC-010 | OWASP Top 10 | All mitigations implemented |

### 4.4 Reliability

| ID | Metric | Requirement |
|----|--------|------------|
| REL-001 | Uptime | 99.9% (8.7 hours downtime/year max) |
| REL-002 | Recovery Time Objective | < 1 hour |
| REL-003 | Recovery Point Objective | < 1 hour |
| REL-004 | Error rate | < 0.1% of requests |
| REL-005 | Graceful degradation | Core features work if external services fail |

### 4.5 Usability

| ID | Requirement | Standard |
|----|------------|----------|
| USE-001 | Accessibility | WCAG 2.1 AA compliance |
| USE-002 | Responsive design | Works on 320px–2560px widths |
| USE-003 | Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| USE-004 | Keyboard navigation | Full keyboard accessibility |
| USE-005 | Screen reader support | ARIA labels on all interactive elements |
| USE-006 | Color contrast | Minimum 4.5:1 ratio (AA) |
| USE-007 | Error messages | User-friendly, actionable error messages |

---

## 5. System Interfaces

### 5.1 User Interfaces
- **Web Application**: React SPA accessible via modern browsers
- **Admin Portal**: Separate admin view within the same application
- **API Documentation**: Swagger UI at `/api/docs`

### 5.2 Hardware Interfaces
- **Camera**: Browser-managed webcam for face detection (via getUserMedia API)
- **Microphone**: Browser-managed mic for voice recording (via MediaRecorder API)

### 5.3 Software Interfaces
- **Spotify Web API**: Music search, playlist management, playback
- **Google OAuth 2.0**: User authentication
- **OpenAI API**: LLM for therapy assistant
- **PostgreSQL**: Primary data store
- **Redis**: Session cache, rate limiting, real-time data

### 5.4 Communication Interfaces
- **HTTPS**: All client-server communication
- **WebSocket**: Real-time updates (webcam streaming results, chat)
- **REST API**: Primary API protocol (JSON)

---

## 6. Data Requirements

### 6.1 Data Entities

| Entity | Description | Retention |
|--------|-------------|-----------|
| User | Account information, preferences | Until account deletion |
| EmotionDetection | Detection results per session | 2 years |
| JournalEntry | User-written text entries | Until user deletion |
| TherapySession | Chat session metadata | 1 year |
| TherapyMessage | Individual chat messages | 1 year |
| MusicRecommendation | Recommended tracks and playlists | 6 months |
| TrackFeedback | User feedback on tracks | Permanent |
| AuditLog | System audit trail | 3 years |

### 6.2 Data Volume Estimates

| Data Type | Per User/Month | At 10K Users/Month |
|-----------|---------------|-------------------|
| Emotion detections | 50 records | 500K records |
| Journal entries | 10 entries | 100K entries |
| Therapy messages | 100 messages | 1M messages |
| Uploaded images | 20 images (~50MB) | 500GB |
| Audio recordings | 5 recordings (~25MB) | 250GB |

---

## 7. Constraints & Assumptions

### 7.1 Technical Constraints
1. Frontend must be a SPA (no server-side rendering for MVP)
2. Backend must be async-first (FastAPI with async endpoints)
3. ML models must be deployable on CPU (GPU optional for scaling)
4. All external API calls must have timeout and fallback mechanisms
5. Database must support ACID transactions

### 7.2 Regulatory Constraints
1. GDPR compliance for EU users (data portability, right to deletion)
2. No medical claims — platform is for wellness, not clinical treatment
3. Terms of Service and Privacy Policy required before launch
4. Cookie consent for EU users

### 7.3 Assumptions
1. Users have broadband internet (≥5 Mbps)
2. Browser WebRTC support for webcam features
3. Users provide informed consent for emotion data processing
4. External APIs (Spotify, OpenAI) maintain current terms and pricing

---

> **This SRS is the technical specification for the AI Musical Therapy Platform. All implementation must conform to these requirements.**
