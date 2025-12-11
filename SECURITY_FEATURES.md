# Railway Reservation System - Security Features

## 🔒 Enterprise-Grade Security Implementation

This project now includes comprehensive security features ready for production deployment.

---

## Security Features

### 1. **JWT Authentication** ✅
- Token-based authentication (stateless)
- Access tokens (1 hour expiry)
- Refresh tokens (7 days expiry)
- Secure httpOnly cookies
- Role-based access control (admin/passenger)

### 2. **Password Security** ✅
- bcrypt hashing (12 rounds)
- Password strength validation:
  - Minimum 8 characters
  - Uppercase + lowercase + digit + special char
- Secure password verification

### 3. **Input Validation** ✅
- Pydantic models for all inputs
- Email format validation
- Phone number validation (Indian format)
- PNR format validation
- Date validation (future dates only)
- XSS protection (HTML escaping)
- Character limits enforced

### 4. **Rate Limiting** ✅
- Per-IP rate limiting
- Customizable per endpoint
- Auto-blocking on excessive requests
- Default: 100 requests/minute
- Login: 5 attempts/minute
- Registration: 3 attempts/5 minutes

### 5. **CSRF Protection** ✅
- Token-based CSRF validation
- Automatic token generation
- Cookie + header validation
- Exempt paths for login

### 6. **Security Headers** ✅
- Content-Security-Policy
- X-Frame-Options (clickjacking prevention)
- X-Content-Type-Options (MIME sniffing prevention)
- Strict-Transport-Security (HTTPS enforcement)
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### 7. **CORS Security** ✅
- Restricted to specific origins
- Configurable allowed domains
- Credentials support
- Proper HTTP methods whitelist

### 8. **MongoDB Security** ✅
- Parameterized queries (NoSQL injection prevention)
- Database indexes for performance
- Schema validation
- Connection pooling
- Query sanitization
- Safe query methods

### 9. **Logging & Monitoring** ✅
- Security event logging
- Failed authentication tracking
- Rate limit violations
- CSRF failures
- Unauthorized access attempts
- Error tracking
- IP address logging
- Log rotation (10MB files, 5 backups)

### 10. **Request Security** ✅
- Request size limiting (10MB default)
- Content-Type validation
- Secure cookie configuration
- Session security

---

## File Structure

```
backend/
├── security/
│   ├── __init__.py           # Security module exports
│   ├── auth.py               # JWT authentication & authorization
│   ├── validators.py         # Pydantic input validators
│   ├── rate_limiter.py       # Rate limiting implementation
│   ├── middleware.py         # CSRF, headers, CORS
│   ├── database.py           # Secure MongoDB operations
│   └── logging_config.py     # Security logging
├── app_secure.py             # Secure Flask application
└── ...

SECURITY_MIGRATION_GUIDE.md  # Complete migration guide
ROUTE_MIGRATION_EXAMPLES.md  # Example route conversions
PRODUCTION_DEPLOYMENT_GUIDE.md # Deployment instructions
.env.example                  # Environment template
```

---

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy example and fill in values
cp .env.example .env

# Generate secure keys
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
```

### 3. Update .env
```env
SECRET_KEY=your_generated_secret_key_here
JWT_SECRET_KEY=your_generated_jwt_secret_here
MONGO_URI=your_mongodb_uri
DB_NAME=railway_reservation
CORS_ALLOWED_ORIGINS=http://localhost:5000
DEBUG=False
```

### 4. Run Secure Application
```bash
# Development
python backend/app_secure.py

# Production (use gunicorn)
gunicorn -w 4 -b 0.0.0.0:5000 backend.app_secure:app
```

---

## Migration from Old App

See **`SECURITY_MIGRATION_GUIDE.md`** for complete migration instructions.

### Quick Migration Steps:
1. ✅ Install new dependencies
2. ✅ Generate secure keys
3. ✅ Update environment variables
4. ✅ Migrate existing passwords to bcrypt
5. ✅ Update frontend for JWT
6. ✅ Update backend routes (see `ROUTE_MIGRATION_EXAMPLES.md`)
7. ✅ Test thoroughly
8. ✅ Deploy to production

---

## API Authentication

### Login (Get JWT Token)
```bash
POST /api/passenger/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!@#"
}

Response:
{
  "success": true,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires_at": "2024-01-01T13:00:00",
  "user_id": "...",
  "email": "user@example.com"
}
```

### Authenticated Request
```bash
GET /api/passenger/bookings
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
X-CSRF-Token: <csrf_token_from_cookie>
```

### Token Refresh
```bash
POST /api/refresh-token
Cookie: refresh_token=...

Response:
{
  "success": true,
  "access_token": "new_token_here",
  "expires_at": "2024-01-01T14:00:00"
}
```

---

## Route Protection Examples

### Public Route (No Auth)
```python
@app.route('/api/trains', methods=['GET'])
@rate_limit(max_requests=30, window_seconds=60)
def get_trains():
    # Public access
    pass
