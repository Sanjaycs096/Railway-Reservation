# 🚂 Railway Reservation System
## Enterprise-Grade Web Application with Full Security

A comprehensive railway ticket booking system with JWT authentication, bcrypt password hashing, input validation, rate limiting, and enterprise security features.

---

## 🔒 Security Features (NEW!)

✅ **JWT Authentication** - Stateless token-based auth with access & refresh tokens  
✅ **bcrypt Password Hashing** - Industry-standard password security  
✅ **Input Validation** - Pydantic models prevent XSS and injection attacks  
✅ **Rate Limiting** - Prevents brute-force and DDoS attacks  
✅ **CSRF Protection** - Token-based protection for state-changing requests  
✅ **Security Headers** - CSP, X-Frame-Options, HSTS, and more  
✅ **CORS Restrictions** - Configurable allowed origins  
✅ **MongoDB Security** - Indexes, validation, query sanitization  
✅ **Security Logging** - Comprehensive audit trail with IP tracking  
✅ **Request Validation** - Size limits, content type checks  

**👉 See [SECURITY_FEATURES.md](SECURITY_FEATURES.md) for complete security documentation**

---

## 🚀 Quick Start

### 1️⃣ Clone Repository
```bash
git clone <your-repo-url>
cd Railway
```

### 2️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 3️⃣ Setup Environment (Automated)
```bash
python setup_security.py
```

This will:
- Generate secure SECRET_KEY and JWT_SECRET_KEY
- Create .env file with configuration
- Prompt for MongoDB URI and email settings

Or manually create `.env`:
```env
SECRET_KEY=your_generated_secret_key_here
JWT_SECRET_KEY=your_generated_jwt_secret_here
MONGO_URI=mongodb://localhost:27017/railway_reservation
DB_NAME=railway_reservation
CORS_ALLOWED_ORIGINS=http://localhost:5000
DEBUG=True
```

### 4️⃣ Setup Database
```bash
python setup_database.py
```

This creates indexes and validation schemas for optimal security and performance.

### 5️⃣ Run Application
```bash
# Development (with auto-reload)
python backend/app_secure.py

# Production (with gunicorn)
gunicorn -w 4 -b 0.0.0.0:5000 backend.app_secure:app
```

Visit: **http://localhost:5000**

---

## 📁 Project Structure

```
Railway/
├── backend/
│   ├── security/              # 🔒 Security modules (NEW!)
│   │   ├── auth.py           # JWT authentication
│   │   ├── validators.py     # Input validation
│   │   ├── rate_limiter.py   # Rate limiting
│   │   ├── middleware.py     # CSRF, headers
│   │   ├── database.py       # Secure DB operations
│   │   └── logging_config.py # Security logging
│   ├── api/
│   │   └── routes.py         # API endpoints
│   ├── models/
│   │   └── models.py         # Data models
│   ├── services/             # Business logic
│   ├── utils/                # Helper functions
│   ├── app_secure.py         # 🔒 Secure Flask app (NEW!)
│   └── app.py                # Legacy app
├── frontend/
│   ├── static/               # CSS, JS, images
│   └── templates/            # HTML templates
├── logs/                     # 🔒 Security & app logs (NEW!)
├── .env                      # Environment variables (gitignored)
├── .env.example              # Environment template
├── requirements.txt          # Python dependencies
├── vercel.json               # Vercel deployment config
├── setup_security.py         # 🔒 Security setup script (NEW!)
├── setup_database.py         # 🔒 Database setup script (NEW!)
├── SECURITY_FEATURES.md      # 🔒 Security documentation (NEW!)
├── SECURITY_MIGRATION_GUIDE.md  # 🔒 Migration guide (NEW!)
├── ROUTE_MIGRATION_EXAMPLES.md  # 🔒 Route examples (NEW!)
└── PRODUCTION_DEPLOYMENT_GUIDE.md  # 🔒 Deployment guide (NEW!)
```

---

## 📚 Features

