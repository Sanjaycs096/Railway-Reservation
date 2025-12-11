# Route Migration Examples
## Converting Existing Routes to Use Security Features

This document shows how to update your existing routes to use the new security features.

---

## Example 1: Passenger Login

### Before (Session-based)
```python
@app.route('/api/passenger/login', methods=['POST'])
def passenger_login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        user = db.users.find_one({'email': email, 'role': 'passenger'})
        
        if user and check_password_hash(user['password'], password):
            session['passenger_id'] = str(user['_id'])
            session['email'] = user['email']
            return jsonify({'success': True, 'user_id': str(user['_id'])})
        
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### After (JWT with Security)
```python
from backend.security.auth import hash_password, verify_password, generate_token
from backend.security.validators import validate_request_data, LoginValidator
from backend.security.rate_limiter import rate_limit
from backend.security.logging_config import security_logger

@app.route('/api/passenger/login', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=60)  # 5 login attempts per minute
def passenger_login():
    try:
        # Validate input
        is_valid, data_or_errors = validate_request_data(LoginValidator, request.json)
        if not is_valid:
            security_logger.log_failed_validation('passenger_login', data_or_errors)
            return jsonify({'error': 'Invalid input', 'details': data_or_errors}), 400
        
        email = data_or_errors['email']
        password = data_or_errors['password']
        
        # Find user
        user = app.mongo_manager.safe_find_one('users', {
            'email': email,
            'role': 'passenger'
        })
        
        if not user:
            security_logger.log_auth_attempt(email, False, 'User not found')
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        if not verify_password(password, user['password_hash']):
            security_logger.log_auth_attempt(email, False, 'Wrong password')
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate tokens
        access_token, access_expiry = generate_token(
            str(user['_id']),
            'passenger',
            'access'
        )
        refresh_token, refresh_expiry = generate_token(
            str(user['_id']),
            'passenger',
            'refresh'
        )
        
        # Log successful login
        security_logger.log_auth_attempt(email, True)
        
        # Create response
        response = jsonify({
            'success': True,
            'user_id': str(user['_id']),
            'email': user['email'],
            'name': user.get('name'),
            'access_token': access_token,
            'expires_at': access_expiry.isoformat()
        })
        
        # Set secure cookies
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=app.config['JWT_ACCESS_TOKEN_EXPIRES']
        )
        
        response.set_cookie(
            'refresh_token',
            refresh_token,
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=7 * 24 * 3600  # 7 days
        )
        
        return response
    
    except Exception as e:
        security_logger.log_error(e, 'passenger_login')
        return jsonify({'error': 'Login failed'}), 500
```

---

## Example 2: Passenger Registration

### Before
```python
@app.route('/api/passenger/register', methods=['POST'])
def passenger_register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if db.users.find_one({'email': email}):
        return jsonify({'error': 'Email already exists'}), 400
    
    user_data = {
        'email': email,
        'password': generate_password_hash(password),
        'name': name,
        'role': 'passenger'
    }
    
    result = db.users.insert_one(user_data)
    return jsonify({'success': True, 'user_id': str(result.inserted_id)})
```

### After (With Security)
```python
from backend.security.auth import hash_password, generate_token
from backend.security.validators import validate_request_data, UserValidator
from backend.security.rate_limiter import rate_limit

@app.route('/api/passenger/register', methods=['POST'])
@rate_limit(max_requests=3, window_seconds=300)  # 3 registrations per 5 minutes
def passenger_register():
    try:
        # Validate input (includes email format, password strength, XSS protection)
        is_valid, data_or_errors = validate_request_data(UserValidator, request.json)
        if not is_valid:
            security_logger.log_failed_validation('passenger_register', data_or_errors)
            return jsonify({'error': 'Validation failed', 'details': data_or_errors}), 400
        
        email = data_or_errors['email']
        password = data_or_errors['password']
        name = data_or_errors['name']
        phone = data_or_errors.get('phone')
        
        # Check if user exists
        existing_user = app.mongo_manager.safe_find_one('users', {'email': email})
        if existing_user:
            security_logger.log_failed_validation('passenger_register', 'Email already exists')
            return jsonify({'error': 'Email already registered'}), 400
        
        # Hash password with bcrypt
        password_hash = hash_password(password)
        
        # Create user document
        user_data = {
            'email': email,
            'password_hash': password_hash,
            'name': name,
            'phone': phone,
            'role': 'passenger',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Insert user
        user_id = app.mongo_manager.safe_insert_one('users', user_data)
        if not user_id:
            return jsonify({'error': 'Registration failed'}), 500
        
        # Generate tokens
        access_token, access_expiry = generate_token(user_id, 'passenger', 'access')
        refresh_token, _ = generate_token(user_id, 'passenger', 'refresh')
        
        # Log registration
        security_logger.log_data_modification('insert', 'users', user_id)
        security_logger.app_logger.info(f"New user registered: {email}")
        
        # Create response
        response = jsonify({
            'success': True,
            'message': 'Registration successful',
            'user_id': user_id,
            'access_token': access_token
        })
        
        # Set cookies
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=app.config['JWT_ACCESS_TOKEN_EXPIRES']
        )
        
        response.set_cookie(
            'refresh_token',
            refresh_token,
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=7 * 24 * 3600
        )
        
        return response
    
    except Exception as e:
        security_logger.log_error(e, 'passenger_register')
        return jsonify({'error': 'Registration failed'}), 500
