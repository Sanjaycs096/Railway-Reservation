"""
Database Setup Script
Creates indexes and validation schemas for MongoDB
"""

import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from backend.security.database import SecureMongoDBManager


def setup_database():
    """Setup database with indexes and validation"""
    
    print("=" * 60)
    print("Database Setup - Railway Reservation System")
    print("=" * 60)
    print()
    
    # Get MongoDB URI
    mongo_uri = os.getenv('MONGO_URI') or os.getenv('MONGODB_URI')
    db_name = os.getenv('DB_NAME', 'railway_reservation')
    
    if not mongo_uri:
        print("❌ Error: MongoDB URI not found in environment variables")
        print("Please run setup_security.py first or set MONGO_URI in .env")
        return
    
    print(f"Connecting to database: {db_name}")
    print(f"URI: {mongo_uri[:30]}...")
    print()
    
    try:
        # Create manager
        manager = SecureMongoDBManager(mongo_uri, db_name)
        
        # Setup database
        print("Creating indexes...")
        manager.create_indexes()
        
        print("Creating validation schemas...")
        manager.create_validation_schemas()
        
        print()
        print("=" * 60)
        print("✓ Database setup completed successfully!")
        print("=" * 60)
        print()
        print("Created indexes for:")
        print("  - users (email, role)")
        print("  - bookings (passenger_id, pnr, train_id, date)")
        print("  - trains (train_number, source, destination)")
        print("  - payments (booking_id, passenger_id, transaction_id)")
        print("  - alerts (passenger_id, train_id, is_active)")
        print()
        print("Applied validation schemas for:")
        print("  - users (email format, password, role)")
        print("  - bookings (PNR format, amount range, status)")
        print()
        print("Your database is now secure and optimized!")
        print()
    
    except Exception as e:
        print()
        print("=" * 60)
        print("❌ Database setup failed!")
        print("=" * 60)
        print(f"Error: {e}")
        print()
        print("Troubleshooting:")
        print("1. Check if MongoDB URI is correct")
        print("2. Verify database name")
        print("3. Ensure network access is allowed (MongoDB Atlas)")
        print("4. Check if MongoDB service is running (local)")
        sys.exit(1)


if __name__ == '__main__':
    setup_database()
