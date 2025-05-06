const { verifyToken } = require("../utils/jwtUtils.js");

// Check if user is authenticated
const checkAuth = (req, res, next) => {
    // Check both cookie names during the transition
    const token = req.cookies.token || req.cookies.jwt;

    if (!token) {
        return res.redirect("/auth/login");
    }

    const decodedToken = verifyToken(token);

    if (!decodedToken) {
        res.clearCookie("jwt");
        res.clearCookie("token");
        return res.redirect("/auth/login");
    }

    req.user = decodedToken;
    next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).render('error', { 
        title: 'Access Denied', 
        message: 'Admin access required',
        user: req.user
    });
};

// Check if user is moderator or admin
const isModerator = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
        return next();
    }
    return res.status(403).render('error', { 
        title: 'Access Denied', 
        message: 'Moderator access required',
        user: req.user
    });
};

// Redirect authenticated users away from auth pages
const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        const decodedToken = verifyToken(token);
        if (decodedToken) {
            // User is authenticated, redirect to appropriate page
            return res.redirect('/profile');
        }
    }
    // User is not authenticated, continue to the login/register page
    next();
};

module.exports = { 
    checkAuth, 
    isAdmin, 
    isModerator,
    redirectIfAuthenticated
};