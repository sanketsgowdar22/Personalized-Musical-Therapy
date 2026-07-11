# 🚀 Deployment Guide — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## 1. Environments

| Environment | Purpose | URL | Branch |
|-------------|---------|-----|--------|
| Development | Local development | localhost:3000/8000 | feature/* |
| Staging | Pre-production testing | staging.aimusicaltherapy.com | development |
| Production | Live application | app.aimusicaltherapy.com | main |

---

## 2. Local Development (Docker)

```bash
cp .env.example .env          # Configure environment
docker-compose up -d           # Start all services
docker-compose logs -f backend # Watch backend logs
docker-compose down            # Stop all services
```

---

## 3. Production Stack

| Component | Service | Scaling |
|-----------|---------|---------|
| Frontend | CDN (Vercel/Cloudflare) | Edge-cached |
| Backend | Docker containers (2-4 replicas) | Horizontal |
| Database | Managed PostgreSQL (primary + replica) | Vertical + read replicas |
| Cache | Managed Redis | Single node → cluster |
| ML Models | Dedicated ML worker containers | GPU-enabled (optional) |
| Monitoring | Prometheus + Grafana | Single instance |
| Logging | Structured JSON → aggregator | Centralized |

---

## 4. CI/CD Pipeline

```
Push → GitHub Actions CI → Lint → Test → Build → Security Scan
                                                       │
                              ┌────────────────────────┤
                              ▼                        ▼
                         [development]            [main]
                         Deploy Staging       Deploy Production
                              │                        │
                         Smoke Tests             Smoke Tests
                              │                        │
                         ✅ Ready              ✅ Live
```

---

## 5. Deployment Checklist

- [ ] All tests passing on CI
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Monitoring and alerting configured
- [ ] SSL/TLS certificates valid
- [ ] Backup strategy verified
- [ ] Rollback plan documented

---

## 6. Rollback Strategy

1. **Immediate**: Revert to previous Docker image tag
2. **Database**: Alembic downgrade to previous migration
3. **CDN**: Purge cache, revert frontend build
4. **Communication**: Status page update within 5 minutes

---

> **Never deploy without passing the full CI pipeline.**
