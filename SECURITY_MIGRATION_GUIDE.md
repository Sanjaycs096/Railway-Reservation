# Security Implementation & Migration Guide

## Overview
This guide helps you migrate from the current session-based authentication to JWT-based authentication with comprehensive security features.

## ⚠️ IMPORTANT: Pre-Migration Checklist

### 1. Backup Current Database
```bash
# MongoDB dump
mongodump --uri="your_mongodb_uri" --out=backup_$(date +%Y%m%d)
```

### 2. Update Environment Variables
Copy `.env.example` to update your `.env` file with new security variables:
```bash
cp .env.example .env.new
# Then merge the new variables into your existing .env
```

### 3. Generate Strong Secret Keys
```bash
# Run this in Python to generate secure keys
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
```

## Security Features Implemented

### 1. JWT Authentication (✅)
- **Replace**: Session-based auth
- **With**: Token-based auth (access + refresh tokens)
- **Benefits**: Stateless, scalable, secure

### 2. bcrypt Password Hashing (✅)
- **Replace**: werkzeug password hashing
- **With**: bcrypt with 12 rounds
- **Benefits**: Industry-standard, slow hash (brute-force resistant)

### 3. Input Validation (✅)
- **Tool**: Pydantic models
- **Features**: Email validation, password strength, data sanitization
- **Protection**: XSS, injection attacks

### 4. Rate Limiting (✅)
- **Default**: 100 requests/minute per IP
- **Customizable**: Per-endpoint limits
- **Protection**: Brute-force, DDoS

### 5. CSRF Protection (✅)
- **Mechanism**: Token-based
- **Scope**: All state-changing requests (POST, PUT, DELETE)
- **Exempt**: Login endpoints (no prior token)

### 6. Security Headers (✅)
- Content-Security-Policy
- X-Frame-Options (clickjacking)
- X-Content-Type-Options (MIME sniffing)
- Strict-Transport-Security (HTTPS)
- And more...

### 7. CORS Restrictions (✅)
- **Replace**: CORS(app) - allows all origins
- **With**: Specific allowed origins
- **Configuration**: Set in .env

### 8. MongoDB Security (✅)
- Indexes for performance
- Schema validation
- Query sanitization (NoSQL injection prevention)
- Connection pooling

### 9. Security Logging (✅)
- Authentication attempts
- Failed validations
- Rate limit violations
- Suspicious activity
- All logged with IP, timestamp, context

## Migration Steps

### Step 1: Install New Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Update Environment Variables
Add these to your `.env`:
```env
# Security Keys (REQUIRED - generate new ones!)
SECRET_KEY=<your_generated_secret_key>
JWT_SECRET_KEY=<your_generated_jwt_secret>

# JWT Settings
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=604800

# CORS (Update with your domains)
CORS_ALLOWED_ORIGINS=http://localhost:5000,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_ENABLED=True
MAX_REQUESTS_PER_MINUTE=60

# Logging
LOG_LEVEL=INFO
LOG_DIR=logs
```

### Step 3: Migrate Existing User Passwords

**IMPORTANT**: Existing passwords are hashed with werkzeug. They need to be re-hashed with bcrypt.

#### Option A: Force Password Reset (Recommended)
1. Add `password_needs_reset` flag to all users
2. On next login, prompt for password reset
3. Re-hash with bcrypt

#### Option B: Gradual Migration
1. Keep both hash verification methods temporarily
2. On successful login with old hash, re-hash with bcrypt
3. Remove old method after grace period

**Migration Script** (Option B):
```python
# backend/utils/migrate_passwords.py
from backend.security.auth import hash_password
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def migrate_passwords():
    """Add migration flag to existing users"""
    client = MongoClient(os.getenv('MONGO_URI'))
    db = client[os.getenv('DB_NAME', 'railway_reservation')]
    
    # Mark all existing users for password migration
    result = db.users.update_many(
        {'password_hash': {'$exists': True}},
        {'$set': {'needs_password_migration': True}}
    )
    
    print(f"Marked {result.modified_count} users for password migration")

if __name__ == '__main__':
    migrate_passwords()
```

### Step 4: Update Frontend for JWT

#### A. Login Response Handling
**Before**:
```javascript
// Session-based
fetch('/api/passenger/login', {
    method: 'POST',
    body: JSON.stringify({email, password})
})
.then(res => res.json())
.then(data => {
    // Session automatically stored by browser
})
```

**After**:
```javascript
// JWT-based
fetch('/api/passenger/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({email, password})
})
.then(res => res.json())
.then(data => {
    if (data.success) {
        // Token stored in httpOnly cookie automatically
        // Also available in response if needed in localStorage
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_id', data.user_id);
    }
})
```

#### B. Include Tokens in Requests
```javascript
// For API calls
fetch('/api/bookings', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
    },
    credentials: 'include'  // Include cookies
})
```

#### C. CSRF Token Handling
```javascript
// Get CSRF token from cookie
function getCsrfToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];
}

// Include in POST/PUT/DELETE requests
fetch('/api/bookings', {
    method: 'POST',
    headers: {
        'X-CSRF-Token': getCsrfToken(),
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
})
```