```

---

## Example 3: Create Booking

### Before
```python
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    passenger_id = session.get('passenger_id')
    if not passenger_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = request.json
    booking_data = {
        'passenger_id': passenger_id,
        'train_id': data.get('train_id'),
        'seats': data.get('seats'),
        'amount': data.get('amount'),
        'pnr': generate_pnr()
    }
    
    result = db.bookings.insert_one(booking_data)
    return jsonify({'success': True, 'booking_id': str(result.inserted_id)})
```

### After (With Security)
```python
from backend.security.auth import token_required
from backend.security.validators import validate_request_data, BookingValidator
from backend.security.rate_limiter import rate_limit
from backend.security.middleware import limit_request_size

@app.route('/api/bookings', methods=['POST'])
@token_required  # Validates JWT and sets request.user_id
@rate_limit(max_requests=10, window_seconds=60)  # 10 bookings per minute max
@limit_request_size(max_size_mb=1)  # Max 1MB request
def create_booking():
    try:
        # Validate booking data
        is_valid, data_or_errors = validate_request_data(BookingValidator, request.json)
        if not is_valid:
            security_logger.log_failed_validation('create_booking', data_or_errors)
            return jsonify({'error': 'Invalid booking data', 'details': data_or_errors}), 400
        
        # request.user_id available from @token_required decorator
        passenger_id = request.user_id
        
        # Verified and sanitized data
        train_id = data_or_errors['train_id']
        seats = data_or_errors['seats']  # Already validated (1-10 seats)
        amount = data_or_errors['amount']  # Already validated (0-100000)
        booking_date = data_or_errors['date']  # Already validated (future date)
        class_code = data_or_errors.get('class_code', 'SL')
        source = data_or_errors.get('source')
        destination = data_or_errors.get('destination')
        
        # Generate PNR
        pnr = generate_pnr()
        
        # Create booking document
        booking_data = {
            'passenger_id': passenger_id,
            'train_id': train_id,
            'train_name': data_or_errors['train_name'],
            'seats': seats,
            'amount': amount,
            'date': booking_date,
            'class_code': class_code,
            'source': source,
            'destination': destination,
            'pnr': pnr,
            'status': 'confirmed',
            'created_at': datetime.utcnow()
        }
        
        # Insert booking
        booking_id = app.mongo_manager.safe_insert_one('bookings', booking_data)
        if not booking_id:
            return jsonify({'error': 'Booking failed'}), 500
        
        # Log booking creation
        security_logger.log_data_modification('insert', 'bookings', booking_id)
        
        return jsonify({
            'success': True,
            'booking_id': booking_id,
            'pnr': pnr,
            'status': 'confirmed'
        })
    
    except Exception as e:
        security_logger.log_error(e, 'create_booking')
        return jsonify({'error': 'Booking creation failed'}), 500
```

---

## Example 4: Get User Bookings

### Before
```python
@app.route('/api/passenger/bookings', methods=['GET'])
def get_passenger_bookings():
    passenger_id = session.get('passenger_id')
    if not passenger_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    bookings = list(db.bookings.find({'passenger_id': passenger_id}))
    return jsonify({'bookings': bookings})
```

### After (With Security)
```python
from backend.security.auth import token_required
from backend.security.rate_limiter import rate_limit

@app.route('/api/passenger/bookings', methods=['GET'])
@token_required
@rate_limit(max_requests=30, window_seconds=60)  # 30 requests per minute
def get_passenger_bookings():
    try:
        passenger_id = request.user_id
        
        # Safely query with limit
        bookings = app.mongo_manager.safe_find(
            'bookings',
            {'passenger_id': passenger_id},
            limit=100  # Prevent memory issues
        )
        
        # Convert ObjectId to string
        for booking in bookings:
            booking['_id'] = str(booking['_id'])
        
        return jsonify({
            'success': True,
            'bookings': bookings,
            'count': len(bookings)
        })
    
    except Exception as e:
        security_logger.log_error(e, 'get_passenger_bookings')
        return jsonify({'error': 'Failed to fetch bookings'}), 500
