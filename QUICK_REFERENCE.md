# 🚀 Quick Reference - Security Features

## Installation & Setup (3 Commands)

```bash
pip install -r requirements.txt    # Install dependencies
python setup_security.py           # Generate keys & create .env
python setup_database.py           # Create indexes & validation
```

---

## Start Application

```bash
# Development
python backend/app_secure.py

# Production
gunicorn -w 4 -b 0.0.0.0:5000 backend.app_secure:app
```

---

## Environment Variables (Required)

```env
SECRET_KEY=<generate_with_secrets.token_hex(32)>
JWT_SECRET_KEY=<generate_with_secrets.token_hex(32)>
MONGO_URI=mongodb://localhost:27017/railway_reservation
CORS_ALLOWED_ORIGINS=http://localhost:5000
```

---

## Common Decorators

### Protect Route (Authentication Required)
```python
from backend.security.auth import token_required

@app.route('/api/bookings', methods=['GET'])
@token_required
def get_bookings():
    user_id = request.user_id  # Available from decorator
    # ... your code
```

### Admin Only Route
```python
from backend.security.auth import admin_required

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users():
    # Only admins can access
    # ... your code
```

### Rate Limiting
```python
from backend.security.rate_limiter import rate_limit

@app.route('/api/search', methods=['POST'])
@rate_limit(max_requests=10, window_seconds=60)
def search():
    # Max 10 requests per minute per IP
    # ... your code
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
```

### Combine Multiple Decorators
```python
from backend.security.auth import token_required
from backend.security.validators import validate_request_data, BookingValidator
from backend.security.rate_limiter import rate_limit

@app.route('/api/bookings', methods=['POST'])
@token_required                                   # Auth required
@rate_limit(max_requests=10, window_seconds=60)  # Rate limit
def create_booking():
    # Validate input
    is_valid, data = validate_request_data(BookingValidator, request.json)
    if not is_valid:
        return jsonify({'error': data}), 400
    
    # User authenticated and input validated
    user_id = request.user_id
    # ... your code
```

---

## Validation Models

### User Registration
```python
from backend.security.validators import UserValidator

# Validates:
# - Email format
# - Password strength (min 8, uppercase, lowercase, digit, special)
# - Name (2-100 chars)
# - Phone (Indian format)
```

### Booking Creation
```python
from backend.security.validators import BookingValidator

# Validates:
# - Train ID required
# - Seats (1-10, valid format)
# - Date (future dates only, YYYY-MM-DD)
# - Amount (0-100,000)
# - Class code (SL, 3A, 2A, etc.)
```

### Login
```python
from backend.security.validators import LoginValidator

# Validates:
# - Email format
# - Password not empty
```

---

## Security Logging

```python
from backend.security.logging_config import security_logger

# Log authentication
security_logger.log_auth_attempt(email, success=True)

# Log validation failure
security_logger.log_failed_validation(endpoint, errors)

# Log rate limit
security_logger.log_rate_limit(endpoint)

# Log unauthorized access
security_logger.log_unauthorized_access(endpoint, required_role='admin')

# Log data modification
security_logger.log_data_modification('insert', 'bookings', booking_id)

# Log error
security_logger.log_error(exception, context='booking_creation')

# Log suspicious activity
security_logger.log_suspicious_activity('multiple_failed_logins', details)
```

---

## Safe Database Operations

```python
# Instead of db.users.find_one()
user = app.mongo_manager.safe_find_one('users', {'email': email})

# Instead of db.bookings.find()
bookings = app.mongo_manager.safe_find('bookings', {'passenger_id': user_id}, limit=100)

# Instead of db.bookings.insert_one()
booking_id = app.mongo_manager.safe_insert_one('bookings', booking_data)

# Instead of db.bookings.update_one()
success = app.mongo_manager.safe_update_one('bookings', {'_id': id}, {'$set': update_data})
```

---

## Password Operations

```python
from backend.security.auth import hash_password, verify_password

# Hash password
hashed = hash_password('MyPassword123!@#')

# Verify password
is_valid = verify_password('MyPassword123!@#', hashed)
```