### User Features
- 🔐 Secure registration and login (JWT-based)
- 🔍 Search trains by source, destination, date
- 🎫 Book tickets with seat selection
- 📧 Email confirmation with PDF ticket
- 📥 Download ticket as PDF
- 📍 Track train location on map
- 🔔 Set price alerts for routes
- 💳 Payment integration
- 📱 Responsive design

### Admin Features
- 👥 User management
- 🚆 Train management (CRUD)
- 📊 Booking analytics
- 💰 Revenue tracking
- 🗺️ Interactive route management
- 📈 Dashboard with statistics

### Security Features
- 🔒 JWT authentication with refresh tokens
- 🔑 bcrypt password hashing (12 rounds)
- ✅ Pydantic input validation
- 🚦 Rate limiting (customizable per endpoint)
- 🛡️ CSRF protection
- 🔐 Security headers (CSP, HSTS, etc.)
- 🌐 CORS restrictions
- 📝 Comprehensive security logging
- 🗄️ MongoDB query sanitization

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key (REQUIRED) | - |
| `JWT_SECRET_KEY` | JWT signing key (REQUIRED) | - |
| `MONGO_URI` | MongoDB connection string | localhost |
| `DB_NAME` | Database name | railway_reservation |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | localhost:5000 |
| `DEBUG` | Debug mode | False |
| `JWT_ACCESS_TOKEN_EXPIRES` | Access token expiry (seconds) | 3600 |
| `SMTP_EMAIL` | Email for notifications | - |
| `SMTP_PASSWORD` | Email password | - |

**See `.env.example` for complete list**

---

## 🔐 API Authentication

### Login
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
  "user_id": "...",
  "expires_at": "2024-01-01T13:00:00"
}
```

### Authenticated Request
```bash
GET /api/passenger/bookings
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
X-CSRF-Token: <csrf_token_from_cookie>
```

### Refresh Token
```bash
POST /api/refresh-token
Cookie: refresh_token=...
```

**See [SECURITY_FEATURES.md](SECURITY_FEATURES.md) for complete API docs**

---

## 📊 API Endpoints

### Public Endpoints
- `GET /` - Home page
- `GET /health` - Health check
- `POST /api/passenger/login` - Login
- `POST /api/passenger/register` - Register
- `GET /api/trains` - Search trains (rate limited)

### Protected Endpoints (Require JWT)
- `GET /api/passenger/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/<id>/download_ticket` - Download ticket PDF
- `POST /api/alerts` - Create price alert

### Admin Endpoints (Admin Role Required)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/trains` - Add train
- `PUT /api/admin/trains/<id>` - Update train
- `DELETE /api/admin/trains/<id>` - Delete train

**See [ROUTE_MIGRATION_EXAMPLES.md](ROUTE_MIGRATION_EXAMPLES.md) for implementation examples**

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Set Environment Variables**
In Vercel dashboard, add:
- `SECRET_KEY`
- `JWT_SECRET_KEY`
- `MONGO_URI`
- `CORS_ALLOWED_ORIGINS` (your Vercel URL)
- All other variables from `.env.example`

3. **Deploy**
```bash
vercel --prod
```

**👉 See [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md) for complete guide**

### Local Production

```bash
# Install gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn -w 4 -b 0.0.0.0:5000 backend.app_secure:app
```

---

## 🔄 Migration from Old Version

If you have an existing deployment using `app.py`:

1. **Backup database**
```bash
mongodump --uri="your_uri" --out=backup
```

2. **Run migration**
```bash
python setup_security.py
python setup_database.py
```

3. **Update frontend code** (for JWT handling)
4. **Update backend routes** (see ROUTE_MIGRATION_EXAMPLES.md)
5. **Test thoroughly**
6. **Deploy**

**👉 See [SECURITY_MIGRATION_GUIDE.md](SECURITY_MIGRATION_GUIDE.md) for detailed migration steps**

---

## 🧪 Testing

### Test Security Features

```bash
# Test authentication
curl -X POST http://localhost:5000/api/passenger/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#"}'

# Test rate limiting (send 150 requests)
for i in {1..150}; do curl http://localhost:5000/api/trains & done

# Test input validation (weak password)
curl -X POST http://localhost:5000/api/passenger/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak","name":"Test"}'
```

