# Production Deployment Guide
## Deploying Railway Reservation System with Enterprise Security

---

## Pre-Deployment Checklist

### 1. Code Security Audit
- [ ] All routes use `@token_required` or `@admin_required`
- [ ] All POST/PUT/DELETE routes have input validation
- [ ] Rate limiting applied to all public endpoints
- [ ] No hardcoded secrets in code
- [ ] All database queries use `mongo_manager.safe_*` methods
- [ ] CORS origins configured properly
- [ ] Security headers enabled

### 2. Environment Variables
- [ ] Strong SECRET_KEY generated (32+ characters)
- [ ] Strong JWT_SECRET_KEY generated (different from SECRET_KEY)
- [ ] MongoDB connection string with TLS enabled
- [ ] CORS_ALLOWED_ORIGINS set to production domains
- [ ] DEBUG=False
- [ ] FLASK_ENV=production
- [ ] All API keys configured (Google Maps, etc.)

### 3. Database Preparation
- [ ] Database indexes created
- [ ] Schema validation enabled
- [ ] Existing passwords migrated to bcrypt
- [ ] Backup procedures tested
- [ ] Connection pooling configured

### 4. Dependencies
- [ ] All packages in requirements.txt installed
- [ ] Compatible versions verified
- [ ] No vulnerable packages (run `pip check`)

---

## Vercel Deployment

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Configure Environment Variables

#### Option A: Via Vercel Dashboard
1. Go to your project on vercel.com
2. Navigate to Settings → Environment Variables
3. Add each variable:

**Required Variables**:
```
SECRET_KEY=<your-generated-secret-key>
JWT_SECRET_KEY=<your-generated-jwt-secret>
MONGO_URI=<your-mongodb-atlas-uri>
DB_NAME=railway_reservation
FLASK_ENV=production
DEBUG=False
```

**CORS Configuration**:
```
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app,https://www.yourdomain.com
```

**Optional Services**:
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
GOOGLE_MAPS_API_KEY=your-key
GEOAPIFY_API_KEY=your-key
```

#### Option B: Via Vercel CLI
```bash
# Set one variable
vercel env add SECRET_KEY production

# Or create .env.production file and import
vercel env pull .env.production
```

### Step 4: Test Locally with Production Settings
```bash
# Create production environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set production env vars
export FLASK_ENV=production
export DEBUG=False

# Run locally
python backend/app_secure.py
```

### Step 5: Deploy to Vercel
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 6: Verify Deployment

#### A. Check Health Endpoint
```bash
curl https://your-project.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00"
}
```

#### B. Test Security Headers
```bash
curl -I https://your-project.vercel.app
```

Should include:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`

#### C. Test Authentication
```bash
# Login
curl -X POST https://your-project.vercel.app/api/passenger/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Use token
curl https://your-project.vercel.app/api/passenger/bookings \
  -H "Authorization: Bearer <your_token>"
```

---

## MongoDB Atlas Configuration

### 1. Enable TLS/SSL
In MongoDB Atlas connection string:
```
mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority&tls=true
```

### 2. Network Access
Add Vercel IPs or use `0.0.0.0/0` (all IPs) with strong password

### 3. Database User
- Create dedicated user for production
- Use strong password (not in code!)
- Grant minimal required permissions

### 4. Enable Monitoring
- Set up MongoDB alerts for:
  - High connections
  - Slow queries
  - Disk usage

---

## Security Configuration

### 1. CORS Setup
Update `.env` or Vercel environment:
```env
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app,https://yourdomain.com
```

**Important**: Never use `*` in production!

### 2. HTTPS Configuration
Vercel handles HTTPS automatically, but ensure:
- `SESSION_COOKIE_SECURE=True`
- `SECURE_HEADERS=True`
- All external resources use HTTPS

### 3. Rate Limiting
Adjust for production traffic:
```env
MAX_REQUESTS_PER_MINUTE=100  # Adjust based on expected traffic
```

### 4. Logging
Configure log retention:
```env
LOG_LEVEL=WARNING  # Less verbose in production
LOG_DIR=logs
```

---

## Monitoring & Alerts

### 1. Setup Error Tracking

#### Option A: Sentry
```bash
pip install sentry-sdk[flask]
```

Add to `app_secure.py`:
```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FlaskIntegration()],
    environment="production"
)
```

#### Option B: Custom Error Logging
Check logs regularly:
```bash
# View recent errors
tail -100 logs/errors.log

# Monitor in real-time
tail -f logs/security.log
```

### 2. Setup Uptime Monitoring
Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

Monitor:
- `/health` endpoint every 5 minutes
- Alert if down > 2 minutes

### 3. Database Monitoring
MongoDB Atlas provides:
- Performance metrics
- Query analytics
- Alerts for slow queries

---

## Performance Optimization

### 1. Database Indexes
Ensure indexes are created:
```bash
# Run once after deployment
python -c "from backend.security.database import SecureMongoDBManager; manager = SecureMongoDBManager('your_uri', 'your_db'); manager.create_indexes()"
```

### 2. Connection Pooling
Already configured in `app_secure.py`:
- Min pool size: 10
- Max pool size: 50

### 3. CDN for Static Files
Move static assets to CDN if needed:
- Vercel Edge Network handles this automatically

### 4. Caching
For high-traffic endpoints, consider:
- Redis caching
- In-memory caching with TTL

