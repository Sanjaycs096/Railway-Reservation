# Email & PDF Ticket Setup Guide

## Features Implemented

1. **PDF Ticket Generation** using jsPDF
   - Professional ticket layout with colors and styling
   - Includes all booking details (PNR, train info, seats, payment)
   - Auto-downloads on click
   - Border and header/footer design

2. **Email Confirmation** with GROQ AI content generation
   - Sends HTML email with booking details
   - Uses GROQ API (llama-3.3-70b-versatile) to generate personalized email content
   - Falls back to default template if GROQ API fails
   - Includes travel tips and contact information

## Required Environment Variables

Add these to your `.env` file:

```env
# SMTP Email Configuration (Gmail example)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# GROQ API Key (get from https://console.groq.com/)
GROQ_API_KEY=gsk_your_groq_api_key_here
```

## Gmail App Password Setup

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification
4. Go to App Passwords
5. Generate a new app password for "Mail"
6. Copy the 16-character password and use it as `SMTP_PASSWORD`

## GROQ API Key Setup

1. Visit https://console.groq.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## How It Works

### Frontend (index.html)
- Added jsPDF and html2canvas libraries via CDN
- `downloadTicketPDF()` function creates a professional PDF ticket
- `sendTicketEmail()` function calls backend API to send email
- Automatically triggers email after PDF download

### Backend (email_ticket_service.py)
- `generate_email_content_with_groq()` - Calls GROQ API to generate personalized email
- `generate_default_email_content()` - Fallback template if GROQ fails
- `send_ticket_confirmation_email()` - Sends email via SMTP

### API Route (routes.py)
- `/api/send-ticket-email` POST endpoint
- Accepts: email, userName, booking data
- Returns: success/error status

## Testing

1. Make sure `.env` file has all required variables
2. Restart the Flask server: `python backend/app.py`
3. Book a ticket and complete payment
4. Click "Download Ticket" button
5. PDF should download and email should be sent

## Troubleshooting

**Email not sending:**
- Check SMTP credentials in `.env`
- Verify Gmail app password is correct
- Check firewall/antivirus blocking port 587

**GROQ API failing:**
- Verify API key is correct
- Check API quota/limits
- System will use default template as fallback

**PDF not downloading:**
- Check browser console for errors
- Ensure jsPDF library loaded properly
- Clear browser cache and try again
