const express = require("express");
const router = express.Router();
const { checkAuth, redirectIfAuthenticated } = require('../middleware/checkAuth');
const authController = require("../controllers/authController");
const quizController = require('../controllers/quizController');

// Home route
router.get('/', quizController.getHomepageQuizzes);

// Profile route (protected) - now with userQuizzes
router.get('/profile', checkAuth, async (req, res) => {
    try {
        console.log("Profile route: User authenticated as", req.user.id);
        const userQuizzes = await quizController.getUserQuizzes(req.user.id);
        
        res.render('profile', { 
            title: 'Profile',
            user: req.user,
            userQuizzes
        });
    } catch (error) {
        console.error("Profile route error:", error);
        res.status(500).send("An error occurred");
    }
});

// Example for the FAQ route
router.get('/fqa', (req, res) => {
    res.render('faq', { 
        title: 'FAQ',
        user: req.user || null  // Always pass user, null if not logged in
    });
});

// Add Quiz GET routes
// Note: Order matters! More specific routes first
router.get('/quiz/create', checkAuth, quizController.showCreateForm);
router.get('/quiz/edit/:id', checkAuth, quizController.showEditForm);
router.get('/quiz/delete/:id', checkAuth, quizController.deleteQuiz);
router.get('/quiz/:id', quizController.getQuiz);  // This must come after other specific /quiz/xxx routes

// Settings page (protected)
router.get('/settings', checkAuth, (req, res) => {
    res.render('settings', { 
        title: 'Account Settings',
        user: req.user
    });
});

// Auth page routes 
router.get("/auth/register", redirectIfAuthenticated, (req, res) => {
    res.render('register', { 
        title: 'Register',
        user: null  // Add this line
    });
});

router.get("/auth/login", redirectIfAuthenticated, (req, res) => {
    res.render('login', { 
        title: 'Login',
        user: null  // Add this line
    });
});

router.get("/auth/logout", authController.logout);

// Update the quizzes route
router.get('/quizzes', async (req, res) => {
    try {
        // Pass the category from query params if it exists
        const quizzes = await quizController.getAllQuizzes(req.query.category);
        res.render('quizzes', {
            title: 'All Quizzes',
            quizzes: quizzes,
            user: req.user || null
        });
    } catch (error) {
        console.error("Quizzes route error:", error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load quizzes',
            user: req.user || null
        });
    }
});

module.exports = router;