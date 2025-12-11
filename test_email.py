#!/usr/bin/env python3
"""
Test script for email functionality with Groq API
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from utils.helpers import send_booking_confirmation_email, send_password_reset_email

def test_booking_email():
    """Test booking confirmation email"""
    print("Testing booking confirmation email...")
    
    test_data = {
        'email': 'test@example.com',
        'passenger_name': 'John Doe',
        'pnr': 'PNR123456',
        'train_name': 'Express 12345',
        'train_number': '12345',
        'date': '2024-01-15',
        'source': 'New Delhi',
        'destination': 'Mumbai',
        'seats': 2,
        'amount': 1500.00,
        'booking_time': '2024-01-10 14:30:00'
    }
    
    try:
        result = send_booking_confirmation_email(test_data)
        if result:
            print("✅ Booking confirmation email sent successfully!")
        else:
            print("❌ Failed to send booking confirmation email")
    except Exception as e:
        print(f"❌ Error sending booking confirmation email: {e}")

def test_password_reset_email():
    """Test password reset email"""
    print("\nTesting password reset email...")
    
    try:
        result = send_password_reset_email('test@example.com', '123456')
        if result:
            print("✅ Password reset email sent successfully!")
        else:
            print("❌ Failed to send password reset email")
    except Exception as e:
        print(f"❌ Error sending password reset email: {e}")

if __name__ == "__main__":
    print("=== Railway Email Service Test ===\n")
    test_booking_email()
    test_password_reset_email()
    print("\n=== Test Complete ===")