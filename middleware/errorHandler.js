/**
 * Global error handler middleware
 * Catches all unhandled errors and renders the error.ejs template
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Default error information
    const statusCode = err.statusCode || 500;
    const title = err.title || 'Error';
    const message = err.message || 'An unexpected error occurred';
    
    // Render the error page with error details
    res.status(statusCode).render('error', {
        title: title,
        message: message,
        user: req.user || null
    });
};

// Custom error class for application errors
class AppError extends Error {
    constructor(message, statusCode, title) {
        super(message);
        this.statusCode = statusCode;
        this.title = title;
    }
}

module.exports = { errorHandler, AppError };