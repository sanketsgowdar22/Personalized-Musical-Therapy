# 🧪 Testing Guide — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## 1. Testing Strategy

| Level | Tool | Coverage Target | Scope |
|-------|------|----------------|-------|
| Unit | pytest / Vitest | ≥80% | Individual functions, components |
| Integration | pytest + TestClient | ≥70% | API endpoints, DB queries |
| E2E | Playwright | Critical paths | Full user workflows |
| ML Model | pytest + custom | All models | Accuracy, inference time |
| Performance | k6 / Locust | Key endpoints | Load, stress, soak |
| Security | Trivy, OWASP ZAP | All surfaces | Vulnerability scanning |
| Accessibility | axe-core, Lighthouse | All pages | WCAG 2.1 AA |

---

## 2. Test Structure

```
tests/
├── unit/
│   ├── backend/          # Service, repository, utility tests
│   ├── frontend/         # Component, hook, utility tests
│   └── ml/               # Model, preprocessing tests
├── integration/
│   ├── api/              # Full API endpoint tests
│   └── db/               # Database interaction tests
├── e2e/
│   └── flows/            # User flow tests (Playwright)
├── performance/
│   └── load/             # Load test scripts
└── fixtures/             # Shared test data
```

---

## 3. Running Tests

```bash
# Backend
cd backend && pytest -v --cov=app --cov-report=html

# Frontend
cd frontend && npm run test -- --coverage

# ML
cd ml && pytest -v --cov=src

# E2E
npx playwright test

# All
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

---

## 4. Test Naming Convention

```python
# Backend: test_{method}_{scenario}_{expected}
def test_login_with_valid_credentials_returns_jwt():
def test_detect_face_with_no_face_returns_error():
```

```typescript
// Frontend: describe(Component) → it('should {behavior}')
describe('EmotionCard', () => {
  it('should display the primary emotion with confidence');
  it('should show all emotions when expanded');
});
```

---

## 5. CI Integration

- All tests run on every PR via GitHub Actions
- PRs blocked if tests fail or coverage drops below threshold
- Coverage reports uploaded to Codecov
- Performance regression tests run on `development` merges

---

> **No feature is complete without tests. Tests must pass before merge.**
