const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/dbConfig');
const checkJWT = require('./middleware/checkJWT');
const authRoutes = require('./routes/authRoutes');
const getRoutes = require('./routes/getRoutes');
const { checkAuth } = require('./middleware/checkAuth');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const quizRoutes = require('./routes/quizRoutes'); // Add this line

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.set('trust proxy', '127.0.0.1');  // This is the most secure option for your setup
const PORT = process.env.PORT;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Static files middleware - ensure this is set up correctly
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Apply JWT check to all routes
app.use(checkJWT);

// Add this new middleware
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use('/', getRoutes);
app.use('/auth', authRoutes);
app.use('/auth', googleAuthRoutes);
app.use('/security/reset', passwordResetRoutes); // Changed from '/password-reset'

// Keep only POST routes in quizRoutes.js
app.use('/quiz', require('./routes/quizRoutes')); 

// Add this line after your other app.use statements
app.use('/settings', require('./routes/settingsRoutes'));

// Handle all errors including 404s in one place
app.use((req, res, next) => {
    // Handle 404 errors
    res.status(404).render('error', {
        title: 'Page Not Found',
        message: 'The page you requested does not exist.',
        user: req.user || null
    });
});

// Global error handler for all other errors
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Set default values
    const statusCode = err.statusCode || 500;
    const errorTitle = err.title || 'Error';
    const errorMessage = err.message || 'An unexpected error occurred';
    
    // Render the error page
    res.status(statusCode).render('error', {
        title: errorTitle,
        message: errorMessage,
        user: req.user || null
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});