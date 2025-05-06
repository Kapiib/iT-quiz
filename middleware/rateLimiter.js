const rateLimit = require('express-rate-limit');

// Custom rate limiters for auth endpoints with styled error pages
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    handler: (req, res) => {
        res.status(429).render('error', {
            title: 'Login Limit Exceeded',
            message: 'Too many login attempts. Please try again after 15 minutes.',
            user: req.user || null
        });
    }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per windowMs
    handler: (req, res) => {
        res.status(429).render('error', {
            title: 'Register Limit Exceeded',
            message: 'Too many registration attempts. Please try again after an hour.',
            user: req.user || null
        });
    }
});

const resetRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per windowMs
    handler: (req, res) => {
        res.status(429).render('error', {
            title: 'Password Reset Limit Exceeded',
            message: 'Too many password reset attempts. Please try again after an hour.',
            user: req.user || null
        });
    }
});

module.exports = {
    loginLimiter,
    registerLimiter,
    resetRequestLimiter
};