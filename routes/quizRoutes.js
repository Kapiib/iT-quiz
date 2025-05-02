const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { checkAuth } = require('../middleware/checkAuth');

// Only POST routes here
router.post('/create', checkAuth, quizController.createQuiz);
router.post('/edit/:id', checkAuth, quizController.updateQuiz);

module.exports = router;