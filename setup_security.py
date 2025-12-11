"""
Quick Setup Script for Security Features
Generates secure keys and helps configure environment
"""

import secrets
import os
from pathlib import Path


def generate_secret_key():
    """Generate a secure random key"""
    return secrets.token_hex(32)


def create_env_file():
    """Create .env file with generated keys"""
    
    print("=" * 60)
    print("Railway Reservation System - Security Setup")
    print("=" * 60)
    print()
    
    # Check if .env exists
    env_path = Path('.env')
    if env_path.exists():
        response = input(".env file already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Setup cancelled.")
            return
    
    # Generate keys
    print("Generating secure keys...")
    secret_key = generate_secret_key()
    jwt_secret_key = generate_secret_key()
    
    print("✓ SECRET_KEY generated")
    print("✓ JWT_SECRET_KEY generated")
    print()
    
    # Get MongoDB URI
    print("MongoDB Configuration")
    print("-" * 60)
    mongo_uri = input("Enter MongoDB URI (or press Enter for local): ").strip()
    if not mongo_uri:
        mongo_uri = "mongodb://localhost:27017/railway_reservation"
    
    db_name = input("Database name [railway_reservation]: ").strip()
    if not db_name:
        db_name = "railway_reservation"
    
    # Get email configuration
    print()
    print("Email Configuration (Optional - press Enter to skip)")
    print("-" * 60)
    smtp_email = input("SMTP Email: ").strip()
    smtp_password = input("SMTP Password (app password): ").strip()
    
    # Get environment
    print()
    print("Environment Configuration")
    print("-" * 60)
    env_type = input("Environment type (development/production) [development]: ").strip()
    if not env_type:
        env_type = "development"
    
    debug = "True" if env_type == "development" else "False"
    
    # CORS origins
    print()
    if env_type == "production":
        cors_origins = input("CORS Allowed Origins (comma-separated): ").strip()
        if not cors_origins:
            cors_origins = "https://yourapp.vercel.app"
    else:
        cors_origins = "http://localhost:5000,http://127.0.0.1:5000"
    
    # Create .env content
    env_content = f"""# Flask Configuration
FLASK_ENV={env_type}
DEBUG={debug}
PORT=5000

# Security Keys (KEEP THESE SECRET!)
SECRET_KEY={secret_key}
JWT_SECRET_KEY={jwt_secret_key}

# MongoDB Configuration
MONGO_URI={mongo_uri}
MONGODB_URI={mongo_uri}
DB_NAME={db_name}

# JWT Settings
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=604800

# CORS Configuration
CORS_ALLOWED_ORIGINS={cors_origins}

# Email Configuration (Gmail)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL={smtp_email}
SMTP_PASSWORD={smtp_password}

# API Keys (Optional - Add your keys)
GOOGLE_MAPS_API_KEY=
GEOAPIFY_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
GROQ_API_KEY=

# Rate Limiting
RATE_LIMIT_ENABLED=True
MAX_REQUESTS_PER_MINUTE=60

# Logging
LOG_LEVEL=INFO
LOG_DIR=logs

# File Upload
MAX_CONTENT_LENGTH=10485760
ALLOWED_UPLOAD_EXTENSIONS=csv,xlsx

# Security Settings
SESSION_COOKIE_SECURE={'True' if env_type == 'production' else 'False'}
"""
    
    # Write .env file
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print()
    print("=" * 60)
    print("✓ .env file created successfully!")
    print("=" * 60)
    print()
    print("Your secure keys:")
    print(f"SECRET_KEY={secret_key}")
    print(f"JWT_SECRET_KEY={jwt_secret_key}")
    print()
    print("⚠️  IMPORTANT:")
    print("1. NEVER commit .env file to version control")
    print("2. Keep these keys secret and secure")
    print("3. Use different keys for production")
    print()
    print("Next steps:")
    print("1. Update .env with your API keys (optional)")
    print("2. Install dependencies: pip install -r requirements.txt")
    print("3. Run setup: python setup_database.py (if needed)")
    print("4. Start application: python backend/app_secure.py")
    print()
    print("For production deployment, see: PRODUCTION_DEPLOYMENT_GUIDE.md")
    print("=" * 60)


def check_dependencies():
    """Check if required packages are installed"""
    print("\nChecking dependencies...")
    
    required_packages = [
        'flask',
        'pymongo',
        'bcrypt',
        'pyjwt',
        'pydantic',
        'python-dotenv',
        'reportlab'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package}")
        except ImportError:
            missing.append(package)
            print(f"✗ {package} (missing)")
    
    if missing:
        print()
        print("Missing packages detected!")
        print("Install them with: pip install -r requirements.txt")
        return False
    
    print("\n✓ All dependencies installed")
    return True


if __name__ == '__main__':
    try:
        create_env_file()
        
        # Check dependencies
        print()
        response = input("Check installed dependencies? (Y/n): ")
        if response.lower() != 'n':
            check_dependencies()
    
    except KeyboardInterrupt:
        print("\n\nSetup cancelled.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("Please check your input and try again.")