---

## 📝 Logging

Security events are logged in:
- `logs/security.log` - Authentication, rate limits, CSRF
- `logs/app.log` - Application events
- `logs/errors.log` - Errors

Example log:
```
2024-01-01 12:00:00 | WARNING | Login failed | test@example.com | Wrong password | 192.168.1.1
```

---

## 🛡️ Security Best Practices

### ✅ DO
- ✓ Use strong SECRET_KEY and JWT_SECRET_KEY (32+ chars)
- ✓ Enable HTTPS in production
- ✓ Set specific CORS origins (never use `*`)
- ✓ Monitor security logs regularly
- ✓ Keep dependencies updated
- ✓ Use environment variables for secrets
- ✓ Validate all user inputs
- ✓ Implement rate limiting

### ❌ DON'T
- ✗ Use default secret keys
- ✗ Enable DEBUG in production
- ✗ Allow CORS from all origins
- ✗ Store secrets in code
- ✗ Trust user input without validation
- ✗ Skip rate limiting
- ✗ Expose error details to users
- ✗ Commit .env to version control

---

## 📦 Dependencies

### Core
- Flask 2.0.3 - Web framework
- pymongo 4.0.1 - MongoDB driver
- bcrypt 4.0.1 - Password hashing
- pyjwt 2.6.0 - JWT implementation
- pydantic 2.5.0 - Data validation

### Security
- flask-cors 3.0.10 - CORS handling
- python-dotenv 0.19.1 - Environment variables

### Utilities
- reportlab 4.0.7 - PDF generation
- requests 2.26.0 - HTTP library

**See `requirements.txt` for complete list**

---

## 📖 Documentation

- **[SECURITY_FEATURES.md](SECURITY_FEATURES.md)** - Complete security documentation
- **[SECURITY_MIGRATION_GUIDE.md](SECURITY_MIGRATION_GUIDE.md)** - Migration from old version
- **[ROUTE_MIGRATION_EXAMPLES.md](ROUTE_MIGRATION_EXAMPLES.md)** - Route conversion examples
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[.env.example](.env.example)** - Environment variable template

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Please ensure all security features are maintained!**

---

## 📜 License

This project is licensed under the MIT License.

---

## 🆘 Support

### Issues?
1. Check documentation in `SECURITY_*.md` files
2. Review logs in `logs/` directory
3. Check environment variables in `.env`
4. Verify MongoDB connection

### Common Issues

**"Invalid or expired token"**
- Token expired → Refresh token
- Wrong JWT_SECRET_KEY → Check .env

**"Rate limit exceeded"**
- Too many requests → Wait 15 minutes
- Adjust limits in .env

**"CSRF validation failed"**
- Missing CSRF token → Include X-CSRF-Token header
- Cookie not set → Check if GET request made first

**Database connection failed"**
- Check MONGO_URI in .env
- Verify MongoDB service running
- Check network access (MongoDB Atlas)

---

## 📊 Tech Stack

- **Backend**: Flask (Python)
- **Database**: MongoDB
- **Authentication**: JWT
- **Security**: bcrypt, Pydantic, Rate Limiting, CSRF
- **PDF**: ReportLab
- **Email**: SMTP (Gmail)
- **Maps**: Google Maps API, Geoapify
- **Deployment**: Vercel
- **Frontend**: HTML, CSS, JavaScript

---

## 🎯 Roadmap

- [x] JWT authentication
- [x] bcrypt password hashing
- [x] Input validation
- [x] Rate limiting
- [x] CSRF protection
- [x] Security logging
- [ ] Redis caching for sessions
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Facebook)
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)

---

## 👨‍💻 Author

Developed with ❤️ and 🔒 security best practices

---

## 🙏 Acknowledgments

- Flask documentation
- OWASP security guidelines
- MongoDB best practices
- Python security community

---

## ⭐ Show Your Support

If you find this project helpful, please give it a star! ⭐

---

**Version**: 2.0.0 (Security Enhanced)  
**Last Updated**: January 2024

**Stay Secure! 🔒**
