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
        const userQuizzes = await quizController.getUserQuizzes(req.user.id);
        
        res.render('profile', { 
            title: 'Profile',
            user: req.user,
            userQuizzes
        });
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        res.render('profile', { 
            title: 'Profile',
            user: req.user,
            userQuizzes: []
        });
    }
});

router.get('/fqa', (req, res) => {
    res.render('faq', { title: 'FAQ' });
});

// Add Quiz GET routes
// Note: Order matters! More specific routes first
router.get('/quiz/create', checkAuth, quizController.showCreateForm);
router.get('/quiz/edit/:id', checkAuth, quizController.showEditForm);
router.get('/quiz/delete/:id', checkAuth, quizController.deleteQuiz);
router.get('/quiz/:id', quizController.getQuiz);  // This must come after other specific /quiz/xxx routes

// Auth page routes 
router.get("/auth/register", redirectIfAuthenticated, (req, res) => {
    res.render('register', { title: 'Register' });
});

router.get("/auth/login", redirectIfAuthenticated, (req, res) => {
    res.render('login', { title: 'Login' });
});

router.get("/auth/logout", authController.logout);

module.exports = router;