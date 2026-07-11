# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x.x   | ✅ Active support   |
| 0.x.x   | ⚠️ Security fixes only |
| < 0.1.0 | ❌ Not supported    |

## Reporting a Vulnerability

**⚠️ Please do NOT report security vulnerabilities through public GitHub issues.**

### How to Report

1. **Email**: Send a detailed report to [security@aimusicaltherapy.com](mailto:security@aimusicaltherapy.com)
2. **Subject**: Use the format `[SECURITY] Brief description`
3. **Encrypt**: Use our PGP key (available on request) for sensitive information

### What to Include

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Impact assessment** (what could an attacker do?)
- **Affected versions** or components
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

### Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 5 business days |
| Status update | Every 7 days |
| Resolution target | Within 30 days for critical issues |
| Public disclosure | After fix is deployed |

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| **Critical** | Remote code execution, data breach, authentication bypass | 24 hours |
| **High** | Privilege escalation, significant data exposure | 48 hours |
| **Medium** | Cross-site scripting, CSRF, limited data exposure | 5 business days |
| **Low** | Information disclosure, minor configuration issues | 10 business days |

## Security Practices

### Authentication & Authorization
- All passwords are hashed using bcrypt with a minimum of 12 rounds
- JWT tokens with short expiration times
- OAuth 2.0 for third-party integrations
- Role-based access control (RBAC)

### Data Protection
- All data encrypted at rest (AES-256)
- TLS 1.3 for all data in transit
- PII data minimization
- GDPR compliance measures
- Regular data access audits

### Infrastructure
- Regular dependency vulnerability scanning (Dependabot)
- Container security scanning
- Network segmentation
- Rate limiting on all API endpoints
- Input validation and sanitization

### Monitoring
- Automated security scanning in CI/CD pipeline
- Real-time intrusion detection
- Audit logging for all administrative actions
- Anomaly detection on API usage patterns

## Responsible Disclosure

We follow a responsible disclosure policy:

1. **Reporter** submits vulnerability privately
2. **Team** acknowledges and assesses the report
3. **Team** develops and tests a fix
4. **Fix** is deployed to production
5. **Public advisory** is released with credit to the reporter
6. **Reporter** may publish their findings after the advisory

## Bug Bounty

We currently do not have a formal bug bounty program, but we deeply appreciate security researchers who report vulnerabilities responsibly. Significant findings will be acknowledged in our security advisories and CHANGELOG.

## Security Updates

Security advisories are published through:
- [GitHub Security Advisories](https://github.com/AI-Musical-Therapy/platform/security/advisories)
- Release notes in [CHANGELOG.md](CHANGELOG.md)
- Email notifications to registered users (for critical issues)

---

Thank you for helping keep the AI Musical Therapy Platform and its users safe! 🛡️
