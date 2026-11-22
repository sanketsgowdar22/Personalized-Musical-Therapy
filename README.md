# 🎵 AI Musical Therapy Platform

An AI-powered web app that detects your emotions and plays personalized music to support your mental well-being.

---

## What It Does

The platform uses AI to detect how you are feeling — through your face, your voice, or what you write — and then recommends music that suits or improves your emotional state.

- Detect emotion from your **webcam** (face expression)
- Detect emotion from your **voice** (audio recording)
- Detect emotion from **text** (journal entries)
- Get a **Spotify playlist** tuned to your emotion
- Track your **emotional history** over time
- **Journal** your thoughts and feelings

---

## Features

| Feature | Status | Notes |
|---------|--------|-------|
| 🎭 Face Emotion Detection | ✅ Done | Uses NVIDIA Nemotron AI via API |
| 🎤 Voice Emotion Detection | ✅ Done | Uses NVIDIA Nemotron AI via API |
| 📝 Text Emotion Detection | ✅ Done | Uses NVIDIA Nemotron AI via API |
| 🎵 Music Recommendations | ✅ Done | Spotify API — unlimited songs, any number you want |
| 📊 Analytics Dashboard | ✅ Done | Charts and history of your emotions |
| 🔐 Login / Sign Up | ✅ Done | JWT auth + Google OAuth |
| 🤖 AI Therapy Chat | 📜 Planned | Will be added in a future phase |
| 🛡️ Admin Panel | 📜 Planned | Will be added in a future phase |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS |
| Backend | Python 3.11, FastAPI, SQLAlchemy, PostgreSQL |
| AI / ML | NVIDIA Nemotron-3-Nano-Omni (face, voice, text) |
| Music | Spotify Web API (recommendations + search) |
| Auth | JWT, Google OAuth 2.0 |
| Cache | Redis |
| CI/CD | GitHub Actions |
| Containers | Docker + Docker Compose |

---

## Project Structure

```
AI-Musical-Therapy/
├── frontend/          # React web app
├── backend/           # FastAPI REST API
├── ml/                # ML model code (custom PyTorch pipeline - optional)
├── database/          # DB migrations and seed scripts
├── scripts/           # Utility scripts
├── docker/            # Docker configs
├── docs/              # Full project documentation
├── .github/           # CI/CD workflows and Dependabot config
├── docker-compose.yml
├── .env.example       # Copy this to .env and fill in your keys
└── README.md
```

---

## Getting Started (Local Development)

### 1. Clone the repo

```bash
git clone https://github.com/sanketsgowdar22/Personalized-Musical-Therapy.git
cd Personalized-Musical-Therapy
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Key | Where to get it |
|-----|----------------|
| `NVIDIA_API_KEY` | [build.nvidia.com](https://build.nvidia.com) → Generate API Key (free) |
| `SPOTIFY_CLIENT_ID` | [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → Create App |
| `SPOTIFY_CLIENT_SECRET` | Same Spotify app page → Settings → View client secret |
| `DATABASE_URL` | Your local PostgreSQL connection string |

### 3. Run with Docker

```bash
docker compose up --build
```

### 4. Or run manually

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The app will be at `http://localhost:5173` and the API at `http://localhost:8000`.

---

## API Docs

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

---

## Music Recommendations

The recommendation endpoint accepts any number of songs you want:

```
GET /api/v1/music/recommendations?emotion=sad&limit=30&strategy=iso_principle
```

| Parameter | Options | Default |
|-----------|---------|---------|
| `emotion` | happy, sad, angry, fear, surprise, disgust, neutral | required |
| `limit` | 1 to 100 | 20 |
| `strategy` | iso_principle, compensatory, validating | iso_principle |

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

---

## Status

This is a personal project, currently in active development. It is not deployed to production yet — that is planned for a future phase along with a custom domain.

---

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.