```

### Protected Route (Auth Required)
```python
from backend.security.auth import token_required

@app.route('/api/bookings', methods=['POST'])
@token_required
@rate_limit(max_requests=10, window_seconds=60)
def create_booking():
    user_id = request.user_id  # Available from decorator
    # Only authenticated users
    pass
```

### Admin Route (Admin Only)
```python
from backend.security.auth import admin_required

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    # Only admin role can access
    pass
```

### Input Validation
```python
from backend.security.validators import validate_request_data, BookingValidator

@app.route('/api/bookings', methods=['POST'])
@token_required
def create_booking():
    is_valid, data_or_errors = validate_request_data(
        BookingValidator,
        request.json
    )
    
    if not is_valid:
        return jsonify({'error': data_or_errors}), 400
    
    # data_or_errors now contains validated, sanitized data
    pass
```

---

## Validation Rules

### User Registration
- **Email**: Valid format, max 100 chars
- **Password**: 
  - Min 8, max 128 characters
  - Must have uppercase + lowercase + digit + special char
- **Name**: Min 2, max 100 chars (XSS sanitized)
- **Phone**: Valid Indian format (10 digits)

### Booking Creation
- **Train ID**: Required
- **Seats**: 1-10 seats, valid format
- **Date**: Future date only, YYYY-MM-DD format
- **Amount**: 0-100,000 INR
- **Class**: Valid class code (SL, 3A, 2A, 1A, CC, EC, 2S)

### PNR Search
- **PNR**: Exactly 10 alphanumeric characters

---

## Security Logging

### Log Files
- `logs/security.log` - Authentication, rate limits, CSRF
- `logs/app.log` - Application events
- `logs/errors.log` - Errors and exceptions

### Logged Events
- ✅ Login attempts (success/failure)
- ✅ Failed validation attempts
- ✅ Rate limit violations
- ✅ CSRF failures
- ✅ Unauthorized access attempts
- ✅ Data modifications
- ✅ Suspicious activity
- ✅ All errors with context

### Example Log Entry
```
2024-01-01 12:00:00 | WARNING | Login failed | test@example.com | Wrong password | 192.168.1.1
```

---

## Production Deployment

See **`PRODUCTION_DEPLOYMENT_GUIDE.md`** for complete deployment guide.

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Set environment variables in Vercel dashboard
# Deploy
vercel --prod
```

### Required Environment Variables
```
SECRET_KEY=<strong-secret>
JWT_SECRET_KEY=<strong-jwt-secret>
MONGO_URI=<mongodb-atlas-uri>
CORS_ALLOWED_ORIGINS=https://yourapp.vercel.app
FLASK_ENV=production
DEBUG=False
```

---

## Security Best Practices

### ✅ DO
- Use strong, unique SECRET_KEY and JWT_SECRET_KEY
- Enable HTTPS in production
- Set specific CORS origins
- Monitor security logs regularly
- Keep dependencies updated
- Use environment variables for secrets
- Implement rate limiting on all endpoints
- Validate all user inputs
- Use parameterized queries
- Log security events

### ❌ DON'T
- Use default secret keys
- Enable DEBUG in production
- Allow CORS from all origins (*)
- Store secrets in code
- Trust user input without validation
- Skip rate limiting
- Expose error details to users
- Use weak passwords
- Commit .env file to git

---

## Testing Security

### Test Authentication
```bash
# Valid login
curl -X POST http://localhost:5000/api/passenger/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Invalid token
curl http://localhost:5000/api/bookings \
  -H "Authorization: Bearer invalid_token"
```

### Test Rate Limiting
```bash
# Rapid requests (should get blocked)
for i in {1..150}; do
  curl http://localhost:5000/api/trains &
done
```

### Test Input Validation
```bash
# Weak password
curl -X POST http://localhost:5000/api/passenger/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak","name":"Test"}'

# Invalid email
curl -X POST http://localhost:5000/api/passenger/register \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"Test123!@#","name":"Test"}'
```

---

## Monitoring

### Health Check
```bash
curl https://yourapp.vercel.app/health
```

### Check Logs
```bash
# Security events
tail -f logs/security.log

# Errors
tail -f logs/errors.log

# Application
tail -f logs/app.log
```

---

## Support

- **Migration Guide**: `SECURITY_MIGRATION_GUIDE.md`
- **Route Examples**: `ROUTE_MIGRATION_EXAMPLES.md`
- **Deployment Guide**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Environment Template**: `.env.example`
- **Security Module**: `backend/security/`

---

## Security Updates

- **v2.0.0** - Complete security overhaul
  - JWT authentication
  - bcrypt password hashing
  - Input validation (Pydantic)
  - Rate limiting
  - CSRF protection
  - Security headers
  - CORS restrictions
  - MongoDB security
  - Comprehensive logging

---

## License

This security implementation follows industry best practices and OWASP guidelines.

---

## Questions?

Refer to the documentation files or check the inline code documentation in `backend/security/` modules.

**Stay Secure! 🔒**
