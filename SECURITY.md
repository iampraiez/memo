# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. Do Not Open a Public Issue

Please **do not** create a public GitHub issue for security vulnerabilities.

### 2. Email Us Directly

Send details to: **security@memorylane.app**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### 4. Disclosure Policy

- We will acknowledge your report within 48 hours
- We will provide regular updates on our progress
- We will notify you when the vulnerability is fixed
- We will publicly disclose the vulnerability after a fix is released
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When using Memory Lane:

1. **Keep Dependencies Updated**: Regularly update to the latest version
2. **Use Strong Passwords**: Enable 2FA when available
3. **Secure Environment Variables**: Never commit `.env` files
4. **HTTPS Only**: Always use HTTPS in production
5. **Regular Backups**: Backup your database regularly
6. **Monitor Logs**: Check application logs for suspicious activity

## Known Security Considerations

### Authentication
- Sessions expire after 30 days of inactivity
- Passwords are hashed with bcrypt (10 rounds)
- OAuth tokens are encrypted at rest

### Data Protection
- All API endpoints require authentication
- User data is isolated by user ID
- File uploads are validated and sanitized

### Infrastructure
- Database connections use SSL/TLS
- Environment variables are validated on startup
- Rate limiting is applied to API endpoints

## Security Features

- ✅ NextAuth.js for secure authentication
- ✅ CSRF protection enabled
- ✅ SQL injection prevention via Drizzle ORM
- ✅ XSS protection with React
- ✅ Secure password hashing (bcrypt)
- ✅ Environment variable validation (Zod)
- ✅ Automated dependency scanning (Dependabot)
- ✅ Code security scanning (CodeQL)

## Bug Bounty Program

We currently do not have a bug bounty program, but we greatly appreciate responsible disclosure and will acknowledge contributors in our security advisories.

## Contact

For security-related questions: security@memorylane.app

---

**Thank you for helping keep Memory Lane secure!**