```

---

## Example 5: Admin Route

### Before
```python
@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    admin_id = session.get('admin_id')
    if not admin_id:
        return jsonify({'error': 'Admin access required'}), 403
    
    users = list(db.users.find({}))
    return jsonify({'users': users})
```

### After (With Security)
```python
from backend.security.auth import admin_required
from backend.security.rate_limiter import rate_limit

@app.route('/api/admin/users', methods=['GET'])
@admin_required  # Validates JWT AND checks role='admin'
@rate_limit(max_requests=20, window_seconds=60)
def get_all_users():
    try:
        # Only admins reach here due to @admin_required
        admin_id = request.user_id
        
        # Get users without passwords
        users = app.mongo_manager.safe_find(
            'users',
            {},
            limit=1000
        )
        
        # Remove sensitive data
        for user in users:
            user['_id'] = str(user['_id'])
            user.pop('password_hash', None)  # Never send password hash
        
        # Log admin action
        security_logger.log_data_modification('read', 'users', 'all')
        
        return jsonify({
            'success': True,
            'users': users,
            'count': len(users)
        })
    
    except Exception as e:
        security_logger.log_error(e, 'get_all_users')
        return jsonify({'error': 'Failed to fetch users'}), 500
```

---

## Example 6: Search PNR (Public Route with Rate Limiting)

### Before
```python
@app.route('/api/search-pnr', methods=['POST'])
def search_pnr():
    data = request.json
    pnr = data.get('pnr')
    
    booking = db.bookings.find_one({'pnr': pnr})
    if booking:
        return jsonify({'booking': booking})
    return jsonify({'error': 'PNR not found'}), 404
```

### After (With Security)
```python
from backend.security.validators import validate_request_data, PNRSearchValidator
from backend.security.rate_limiter import rate_limit

@app.route('/api/search-pnr', methods=['POST'])
@rate_limit(max_requests=10, window_seconds=60)  # Prevent PNR enumeration attacks
def search_pnr():
    try:
        # Validate PNR format
        is_valid, data_or_errors = validate_request_data(PNRSearchValidator, request.json)
        if not is_valid:
            return jsonify({'error': 'Invalid PNR format'}), 400
        
        pnr = data_or_errors['pnr']
        
        # Search booking
        booking = app.mongo_manager.safe_find_one('bookings', {'pnr': pnr})
        
        if not booking:
            # Don't reveal if PNR exists or not (timing attack prevention)
            return jsonify({'error': 'Booking not found'}), 404
        
        # Remove sensitive data
        booking['_id'] = str(booking['_id'])
        
        return jsonify({
            'success': True,
            'booking': booking
        })
    
    except Exception as e:
        security_logger.log_error(e, 'search_pnr')
        return jsonify({'error': 'Search failed'}), 500
```

---

## Summary of Changes

| Feature | Before | After |
|---------|--------|-------|
| **Authentication** | `session.get('passenger_id')` | `@token_required` decorator |
| **Authorization** | Manual role check | `@admin_required` decorator |
| **Password** | `werkzeug` hash | `bcrypt` hash (12 rounds) |
| **Validation** | Manual checks | Pydantic validators |
| **Rate Limiting** | None | `@rate_limit()` decorator |
| **Query** | Direct `db.collection.find()` | `mongo_manager.safe_find()` |
| **Logging** | Print statements | Structured security logging |
| **Error Handling** | Verbose errors | Generic errors (no info leak) |

---

## Quick Reference: Import Statements

Add these to your routes file:

```python
# Security imports
from backend.security.auth import (
    token_required,
    admin_required,
    hash_password,
    verify_password,
    generate_token
)

from backend.security.validators import (
    validate_request_data,
    LoginValidator,
    UserValidator,
    BookingValidator,
    PNRSearchValidator
)

from backend.security.rate_limiter import rate_limit
from backend.security.middleware import limit_request_size
from backend.security.logging_config import security_logger
```

---

## Testing Checklist

After updating routes:

- [ ] Test with valid JWT token
- [ ] Test with expired token (should fail)
- [ ] Test with missing token (should fail)
- [ ] Test rate limiting (exceed limit)
- [ ] Test input validation (send invalid data)
- [ ] Test admin routes with passenger token (should fail)
- [ ] Check security logs for events
- [ ] Verify no password hashes in responses
- [ ] Test CSRF protection
- [ ] Test with SQL/NoSQL injection attempts
