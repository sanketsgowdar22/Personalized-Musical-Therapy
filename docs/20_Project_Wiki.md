# 📚 Project Wiki — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## Table of Contents

1. [FAQ](#1-faq)
2. [Glossary](#2-glossary)
3. [Architecture Decisions](#3-architecture-decisions)
4. [Troubleshooting](#4-troubleshooting)
5. [Development Tips](#5-development-tips)
6. [Resources](#6-resources)

---

## 1. FAQ

**Q: What is this project?**  
A: An open-source, AI-powered platform that detects emotions (face, voice, text) and provides personalized music therapy recommendations.

**Q: Is this a medical device?**  
A: No. This is a wellness support tool. It does not diagnose, treat, or cure any medical condition.

**Q: What ML models are used?**  
A: ResNet-50 (face), DistilBERT (text), CNN+LSTM (voice). See [ML Pipeline](08_ML_Pipeline.md).

**Q: What database is used?**  
A: PostgreSQL 15+ for primary storage, Redis for caching. See [Database Design](06_Database_Design.md).

**Q: How do I contribute?**  
A: See [CONTRIBUTING.md](../CONTRIBUTING.md). Start with issues labeled `good first issue`.

**Q: Is my emotional data private?**  
A: Yes. All emotion data is encrypted at rest and in transit. Users own their data and can export or delete it anytime. See [Security Guide](15_Security_Guide.md).

---

## 2. Glossary

| Term | Definition |
|------|-----------|
| **Emotion Detection** | AI-based classification of emotional states from input data |
| **FER** | Facial Emotion Recognition — detecting emotions from facial expressions |
| **MFCC** | Mel-Frequency Cepstral Coefficients — audio features for voice analysis |
| **Iso-principle** | Music therapy technique: match current mood then gradually shift |
| **Modality** | Input type for emotion detection (face, text, voice) |
| **Multi-modal Fusion** | Combining results from multiple modalities for better accuracy |
| **Valence** | Musical positivity measure (0 = sad/dark, 1 = happy/bright) |
| **Design Tokens** | CSS custom properties defining the visual design system |
| **RBAC** | Role-Based Access Control — permission system based on user roles |

---

## 3. Architecture Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| ADR-001 | FastAPI over Django | Async-native, auto-docs, better ML integration, modern Python |
| ADR-002 | React over Next.js | SPA sufficient for MVP, simpler deployment, Vite for speed |
| ADR-003 | PostgreSQL over MongoDB | ACID compliance, relational data, JSON support for flexibility |
| ADR-004 | Zustand over Redux | Simpler API, less boilerplate, sufficient for our state needs |
| ADR-005 | CSS Modules over Tailwind | Full control, no utility-class dependencies, design token aligned |
| ADR-006 | Modular monolith over microservices | Simpler for MVP, clear boundaries for future extraction |
| ADR-007 | MLflow over W&B | Open source, self-hosted, no vendor lock-in |
| ADR-008 | Apache 2.0 over MIT | Patent grant, enterprise-friendly, contributor protection |

---

## 4. Troubleshooting

### Docker won't start
```bash
docker-compose down -v   # Remove volumes
docker system prune       # Clean up
docker-compose up -d      # Restart
```

### Database connection refused
- Verify PostgreSQL is running: `docker-compose ps`
- Check `.env` DATABASE_URL is correct
- Ensure port 5432 is not in use

### ML model not loading
- Verify model files exist in `ml/models/`
- Check `ML_MODEL_PATH` in `.env`
- Ensure correct Python version and dependencies

### Frontend build fails
- Delete `node_modules` and `package-lock.json`, run `npm install`
- Check Node.js version matches requirements (≥18)

---

## 5. Development Tips

- Run `docker-compose up -d db redis` for just databases
- Use `uvicorn main:app --reload` for hot-reload backend
- Use `npm run dev` for Vite HMR on frontend
- Check API docs at `http://localhost:8000/api/docs`
- Use `.env.example` as reference for all environment variables

---

## 6. Resources

### Research Papers
- Ekman, P. (1992). "An argument for basic emotions"
- FER-2013: Challenges in Representation Learning (Goodfellow et al.)
- Music Therapy for Depression (Cochrane Review)

### Technologies
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TensorFlow Documentation](https://www.tensorflow.org/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [MLflow Documentation](https://mlflow.org/docs/latest/)

---

> **This wiki is a living document. Contribute improvements via docs PRs.**
