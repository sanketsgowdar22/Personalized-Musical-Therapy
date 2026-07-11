# 🔌 API Design — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## 1. REST Standards

- **Base URL**: `/api/v1`
- **Protocol**: HTTPS only
- **Content-Type**: `application/json`
- **Authentication**: Bearer JWT tokens
- **Versioning**: URL path versioning (`/api/v1/`, `/api/v2/`)
- **Naming**: Lowercase, plural nouns, kebab-case for multi-word resources

---

## 2. Authentication Endpoints

### POST `/api/v1/auth/register`
```json
// Request
{ "email": "user@example.com", "password": "SecurePass123", "full_name": "John Doe" }
// Response 201
{ "id": "uuid", "email": "user@example.com", "full_name": "John Doe", "access_token": "jwt...", "refresh_token": "jwt...", "token_type": "bearer" }
```

### POST `/api/v1/auth/login`
```json
// Request
{ "email": "user@example.com", "password": "SecurePass123" }
// Response 200
{ "access_token": "jwt...", "refresh_token": "jwt...", "token_type": "bearer", "expires_in": 1800 }
```

### POST `/api/v1/auth/refresh` | POST `/api/v1/auth/logout`
### GET `/api/v1/auth/google` | GET `/api/v1/auth/google/callback`
### GET `/api/v1/auth/spotify` | GET `/api/v1/auth/spotify/callback`
### POST `/api/v1/auth/password-reset` | POST `/api/v1/auth/password-reset/confirm`

---

## 3. Emotion Endpoints

### POST `/api/v1/emotions/detect/face`
```json
// Request: multipart/form-data with 'image' file
// Response 200
{
  "id": "uuid",
  "modality": "face",
  "primary_emotion": "happy",
  "confidence": 0.87,
  "all_emotions": { "happy": 0.87, "neutral": 0.08, "surprised": 0.03, "sad": 0.01, "angry": 0.005, "fear": 0.003, "disgust": 0.002 },
  "created_at": "2026-07-11T18:00:00Z"
}
```

### POST `/api/v1/emotions/detect/text`
```json
// Request
{ "text": "I've been feeling really anxious about my upcoming exam..." }
// Response 200
{ "id": "uuid", "modality": "text", "primary_emotion": "fear", "confidence": 0.72, "all_emotions": {...}, "sentiment": { "score": -0.3, "label": "negative" } }
```

### POST `/api/v1/emotions/detect/voice` — multipart/form-data with 'audio' file
### GET `/api/v1/emotions/history?page=1&per_page=20&modality=face&from=2026-01-01&to=2026-07-11`
### GET `/api/v1/emotions/{id}`

---

## 4. Music Endpoints

### GET `/api/v1/music/recommendations?emotion=happy&limit=20`
```json
// Response 200
{
  "recommendation_id": "uuid",
  "emotion": "happy",
  "strategy": "enhance_sustain",
  "tracks": [
    { "id": "uuid", "track_name": "Happy", "artist_name": "Pharrell Williams", "spotify_track_id": "60nZcImufyMA1MKQY3dcCH", "genre": "pop", "bpm": 160, "valence": 0.96, "energy": 0.82, "position": 1 }
  ],
  "total": 20
}
```

### POST `/api/v1/music/feedback`
```json
// Request
{ "track_id": "spotify_id", "rating": 5, "emotion_context": "happy" }
// Response 201
{ "id": "uuid", "message": "Feedback recorded" }
```

### GET `/api/v1/music/spotify/search?q=relaxing&type=track&limit=20`
### POST `/api/v1/music/spotify/playlists`

---

## 5. Therapy Endpoints

### POST `/api/v1/therapy/sessions` — Start new session
### POST `/api/v1/therapy/sessions/{id}/messages`
```json
// Request
{ "content": "I've been feeling stressed about work lately." }
// Response 200
{ "id": "uuid", "role": "assistant", "content": "I hear you. Work stress can be really overwhelming...", "is_crisis": false, "created_at": "2026-07-11T18:05:00Z" }
```

### GET `/api/v1/therapy/sessions` — List sessions
### GET `/api/v1/therapy/sessions/{id}` — Session with messages
### PUT `/api/v1/therapy/sessions/{id}/end` — End session

---

## 6. Journal, Analytics, Admin & User Endpoints

### POST `/api/v1/journals` | GET `/api/v1/journals` | GET/PUT/DELETE `/api/v1/journals/{id}`
### GET `/api/v1/analytics/emotions/summary?period=30d`
### GET `/api/v1/analytics/emotions/timeline?granularity=daily&from=...&to=...`
### GET `/api/v1/analytics/sessions/stats`
### POST `/api/v1/analytics/export?format=csv`
### GET `/api/v1/admin/users` | PUT `/api/v1/admin/users/{id}/role` | DELETE `/api/v1/admin/users/{id}`
### GET `/api/v1/admin/analytics` | GET `/api/v1/admin/health`
### GET `/api/v1/users/me` | PUT `/api/v1/users/me` | PUT `/api/v1/users/me/preferences`

---

## 7. Error Codes

```json
// Standard error response
{ "error": { "code": "VALIDATION_ERROR", "message": "Email is required", "details": [...], "request_id": "uuid" } }
```

| HTTP Status | Error Code | Description |
|-------------|-----------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 400 | INVALID_FILE_TYPE | Unsupported file format |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 401 | TOKEN_EXPIRED | JWT token expired |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Duplicate resource (e.g., email) |
| 413 | FILE_TOO_LARGE | Upload exceeds size limit |
| 422 | UNPROCESSABLE | Valid syntax but semantic error |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | External service down |

---

## 8. Pagination

```json
// All list endpoints return:
{
  "data": [...],
  "pagination": { "page": 1, "per_page": 20, "total": 150, "total_pages": 8, "has_next": true, "has_prev": false }
}
```

---

## 9. Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 10 requests | 1 minute |
| ML Inference | 30 requests | 1 minute |
| General API | 100 requests | 1 minute |
| Admin endpoints | 60 requests | 1 minute |

Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 10. Swagger Strategy

- **Swagger UI**: Available at `/api/docs` (development and staging only)
- **ReDoc**: Available at `/api/redoc`
- **OpenAPI JSON**: Available at `/api/openapi.json`
- Auto-generated from FastAPI route decorators and Pydantic schemas
- All endpoints documented with descriptions, examples, and response models

---

> **Never add new API endpoints without updating this document first.**
