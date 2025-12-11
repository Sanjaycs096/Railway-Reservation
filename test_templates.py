#!/usr/bin/env python3
"""
Simple email test without external dependencies
"""

def create_booking_email_template(booking_data):
    """Create a simple booking confirmation email template"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 30px; text-align: center; }}
            .content {{ padding: 30px; }}
            .ticket {{ background: #f8f9fa; border-left: 4px solid #3498db; padding: 20px; margin: 20px 0; }}
            .footer {{ background: #2c3e50; color: white; padding: 20px; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚄 RailConnect</h1>
                <h2>Booking Confirmation</h2>
            </div>
            <div class="content">
                <h3>Dear {booking_data.get('passenger_name', 'Passenger')},</h3>
                <p>Your train ticket has been successfully booked! Here are your booking details:</p>
                
                <div class="ticket">
                    <h4>📋 Booking Details</h4>
                    <p><strong>PNR:</strong> {booking_data.get('pnr', 'N/A')}</p>
                    <p><strong>Train:</strong> {booking_data.get('train_name', 'N/A')} ({booking_data.get('train_number', 'N/A')})</p>
                    <p><strong>Date:</strong> {booking_data.get('date', 'N/A')}</p>
                    <p><strong>Route:</strong> {booking_data.get('source', 'N/A')} → {booking_data.get('destination', 'N/A')}</p>
                    <p><strong>Seats:</strong> {booking_data.get('seats', 'N/A')}</p>
                    <p><strong>Amount Paid:</strong> ₹{booking_data.get('amount', 'N/A')}</p>
                </div>
                
                <p>Please arrive at the station at least 30 minutes before departure.</p>
                <p>Have a safe journey!</p>
            </div>
            <div class="footer">
                <p>RailConnect - Your Railway Booking Partner</p>
                <p>For support: support@railconnect.com</p>
            </div>
        </div>
    </body>
    </html>
    """

def create_password_reset_template(email, otp):
    """Create a password reset email template"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 30px; text-align: center; }}
            .content {{ padding: 30px; }}
            .otp-box {{ background: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin: 20px 0; text-align: center; border-radius: 5px; }}
            .otp-code {{ font-size: 32px; font-weight: bold; color: #856404; letter-spacing: 5px; }}
            .footer {{ background: #2c3e50; color: white; padding: 20px; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 RailConnect</h1>
                <h2>Password Reset Request</h2>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>You requested a password reset for your RailConnect account ({email}).</p>
                
                <div class="otp-box">
                    <p><strong>Your OTP Code:</strong></p>
                    <div class="otp-code">{otp}</div>
                    <p><small>This code will expire in 10 minutes</small></p>
                </div>
                
                <p>If you didn't request this password reset, please ignore this email.</p>
                <p><strong>Security Note:</strong> Never share this OTP with anyone.</p>
            </div>
            <div class="footer">
                <p>RailConnect - Your Railway Booking Partner</p>
                <p>For support: support@railconnect.com</p>
            </div>
        </div>
    </body>
    </html>
    """

if __name__ == "__main__":
    print("=== Email Template Test ===\n")
    
    # Test booking email
    booking_data = {
        'email': 'test@example.com',
        'passenger_name': 'John Doe',
        'pnr': 'PNR123456',
        'train_name': 'Express 12345',
        'train_number': '12345',
        'date': '2024-01-15',
        'source': 'New Delhi',
        'destination': 'Mumbai',
        'seats': '2',
        'amount': 1500.00,
        'booking_time': '2024-01-10 14:30:00'
    }
    
    booking_html = create_booking_email_template(booking_data)
    print("✅ Booking confirmation email template generated successfully!")
    print(f"Length: {len(booking_html)} characters")
    
    # Test password reset email  
    reset_html = create_password_reset_template('test@example.com', '123456')
    print("✅ Password reset email template generated successfully!")
    print(f"Length: {len(reset_html)} characters")
    
    print("\n=== Templates are ready for use ===")