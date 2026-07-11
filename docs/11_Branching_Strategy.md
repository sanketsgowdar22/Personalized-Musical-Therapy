# 🌿 Branching Strategy — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## 1. Branch Flow

```
main (production)
 │
 └── development (integration)
      │
      ├── feature/phase-XX-name     → New features
      ├── fix/issue-description      → Bug fixes
      ├── docs/description           → Documentation
      └── hotfix/description         → Emergency production fixes
```

---

## 2. Branch Rules

| Branch | Source | Merges Into | Protection |
|--------|--------|-------------|-----------|
| `main` | — | — | Protected: no direct commits, requires PR + 1 review |
| `development` | `main` | `main` (releases only) | Protected: requires PR + 1 review |
| `feature/*` | `development` | `development` | None; delete after merge |
| `fix/*` | `development` | `development` | None; delete after merge |
| `docs/*` | `development` | `development` | None; delete after merge |
| `hotfix/*` | `main` | `main` + `development` | None; delete after merge |
| `release/*` | `development` | `main` + `development` | Protected during release |

---

## 3. Workflow

### Feature Development
```bash
# 1. Start from latest development
git checkout development && git pull origin development

# 2. Create feature branch
git checkout -b feature/phase-06-image-emotion

# 3. Work, commit, push
git add . && git commit -m "feat(emotion): add face detection API endpoint"
git push origin feature/phase-06-image-emotion

# 4. Create PR → development, get review, merge

# 5. Delete feature branch after merge
git branch -d feature/phase-06-image-emotion
```

### Release
```bash
# 1. Create release branch from development
git checkout -b release/v1.0.0 development

# 2. Version bump, final testing, changelog update
git commit -m "chore(release): bump version to v1.0.0"

# 3. Merge to main and tag
git checkout main && git merge release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# 4. Back-merge to development
git checkout development && git merge release/v1.0.0
```

---

## 4. Commit Convention

Format: `<type>(<scope>): <description>` (max 72 chars)

| Type | Use |
|------|-----|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructuring |
| `test` | Add/update tests |
| `perf` | Performance improvement |
| `build` | Build system, dependencies |
| `ci` | CI/CD changes |
| `chore` | Maintenance tasks |

---

## 5. Versioning (SemVer)

`vMAJOR.MINOR.PATCH` — e.g., `v1.2.3`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

---

> **Never commit directly to `main` or `development`. All changes via PR.**
