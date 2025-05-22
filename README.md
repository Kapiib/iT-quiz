# IT Quiz Application

A comprehensive quiz platform focused on IT topics, built with Node.js, Express, and MongoDB.

## Features

### User Experience
- **Multiple Quiz Types**
  - Classic multiple-choice questions
  - Card matching games (match terms with definitions)
  - Timed quizzes with customizable limits

- **Learning Categories**
  - Programming
  - Databases
  - Networking
  - Security
  - Web Development
  - Operating Systems
  - General IT topics

- **Interactive Interface**
  - Real-time score tracking
  - Progress indicators
  - Responsive design for all devices

### User Management
- **Authentication Options**
  - Email/password registration
  - Google OAuth integration
  - Password reset functionality

- **User Profiles**
  - Customizable profile pictures
  - Bio information
  - Quiz history tracking

- **Content Creation**
  - Create and share your own quizzes
  - Set public/private visibility
  - Edit and manage your quizzes

### Administration
- **Admin Dashboard**
  - User management
  - Quiz moderation
  - Detailed activity logging
  - System statistics

- **Data Monitoring**
  - Filter activity by date range
  - Search functionality
  - User behavior tracking

### Structure

IT-quiz/
├── controllers/     # Request handlers
├── middleware/      # Authentication middleware
├── models/          # MongoDB models
├── public/          # Static assets
│   ├── css/         # Stylesheets
│   ├── js/          # Client-side JavaScript
│   └── images/      # Images
├── routes/          # Express routes
├── utils/           # Utility functions
├── views/           # EJS templates
├── .env             # Environment variables
├── app.js           # Express app
└── package.json     # Dependencies