#### D. Token Refresh Handling
```javascript
// Refresh token before expiry
async function refreshToken() {
    const response = await fetch('/api/refresh-token', {
        method: 'POST',
        credentials: 'include'  // Send refresh token cookie
    });
    
    if (response.ok) {
        const data = await response.json();
        // New access token in cookie
        return true;
    }
    
    // Refresh failed - redirect to login
    window.location.href = '/';
    return false;
}

// Call every 50 minutes (before 60-minute expiry)
setInterval(refreshToken, 50 * 60 * 1000);
```

### Step 5: Update Backend Routes

See `ROUTE_MIGRATION_EXAMPLES.md` for detailed route updates.

**Quick Example**:

**Before** (routes.py):
```python
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    passenger_id = session.get('passenger_id')
    if not passenger_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = request.json
    # ... process booking
```

**After** (with security):
```python
from backend.security.auth import token_required
from backend.security.validators import validate_request_data, BookingValidator
from backend.security.rate_limiter import rate_limit

@app.route('/api/bookings', methods=['POST'])
@token_required
@rate_limit(max_requests=10, window_seconds=60)
def create_booking():
    # Validate input
    is_valid, data_or_errors = validate_request_data(
        BookingValidator,
        request.json
    )
    
    if not is_valid:
        return jsonify({'error': data_or_errors}), 400
    
    # request.user_id available from @token_required
    passenger_id = request.user_id
    
    # ... process booking with validated data
```

### Step 6: Test Security Features

#### A. Test JWT Authentication
```bash
# Login and get token
curl -X POST http://localhost:5000/api/passenger/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Use token in request
curl http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <your_token>"
```

#### B. Test Rate Limiting
```bash
# Send 150 requests rapidly (should get blocked)
for i in {1..150}; do
  curl http://localhost:5000/api/trains &
done
```

#### C. Test Input Validation
```bash
# Should fail validation
curl -X POST http://localhost:5000/api/passenger/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"weak"}'
```

### Step 7: Deploy to Production

#### Vercel Deployment

1. **Update `vercel.json`**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/app_secure.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/app_secure.py"
    },
    {
      "src": "/(.*)",
      "dest": "backend/app_secure.py"
    }
  ],
  "env": {
    "FLASK_ENV": "production"
  }
}
```

2. **Set Environment Variables in Vercel Dashboard**:
   - All variables from `.env`
   - Especially `SECRET_KEY` and `JWT_SECRET_KEY`
   - `CORS_ALLOWED_ORIGINS` with your Vercel URL

3. **Deploy**:
```bash
vercel --prod
```

## Security Checklist Before Going Live

- [ ] Strong SECRET_KEY and JWT_SECRET_KEY set
- [ ] DEBUG=False in production
- [ ] CORS_ALLOWED_ORIGINS set to your domain(s)
- [ ] HTTPS enabled (Vercel handles this)
- [ ] MongoDB connection string uses TLS
- [ ] All existing passwords migrated to bcrypt
- [ ] Rate limiting enabled
- [ ] Security logging configured
- [ ] Backup procedures in place
- [ ] Monitoring set up for security logs
- [ ] Test all endpoints with authentication
- [ ] Test rate limiting
- [ ] Test input validation
- [ ] Review and update CORS origins

## Rollback Plan

If issues occur:

1. **Switch back to old app.py**:
```bash
# Rename files
mv backend/app_secure.py backend/app_secure.py.new
mv backend/app.py.backup backend/app.py
```

2. **Restore database from backup**:
```bash
mongorestore --uri="your_mongodb_uri" backup_20240101/
```

3. **Revert environment variables**

## Monitoring & Maintenance

### Check Logs Regularly
```bash
# Security events
tail -f logs/security.log

# Application logs
tail -f logs/app.log

# Errors
tail -f logs/errors.log
```

### Common Issues

**Issue**: "Invalid or expired token"
- **Cause**: Token expired or invalid secret key
- **Solution**: Refresh token or verify JWT_SECRET_KEY matches

**Issue**: "Rate limit exceeded"
- **Cause**: Too many requests from one IP
- **Solution**: Wait 15 minutes or adjust rate limits

**Issue**: "CSRF validation failed"
- **Cause**: Missing CSRF token in request
- **Solution**: Include X-CSRF-Token header

## Support & Resources

- Security module docs: `backend/security/`
- Example routes: `ROUTE_MIGRATION_EXAMPLES.md`
- Environment template: `.env.example`
- Logging: `logs/` directory

## Next Steps

1. Read this guide completely
2. Test in development environment first
3. Run migration scripts
4. Update frontend code
5. Test thoroughly
6. Deploy to staging
7. Deploy to production

## Questions?

Check the inline documentation in:
- `backend/security/auth.py` - Authentication
- `backend/security/validators.py` - Input validation
- `backend/security/middleware.py` - CSRF, headers
- `backend/security/rate_limiter.py` - Rate limiting
- `backend/security/database.py` - MongoDB security
