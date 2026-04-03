# Coloki Platform - Security Implementation Guide

## Overview

This document outlines the comprehensive security measures implemented in the Coloki platform to protect user data, prevent attacks, and maintain platform integrity.

---

## 1. Authentication & Authorization

### Frontend Security
- **Secure Token Storage**: Access tokens stored in `sessionStorage` (cleared on browser close)
- **Refresh Token Strategy**: Automatic token refresh before expiration
- **Password Validation**: Strong password requirements enforced
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (@$!%*?&)

### Backend Security
- **Password Hashing**: bcryptjs with 10 salt rounds
- **JWT Authentication**: Secure token-based authentication
  - Token expiry: 24 hours
  - Refresh token expiry: 7 days
  - Token rotation on refresh
- **Session Management**: Track user activity with automatic timeout (30 minutes)
- **Role-Based Access Control**: Admin and User roles with proper authorization checks

---

## 2. API Security

### CSRF Protection
- Token-based CSRF protection on all state-changing requests
- Tokens included in request headers (`X-CSRF-Token`)
- Automatic CSRF token initialization on app startup

### Rate Limiting
- **Frontend**: 100 requests per minute per endpoint
- **Backend**: Configurable rate limiting via environment variables
- **IP-based Limiting**: Prevents abuse from single IP addresses

### Secure Headers
```
X-Frame-Options: DENY                           # Prevent clickjacking
X-Content-Type-Options: nosniff                 # Prevent MIME sniffing
X-XSS-Protection: 1; mode=block               # XSS protection
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000   # HTTPS only (production)
```

### CORS Configuration
- Whitelist allowed origins
- Credentials support enabled
- Allowed methods: GET, POST, PUT, DELETE, PATCH
- Allowed headers: Content-Type, Authorization

---

## 3. Input Validation & Sanitization

### Frontend Validation
- Email format validation (RFC standard)
- Phone number validation
- Password strength validation
- Input length limits
- Special character filtering

### Backend Validation
- **SQL Injection Prevention**: Pattern-based detection and blocking
- **XSS Prevention**: Script tag and event handler detection
- **Input Sanitization**: Removal of dangerous characters
- **Request Size Validation**: 10MB maximum payload size
- **Timeout Protection**: 30-second request/response timeout

---

## 4. Data Protection

### Encryption
- Sensitive data encrypted before storage
- Base64 encoding for temporary data
- Tokens use cryptographic algorithms

### Secure Storage
- **Session Storage**: For sensitive tokens (auto-cleared on browser close)
- **Local Storage**: For non-sensitive preferences only
- **Database**: Passwords hashed with bcrypt
- **Memory**: Sensitive data cleared after use

### HTTPS/TLS
- All communications encrypted in transit
- SSL certificate required in production
- HSTS headers enforced

---

## 5. Access Control

### Authentication Flow
```
User Login
    ↓
Email & Password Validation
    ↓
Password Comparison with Hash
    ↓
Access Token Generated (24h expiry)
    ↓
Refresh Token Generated (7d expiry)
    ↓
Tokens Stored Securely
    ↓
Session Created
```

### Authorization Levels
- **Guest**: Browse properties, view details
- **User**: Create bookings, send messages, write reviews
- **Host**: Manage properties, respond to inquiries
- **Admin**: Full platform management, moderation, analytics

---

## 6. Audit & Logging

### Security Events Logged
- Failed login attempts
- CSRF token validation failures
- SQL injection attempts
- XSS attempts
- Rate limit violations
- API errors (with status codes)
- User authentication events
- Sensitive data modifications

### Log Format
```
{
  timestamp: ISO-8601,
  level: 'info|warn|error',
  event: 'description',
  userId: 'user-id',
  ip: 'client-ip',
  userAgent: 'browser-info',
  details: { ... }
}
```

---

## 7. Security Configuration

### Environment Variables
Create `.env` file with:
```
JWT_SECRET=<32+ character random string>
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=https://coloki.tn,https://www.coloki.tn
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
SESSION_TIMEOUT=1800000
HTTPS_ENABLED=true
```

### Production Checklist
- [ ] All environment variables configured
- [ ] HTTPS certificates installed
- [ ] Database backups scheduled
- [ ] Rate limiting tested
- [ ] CORS origins verified
- [ ] Security headers confirmed
- [ ] Logging configured
- [ ] Backup retention policy set
- [ ] Incident response plan documented
- [ ] Regular security audits scheduled

---

## 8. Security Best Practices

### For Developers
1. Never commit secrets or credentials
2. Use environment variables for configuration
3. Validate all user input
4. Use parameterized queries (ORM)
5. Keep dependencies updated
6. Review security logs regularly
7. Follow principle of least privilege

### For Users
1. Use strong, unique passwords
2. Enable two-factor authentication when available
3. Don't share credentials or tokens
4. Clear browser data periodically
5. Use updated browsers
6. Report suspicious activity

### Regular Maintenance
- Weekly: Review security logs
- Monthly: Dependency updates
- Quarterly: Security audit
- Annually: Penetration testing

---

## 9. Incident Response

### In Case of Security Incident
1. **Immediate**: Isolate affected systems
2. **Assessment**: Identify scope and impact
3. **Notification**: Alert affected users
4. **Investigation**: Collect evidence and logs
5. **Remediation**: Fix vulnerabilities
6. **Review**: Post-incident analysis
7. **Communication**: Transparent updates

### Contact Security Team
Email: security@coloki.tn

---

## 10. Compliance

### Standards Compliance
- OWASP Top 10
- CSF (Cybersecurity Framework)
- GDPR Ready (for EU operations)
- PCI DSS Ready (if processing cards)

### Privacy Policy
- User data collected transparently
- Data retention policies defined
- User consent mechanisms in place
- Right to access/delete data

---

## 11. Dependencies & Versions

### Security-Related Packages
- `helmet`: ^7.0.0 - Security headers
- `bcryptjs`: ^2.4.3 - Password hashing
- `jsonwebtoken`: ^9.1.0 - JWT tokens
- `express-rate-limit`: Latest - Rate limiting
- `joi`: ^17.10.2 - Input validation
- `cors`: ^2.8.5 - CORS management

### Regular Updates
```bash
npm audit
npm audit fix
npm update
```

---

## 12. Security Endpoints

### Auth Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Token revocation
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/2fa` - Two-factor authentication

### Protected Endpoints
- All property modifications require authentication
- All bookings require user authentication
- All messages require user authentication
- Admin endpoints require admin role

---

## 13. Frontend Security Headers

### Content Security Policy (when needed)
```
default-src 'self'
script-src 'self' https://cdn.jsdelivr.net
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
font-src 'self'
connect-src 'self' https://api.coloki.tn
```

---

## 14. Testing Security

### Run Security Tests
```bash
# Check dependencies for vulnerabilities
npm audit

# Check for exposed secrets
npm run check-secrets

# Run security linter
npm run lint-security

# SAST - Static Application Security Testing
npm run sast
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-04-03 | Initial security implementation | Security Team |
| | CSRF protection added | |
| | Encryption utilities added | |
| | Input validation enhanced | |
| | Rate limiting configured | |

---

## References

- [OWASP Security Guidelines](https://owasp.org)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

**Last Updated**: April 3, 2026  
**Next Review**: July 3, 2026  
**Status**: Active
