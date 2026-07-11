# 📋 Product Requirements Document (PRD) — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## 1. Overview

This document defines the complete product requirements for the AI Musical Therapy Platform. It serves as the binding specification for all development phases.

---

## 2. Product Summary

| Attribute | Value |
|-----------|-------|
| **Product Name** | AI Musical Therapy Platform |
| **Product Type** | Web Application (Responsive) |
| **Target Release** | Q4 2026 (MVP) |
| **License** | Apache License 2.0 |
| **Primary Technology** | React, FastAPI, PostgreSQL, TensorFlow/PyTorch |

---

## 3. User Stories

### Epic 1: Authentication & User Management
| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|-------------------|----------|
| US-01 | As a user, I want to register with my email so I can create an account | Registration form validates input, sends confirmation, creates account | P0 |
| US-02 | As a user, I want to log in securely so I can access my data | JWT token issued on successful login, session managed | P0 |
| US-03 | As a user, I want to log in with Google so I can sign up quickly | Google OAuth flow completes, account linked/created | P1 |
| US-04 | As a user, I want to reset my password so I can recover my account | Password reset email sent, token validated, password updated | P1 |
| US-05 | As an admin, I want to manage user roles so I can control access | Admin can assign/revoke roles via admin portal | P2 |

### Epic 2: Face Emotion Detection
| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|-------------------|----------|
| US-10 | As a user, I want to upload a photo so the system can detect my emotions | Image uploaded, face detected, emotions classified with confidence | P0 |
| US-11 | As a user, I want to use my webcam for live emotion detection | Webcam stream processed, real-time emotion overlay displayed | P1 |
| US-12 | As a user, I want to see my emotion history so I can track patterns | Chronological list of past detections with timestamps | P1 |
| US-13 | As a user, I want to see confidence scores so I understand the accuracy | Bar chart showing confidence per emotion category | P1 |

### Epic 3: Text Emotion Detection
| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|-------------------|----------|
| US-20 | As a user, I want to write journal entries so I can express my feelings | Text editor with save functionality, character count | P0 |
| US-21 | As a user, I want my journal analyzed for emotions so I get insights | NLP analysis returns emotion tags and sentiment score | P0 |
| US-22 | As a user, I want to see my journal history with emotion trends | Timeline view of entries with emotion tags and trend chart | P1 |

### Epic 4: Voice Emotion Detection
| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|-------------------|----------|
| US-30 | As a user, I want to record my voice so the system can detect emotions | Browser audio recording, saved and processed | P1 |
| US-31 | As a user, I want to upload an audio file for emotion analysis | Audio upload, feature extraction, emotion classification | P1 |
| US-32 | As a user, I want to see combined emotion results from all modalities | Weighted fusion of face + voice + text results displayed | P2 |

### Epic 5: Music Recommendation
| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|-------------------|----------|
| US-40 | As a user, I want music recommended based on my detected emotion | Emotion → music mapping returns relevant playlist | P0 |
| US-41 | As a user, I want to provide feedback on recommendations | Thumbs up/down on each track, saved to profile | P1 |
| US-42 | As a user, I want recommendations to improve over time | Collaborative filtering incorporates feedback | P2 |
| US-43 | As a user, I want to connect my Spotify account | OAuth flow, Spotify playlist access | P1 |
| US-44 | As a user, I want to play Spotify tracks in the app | Spotify Web Playback SDK integration | P1 |

### Epic 6: AI Therapy Assistant
| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|-------------------|----------|
| US-50 | As a user, I want to chat with an AI therapist | Real-time chat with LLM, empathetic responses | P1 |
| US-51 | As a user, I want the AI to consider my detected emotions | Emotion context injected into LLM prompt | P2 |
| US-52 | As a user, I want to view my chat history | Paginated chat history with timestamps | P1 |
| US-53 | As a user, I want crisis resources if I express distress | Safety guardrails detect crisis language, show resources | P0 |

### Epic 7: Dashboard & Analytics
| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|-------------------|----------|
| US-60 | As a user, I want a dashboard showing my emotional overview | Charts: emotion distribution, trends, session count | P1 |
| US-61 | As a user, I want to see my mood over time | Line chart with daily/weekly/monthly view | P2 |
| US-62 | As a user, I want to export my data | CSV/PDF export of emotion history and journals | P2 |