---

## JWT Operations

```python
from backend.security.auth import generate_token, verify_token

# Generate access token
access_token, expiry = generate_token(user_id, 'passenger', 'access')

# Generate refresh token
refresh_token, expiry = generate_token(user_id, 'passenger', 'refresh')

# Verify token
payload = verify_token(token, 'access')
if payload:
    user_id = payload['user_id']
    role = payload['role']
```

---

## Rate Limits (Default)

| Endpoint | Limit |
|----------|-------|
| General API | 100 requests/minute |
| Login | 5 attempts/minute |
| Registration | 3 attempts/5 minutes |
| Booking | 10 requests/minute |
| Search | 30 requests/minute |

Exceeded limit = 15-minute IP block

---

## Security Headers (Automatic)

✅ Content-Security-Policy  
✅ X-Frame-Options: DENY  
✅ X-Content-Type-Options: nosniff  
✅ Strict-Transport-Security  
✅ X-XSS-Protection  
✅ Referrer-Policy  
✅ Permissions-Policy  

---

## CSRF Protection

Frontend must include CSRF token:

```javascript
// Get token from cookie
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
    body: JSON.stringify(data)
})
```

---

## Error Handlers (Automatic)

- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `413` - Request Too Large (>10MB)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## Log Files

```
logs/
├── security.log  # Auth, rate limits, CSRF, suspicious activity
├── app.log       # Application events
└── errors.log    # Errors with stack traces
```

---

## Testing Commands

```bash
# Test login
curl -X POST http://localhost:5000/api/passenger/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#"}'

# Test authenticated request
curl http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <your_token>"

# Test rate limiting (150 requests)
for i in {1..150}; do curl http://localhost:5000/api/trains & done

# Test weak password (should fail)
curl -X POST http://localhost:5000/api/passenger/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak","name":"Test"}'
```

---

## Deployment Checklist

- [ ] `SECRET_KEY` = strong random value
- [ ] `JWT_SECRET_KEY` = strong random value (different from SECRET_KEY)
- [ ] `DEBUG=False`
- [ ] `CORS_ALLOWED_ORIGINS` = your domain(s)
- [ ] MongoDB indexes created
- [ ] HTTPS enabled
- [ ] Environment variables set in Vercel
- [ ] Logs directory writable
- [ ] Backup procedures tested

---

## Common Imports

```python
# Authentication
from backend.security.auth import (
    token_required,
    admin_required,
    hash_password,
    verify_password,
    generate_token,
    verify_token
)

# Validation
from backend.security.validators import (
    validate_request_data,
    LoginValidator,
    UserValidator,
    BookingValidator,
    PNRSearchValidator,
    sanitize_input
)

# Rate Limiting
from backend.security.rate_limiter import rate_limit

# Middleware
from backend.security.middleware import limit_request_size

# Logging
from backend.security.logging_config import security_logger

# Database
from backend.security.database import SecureMongoDBManager
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README_SECURE.md` | Main documentation |
| `SECURITY_FEATURES.md` | Feature details |
| `SECURITY_MIGRATION_GUIDE.md` | Migration steps |
| `ROUTE_MIGRATION_EXAMPLES.md` | Code examples |
| `PRODUCTION_DEPLOYMENT_GUIDE.md` | Deployment |
| `SECURITY_IMPLEMENTATION_SUMMARY.md` | Summary |
| `.env.example` | Environment template |

---

## Quick Troubleshooting

**"ModuleNotFoundError"**  
→ `pip install -r requirements.txt`

**"Invalid token"**  
→ Check `JWT_SECRET_KEY` in .env

**"Rate limit exceeded"**  
→ Wait 15 minutes or adjust limits

**"CSRF validation failed"**  
→ Include `X-CSRF-Token` header

**"Database connection failed"**  
→ Check `MONGO_URI` in .env

---

## Generate Secure Keys

```bash
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
```

---

**Keep this reference handy! 📌**