---

## Backup & Recovery

### 1. MongoDB Backups
Enable MongoDB Atlas automatic backups:
- Continuous backups (recommended)
- Daily snapshots
- Point-in-time recovery

### 2. Manual Backup
```bash
# Backup entire database
mongodump --uri="your_mongodb_uri" --out=backup_$(date +%Y%m%d)

# Backup specific collection
mongodump --uri="your_mongodb_uri" --collection=users --out=users_backup
```

### 3. Restore Procedure
```bash
# Restore entire database
mongorestore --uri="your_mongodb_uri" backup_20240101/

# Restore specific collection
mongorestore --uri="your_mongodb_uri" --collection=users backup/users.bson
```

---

## Common Deployment Issues

### Issue 1: "ModuleNotFoundError"
**Cause**: Missing dependency
**Solution**:
```bash
# Verify requirements.txt has all packages
pip freeze > requirements.txt
vercel --prod
```

### Issue 2: "CORS Error"
**Cause**: Origin not allowed
**Solution**: Update `CORS_ALLOWED_ORIGINS` in Vercel env vars

### Issue 3: "JWT Token Invalid"
**Cause**: Different JWT_SECRET_KEY between deployments
**Solution**: Ensure JWT_SECRET_KEY is same across all environments

### Issue 4: "Database Connection Timeout"
**Cause**: MongoDB network access or connection string
**Solution**:
- Check MongoDB Atlas network access
- Verify connection string TLS settings
- Check connection pool settings

### Issue 5: "Rate Limit Too Strict"
**Cause**: Production traffic exceeds limits
**Solution**: Adjust rate limits in environment variables

---

## Post-Deployment Checklist

### Immediate (First Hour)
- [ ] Health check endpoint responding
- [ ] Login flow working
- [ ] Booking creation working
- [ ] Email notifications sending
- [ ] Security headers present
- [ ] HTTPS enforced
- [ ] Error logs clean (no critical errors)

### First Day
- [ ] Monitor error logs
- [ ] Check authentication success rate
- [ ] Verify rate limiting working
- [ ] Test all critical user flows
- [ ] Monitor database performance
- [ ] Check memory usage
- [ ] Verify backups running

### First Week
- [ ] Analyze security logs for suspicious activity
- [ ] Review error patterns
- [ ] Check database index usage
- [ ] Monitor response times
- [ ] Verify email delivery rates
- [ ] Review rate limit violations
- [ ] User feedback on performance

---

## Scaling Considerations

### When to Scale
Monitor these metrics:
- Response time > 2 seconds
- Error rate > 1%
- CPU usage > 80%
- Memory usage > 90%
- Database connections maxed out

### Vertical Scaling
Upgrade Vercel plan for:
- More memory
- More CPU
- Higher execution limits

### Horizontal Scaling
For high traffic:
- Enable Vercel Edge Network
- Increase MongoDB cluster tier
- Use Redis for caching
- CDN for static assets

---

## Security Maintenance

### Weekly
- [ ] Review security logs
- [ ] Check for failed login attempts
- [ ] Monitor rate limit violations
- [ ] Verify backup completion

### Monthly
- [ ] Update dependencies (`pip list --outdated`)
- [ ] Review and rotate API keys
- [ ] Audit user permissions
- [ ] Check for security vulnerabilities
- [ ] Review CORS origins

### Quarterly
- [ ] Rotate SECRET_KEY and JWT_SECRET_KEY
- [ ] Security penetration testing
- [ ] Review and update rate limits
- [ ] Database performance tuning
- [ ] Compliance audit

---

## Rollback Procedure

If deployment fails:

### 1. Rollback on Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>
```

### 2. Restore Database
```bash
# If database changes were made
mongorestore --uri="your_uri" --drop backup_before_deployment/
```

### 3. Verify Rollback
- Test health endpoint
- Test login flow
- Check error logs
- Verify no data loss

---

## Support & Resources

### Documentation
- Security Implementation: `SECURITY_MIGRATION_GUIDE.md`
- Route Examples: `ROUTE_MIGRATION_EXAMPLES.md`
- Environment Variables: `.env.example`

### Monitoring
- Application Logs: `logs/` directory
- Security Events: `logs/security.log`
- Errors: `logs/errors.log`

### External Services
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- Sentry (if used): https://sentry.io

---

## Emergency Contacts

Create an incident response plan:

1. **Database Issues**: MongoDB Atlas support
2. **Vercel Issues**: Vercel support
3. **Security Incident**: Security team lead
4. **Critical Bug**: Development team

---

## Success Metrics

Track these KPIs:

### Performance
- Average response time < 500ms
- 99.9% uptime
- Error rate < 0.1%

### Security
- Zero successful unauthorized access
- Zero data breaches
- 100% HTTPS traffic

### Business
- Booking success rate > 95%
- User registration conversion > 80%
- Email delivery rate > 99%

---

## Next Steps After Deployment

1. **Monitor for 24 hours continuously**
2. **Gather user feedback**
3. **Fine-tune rate limits based on actual traffic**
4. **Setup alerting for critical metrics**
5. **Document any deployment-specific issues**
6. **Plan for next iteration/improvements**

---

## Questions?

Refer to:
- Main README.md
- Security module documentation in `backend/security/`
- Vercel documentation: https://vercel.com/docs
- Flask documentation: https://flask.palletsprojects.com/
