# Contributing to AI Musical Therapy Platform

First off, thank you for considering contributing to the AI Musical Therapy Platform! 🎵

It's people like you that make this platform a great tool for improving mental health through music therapy.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@aimusicaltherapy.com](mailto:conduct@aimusicaltherapy.com).

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x (for frontend)
- **Python** >= 3.10 (for backend and ML)
- **PostgreSQL** >= 15
- **Docker** & **Docker Compose**
- **Git**

### Local Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/<your-username>/AI-Musical-Therapy.git
cd AI-Musical-Therapy

# 3. Add upstream remote
git remote add upstream https://github.com/AI-Musical-Therapy/platform.git

# 4. Copy environment variables
cp .env.example .env

# 5. Start with Docker
docker-compose up -d

# 6. Verify setup
curl http://localhost:8000/api/v1/health
```

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**When reporting a bug, include:**
- A clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior vs actual behavior
- Screenshots or recordings if applicable
- Environment details (OS, browser, versions)

Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).

### 💡 Suggesting Features

Feature requests are welcome! Please use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- A clear description of the feature
- The problem it solves
- Any alternative solutions you've considered
- Mockups or examples if applicable

### 📝 Improving Documentation

Documentation improvements are always appreciated:
- Fix typos or unclear explanations
- Add examples or tutorials
- Translate documentation
- Update outdated information

### 💻 Code Contributions

1. Check the [Roadmap](ROADMAP.md) for planned features
2. Look for issues labeled `good first issue` or `help wanted`
3. Comment on the issue to let others know you're working on it
4. Follow the development workflow below

---

## Development Workflow

### 1. Sync with Upstream

```bash
git checkout development
git pull upstream development
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/phase-XX-description
```

### 3. Make Changes

- Write clean, well-documented code
- Follow the [Coding Standards](docs/10_Coding_Standards.md)
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run all tests
npm run test          # Frontend
pytest                # Backend
python -m pytest ml/  # ML

# Run linters
npm run lint          # Frontend
flake8 backend/       # Backend
```

### 5. Commit Your Changes

Follow the [Conventional Commits](#commit-message-convention) specification.

### 6. Push and Create PR

```bash
git push origin feature/phase-XX-description
```

Then create a Pull Request against the `development` branch.

---

## Branching Strategy

```
main                    # Production-ready code
├── development         # Integration branch
│   ├── feature/phase-XX-name   # Feature branches
│   ├── fix/issue-description   # Bug fix branches
│   └── docs/description        # Documentation branches
├── hotfix/description  # Emergency fixes
└── release/vX.Y.Z     # Release preparation
```

### Rules

- **Never** commit directly to `main`
- **Never** commit directly to `development`
- All changes go through Pull Requests
- Feature branches are created from `development`
- Feature branches are merged into `development` via PR
- Only `development` is merged into `main` for releases
- Delete feature branches after merge

> See [Branching Strategy](docs/11_Branching_Strategy.md) for full details.

---

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, missing semicolons, etc.) |
| `refactor` | Code refactoring (no feature or bug fix) |
| `test` | Adding or updating tests |
| `perf` | Performance improvements |
| `build` | Build system or dependency changes |
| `ci` | CI/CD configuration changes |
| `chore` | Other changes that don't modify src or test files |

### Examples

```bash
feat(auth): add JWT token refresh endpoint
fix(emotion): correct face detection model accuracy threshold
docs(api): update authentication endpoint examples
refactor(backend): extract database connection to service layer
test(ml): add unit tests for voice emotion pipeline
perf(frontend): optimize dashboard chart rendering
ci: add GitHub Actions workflow for ML model testing
```

### Scopes

Common scopes: `auth`, `emotion`, `music`, `therapy`, `frontend`, `backend`, `ml`, `api`, `db`, `ci`, `docs`, `deploy`

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass locally
- [ ] New code has appropriate test coverage
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up-to-date with `development`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #XX

## Testing
Describe testing performed

## Screenshots (if applicable)
```

### Review Process

1. At least **1 reviewer** approval required
2. All CI checks must pass
3. No merge conflicts
4. Code review comments addressed
5. Documentation updated if needed

---

## Coding Standards

### General

- Write clean, self-documenting code
- Follow DRY (Don't Repeat Yourself) principles
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic only

### Frontend (TypeScript/React)

- Use functional components with hooks
- Follow React best practices
- Use TypeScript strict mode
- CSS modules or styled-components

### Backend (Python/FastAPI)

- Follow PEP 8 style guide
- Use type hints everywhere
- Write docstrings for all functions
- Use async/await for I/O operations

### ML (Python)

- Document all model parameters
- Include experiment tracking
- Version all models
- Write reproducible training scripts

> See [Coding Standards](docs/10_Coding_Standards.md) for comprehensive guidelines.

---

## Documentation

- All new features must include documentation
- Update existing docs when modifying features
- Use clear, concise language
- Include code examples where helpful
- Follow the documentation structure in `docs/`

> Documentation is the single source of truth. See [Master Project Guide](docs/00_Master_Project_Guide.md).

---

## Community

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Requests**: Code contributions

---

## Recognition

All contributors are recognized in our [Contributors](https://github.com/AI-Musical-Therapy/platform/graphs/contributors) page. We appreciate every contribution, no matter how small!

---

Thank you for contributing to better mental health through music! 🎵❤️
