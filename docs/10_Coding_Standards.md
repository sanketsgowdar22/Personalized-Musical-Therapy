# 📏 Coding Standards — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## 1. General Principles

- Write clean, self-documenting code with meaningful names
- Follow DRY, KISS, and YAGNI principles
- Functions do one thing well; max 30 lines
- Max file length: 300 lines (refactor if exceeded)
- No magic numbers — use named constants
- Handle errors explicitly; never swallow exceptions

---

## 2. Frontend (TypeScript / React)

### Style Guide: ESLint + Prettier (see `.eslintrc`, `.prettierrc`)

- **Components**: Functional only, PascalCase (`EmotionDetector.tsx`)
- **Hooks**: `use` prefix (`useAuth.ts`, `useEmotion.ts`)
- **Files**: kebab-case for utils, PascalCase for components
- **Types**: Explicit TypeScript types; avoid `any`; use interfaces for objects
- **State**: Zustand for global, `useState` for local
- **API calls**: Centralized in `services/` layer, never in components
- **Styling**: CSS Modules, design tokens, no inline styles
- **Testing**: Vitest + React Testing Library; test behavior, not implementation

```typescript
// ✅ Good
interface EmotionResult { emotion: string; confidence: number; }
const EmotionCard: React.FC<{ result: EmotionResult }> = ({ result }) => { ... };

// ❌ Bad
const Card = (props: any) => { ... };
```

---

## 3. Backend (Python / FastAPI)

### Style Guide: PEP 8 + Black + isort + Ruff

- **Formatting**: Black (line-length 120), isort (profile black)
- **Type hints**: Required on all function signatures
- **Docstrings**: Google style on all public functions
- **Async**: Use `async/await` for all I/O operations
- **Architecture**: Router → Service → Repository (never skip layers)
- **Validation**: Pydantic schemas for all request/response
- **Error handling**: Custom exception hierarchy; `HTTPException` in routers only
- **Testing**: pytest + pytest-asyncio; fixtures for DB setup

```python
# ✅ Good
async def get_user_by_email(self, email: str) -> User | None:
    """Fetch a user by their email address."""
    return await self.db.query(User).filter(User.email == email).first()
```

---

## 4. ML (Python)

- **Reproducibility**: Set random seeds, log all hyperparameters
- **Notebooks**: For exploration only; production code in `.py` files
- **Configs**: YAML config files, never hardcoded hyperparameters
- **Logging**: MLflow for all experiments
- **Documentation**: Docstrings on all model classes and training functions
- **Version**: All models versioned with SemVer

---

## 5. Git Commit Standards

Follow Conventional Commits: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `perf`, `build`, `ci`, `chore`

---

## 6. Code Review Checklist

- [ ] Follows coding standards for the language
- [ ] Has appropriate test coverage
- [ ] No commented-out code
- [ ] No TODO without linked issue
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities introduced
- [ ] Performance impact considered

---

> **These standards are mandatory. CI will enforce linting and formatting.**
