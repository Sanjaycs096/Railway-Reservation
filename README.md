# Railway Reservation & Tracking Platform

A comprehensive platform for railway reservation, real-time tracking, and passenger alerts.

## Features

- **Passenger Interface**: Book tickets, select seats, view train schedules, and receive updates
- **Real-time Tracking**: Track train locations and get estimated arrival times
- **Alerts System**: Receive notifications about delays, platform changes, and emergencies
- **Admin Console**: Manage trains, bookings, and send alerts to passengers
- **Secure Payments**: Process ticket payments securely

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (Flask)
- **Database**: MongoDB
- **Deployment**: GitHub/Vercel

## Setup Instructions

### Prerequisites

- Python 3.8+
- MongoDB
- Node.js and npm (for frontend development)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/railway-reservation.git
   cd railway-reservation
   ```

2. Install backend dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory (use `.env.example` as a template)
   - Configure MongoDB connection string and other settings

4. Run the application:
   ```
   python backend/app.py
   ```

5. Access the application:
   - Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
Railway/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── backend/
│   ├── api/
│   │   └── routes.py
│   ├── app.py
│   └── config.py
├── frontend/
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   ├── admin.js
│   │   │   ├── alerts.js
│   │   │   ├── main.js
│   │   │   ├── payment.js
│   │   │   └── tracking.js
│   │   └── images/
│   │       ├── logo.svg
│   │       └── train-hero.svg
│   ├── admin.html
│   ├── index.html
│   └── login.html
├── .env
├── requirements.txt
├── vercel.json
└── README.md
```

## Deployment

### Automated Deployment with GitHub Actions and Vercel

The project is configured for automated deployment using GitHub Actions and Vercel:

1. The workflow file `.github/workflows/deploy.yml` handles:
   - Running tests and linting
   - Deploying to Vercel when pushed to the main branch

2. The `vercel.json` configuration manages:
   - Build settings for both frontend and backend
   - Routing configuration for API and static assets
   - Environment variables for production

3. To set up deployment:
   - Fork this repository
   - Set up a Vercel account and link it to your GitHub repository
   - Add the following secrets to your GitHub repository:
     - VERCEL_TOKEN
     - VERCEL_ORG_ID
     - VERCEL_PROJECT_ID
   - Push to the main branch to trigger deployment

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.