import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class"""
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = False
    TESTING = False
    
    # MongoDB settings
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://sanjaykumarmmkce_db_user:F3E8UGKtVS0Hm3o6@railwayreservation.fldv1wj.mongodb.net/')
    
    # JWT settings
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    
    # Additional development settings
    FLASK_ENV = 'development'

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    
    # Use a separate database for testing
    MONGO_URI = os.getenv('TEST_MONGO_URI', 'mongodb://localhost:27017/railway_reservation_test')

class ProductionConfig(Config):
    """Production configuration"""
    # Production settings
    FLASK_ENV = 'production'
    
    # Ensure these are set in environment variables in production
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    
    # MongoDB settings for production
    MONGO_URI = os.getenv('MONGO_URI')

# Configuration dictionary
config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

# Get configuration based on environment
def get_config():
    env = os.getenv('FLASK_ENV', 'default')
    return config_by_name[env]