### Epic 8: Admin Portal
| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|-------------------|----------|
| US-70 | As an admin, I want to view all users | Paginated user list with search and filters | P2 |
| US-71 | As an admin, I want to see platform analytics | User count, session count, popular emotions chart | P2 |
| US-72 | As an admin, I want to monitor system health | CPU, memory, API response times, error rates | P2 |

---

## 4. Feature Specifications

### 4.1 Emotion Detection Engine

**Supported Emotions** (Ekman's 7 basic emotions):
1. 😊 Happy
2. 😢 Sad
3. 😠 Angry
4. 😲 Surprised
5. 😨 Fear
6. 🤢 Disgust
7. 😐 Neutral

**Input Modalities**:
- Image upload (JPEG, PNG — max 10MB)
- Live webcam stream (WebRTC)
- Text input (journal entries, min 10 characters)
- Audio recording/upload (WAV, MP3 — max 25MB, max 5 minutes)

**Output**:
```json
{
  "emotion": "happy",
  "confidence": 0.87,
  "all_emotions": {
    "happy": 0.87,
    "neutral": 0.08,
    "surprised": 0.03,
    "sad": 0.01,
    "angry": 0.005,
    "fear": 0.003,
    "disgust": 0.002
  },
  "modality": "face",
  "timestamp": "2026-07-11T18:00:00Z"
}
```

### 4.2 Music Recommendation Engine

**Emotion-to-Music Mapping Strategy**:

| Detected Emotion | Therapy Approach | Music Characteristics |
|-----------------|------------------|----------------------|
| Happy | Enhance & Sustain | Upbeat, major key, 120-140 BPM |
| Sad | Iso-principle (match then shift) | Start melancholic → gradually uplifting |
| Angry | Catharsis → Calm | High energy → soothing transition |
| Anxious/Fear | Grounding | Ambient, 60-80 BPM, nature sounds |
| Neutral | Exploration | Diverse genres, moderate tempo |
| Surprised | Engagement | Dynamic, interesting progressions |
| Disgust | Reset | Clean, simple melodies, acoustic |

### 4.3 AI Therapy Assistant Specifications

**Model**: GPT-4 or equivalent LLM
**Persona**: Warm, empathetic, non-judgmental supportive companion
**Safety Guardrails**:
- Detect crisis/suicide-related language → show emergency resources
- Never provide medical diagnosis or prescription
- Clear disclaimer: "I'm an AI assistant, not a licensed therapist"
- Rate limit: max 50 messages per session

---

## 5. Priority Matrix

| Priority | Label | Description |
|----------|-------|-------------|
| P0 | **Must Have** | Critical for MVP launch |
| P1 | **Should Have** | Important, included if time permits |
| P2 | **Nice to Have** | Enhances the product, can be deferred |
| P3 | **Future** | Planned for post-MVP releases |

---

## 6. Dependencies

| Dependency | Type | Used By | Risk Level |
|-----------|------|---------|-----------|
| TensorFlow/PyTorch | ML Framework | Emotion Detection | Low |
| FastAPI | Backend Framework | All APIs | Low |
| React | Frontend Framework | UI | Low |
| PostgreSQL | Database | All Data | Low |
| Spotify Web API | External Service | Music Integration | Medium |
| OpenAI API | External Service | AI Therapy | Medium |
| FER-2013 Dataset | Training Data | Face Emotion Model | Low |
| Redis | Caching | Backend | Low |

---

## 7. Release Criteria

### MVP (v1.0.0) Release Criteria
- [ ] User authentication (email + Google OAuth)
- [ ] Face emotion detection from image upload
- [ ] Text emotion detection from journal entries
- [ ] Music recommendation based on emotions
- [ ] User dashboard with emotion history
- [ ] ≥80% test coverage
- [ ] All P0 user stories complete
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Documentation complete

---

> **This document is the product specification. All features must be implemented according to these requirements. Changes require PRD amendment and team review.**
