const Quiz = require('../models/Quiz');
const User = require('../models/User');

const quizController = {
    // Get all public quizzes for the homepage
    getAllQuizzes: async (categoryFilter = null) => {
        try {
            const filter = { isPublic: true };
            
            // Apply category filter if provided
            if (categoryFilter && categoryFilter !== 'all') {
                filter.category = categoryFilter;
            }
            
            // Use a left join with lookup to handle missing creators
            const quizzes = await Quiz.find(filter)
                .populate('creator', 'name')
                .sort({ createdAt: -1 });
            
            // Filter out quizzes with missing creators and fix those that remain
            const filteredQuizzes = quizzes.map(quiz => {
                if (!quiz.creator) {
                    // Set a default creator for quizzes with deleted creators
                    quiz.creator = { name: "Deleted User" };
                }
                return quiz;
            });
            
            return filteredQuizzes;
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            return [];
        }
    },
    
    // Get quizzes for the homepage with count limit
    getHomepageQuizzes: async (req, res) => {
        try {
            const quizzes = await Quiz.find({ isPublic: true })
                .populate('creator', 'name')
                .sort({ createdAt: -1 })
                .limit(10);
                
            res.render('index', {
                title: 'Home',
                quizzes: quizzes,
                user: req.user || null  // Add this line
            });
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            res.render('index', {
                title: 'Home',
                quizzes: [],
                error: 'Failed to load quizzes'
            });
        }
    },
    
    // Get user's quizzes for profile page
    getUserQuizzes: async (userId) => {
        try {
            return await Quiz.find({ creator: userId }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error fetching user quizzes:', error);
            return [];
        }
    },
    
    // Show quiz creation form
    showCreateForm: (req, res) => {
        res.render('quiz/create', {
            title: 'Create Quiz',
            user: req.user || null  // Add this line
        });
    },
    
    // Create a new quiz
    createQuiz: async (req, res) => {
        try {
            const { title, description, questions, isPublic, category } = req.body;
            
            const newQuiz = new Quiz({
                title,
                description,
                category: category || 'general', // Use provided category or default to general
                creator: req.user.id,
                questions: JSON.parse(questions),
                isPublic: isPublic === 'true' || isPublic === 'public'
            });
            
            await newQuiz.save();
            res.redirect('/profile');
        } catch (error) {
            console.error('Error creating quiz:', error);
            res.render('quiz/create', {
                title: 'Create Quiz',
                error: 'Failed to create quiz',
                formData: req.body,
                user: req.user || null
            });
        }
    },
    
    // Show quiz details/play page
    getQuiz: async (req, res) => {
        try {
            const quiz = await Quiz.findById(req.params.id)
                .populate('creator', 'name');
                
            if (!quiz) {
                return res.status(404).render('error', {
                    title: 'Quiz Not Found',
                    message: 'The quiz you are looking for does not exist',
                    user: req.user || null  // Add this line
                });
            }
            
            res.render('quiz/play', {
                title: quiz.title,
                quiz,
                user: req.user || null  // Add this line
            });
        } catch (error) {
            console.error('Error fetching quiz:', error);
            res.render('error', {
                title: 'Error',
                message: 'Failed to load quiz',
                user: req.user || null  // Add this line
            });
        }
    },
    
    // Show quiz edit form
    showEditForm: async (req, res) => {
        try {
            const quiz = await Quiz.findById(req.params.id);
            
            if (!quiz) {
                return res.status(404).render('error', {
                    title: 'Quiz Not Found',
                    message: 'The quiz you are trying to edit does not exist',
                    user: req.user || null  // Add this line
                });
            }
            
            // Check if user is the creator
            if (quiz.creator.toString() !== req.user.id) {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'You can only edit quizzes you created',
                    user: req.user || null  // Add this line
                });
            }
            
            res.render('quiz/edit', {
                title: 'Edit Quiz',
                quiz,
                user: req.user || null  // Add this line
            });
        } catch (error) {
            console.error('Error fetching quiz for edit:', error);
            res.render('error', {
                title: 'Error',
                message: 'Failed to load quiz for editing',
                user: req.user || null  // Add this line
            });
        }
    },
    
    // Update an existing quiz
    updateQuiz: async (req, res) => {
        try {
            const { title, description, questions, isPublic, category } = req.body;
            const quiz = await Quiz.findById(req.params.id);
            
            if (!quiz) {
                return res.status(404).render('error', {
                    title: 'Quiz Not Found',
                    message: 'The quiz you are trying to update does not exist',
                    user: req.user || null
                });
            }
            
            // Check if user is the creator
            if (quiz.creator.toString() !== req.user.id) {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'You can only update quizzes you created',
                    user: req.user || null
                });
            }
            
            quiz.title = title;
            quiz.description = description;
            quiz.category = category || 'general';
            quiz.questions = JSON.parse(questions);
            quiz.isPublic = isPublic === 'true' || isPublic === 'public';
            
            await quiz.save();
            res.redirect('/profile');
        } catch (error) {
            console.error('Error updating quiz:', error);
            res.render('quiz/edit', {
                title: 'Edit Quiz',
                error: 'Failed to update quiz',
                quiz: { ...req.body, _id: req.params.id },
                user: req.user || null
            });
        }
    },
    
    // Delete a quiz
    deleteQuiz: async (req, res) => {
        try {
            const quiz = await Quiz.findById(req.params.id);
            
            if (!quiz) {
                return res.status(404).render('error', {
                    title: 'Quiz Not Found',
                    message: 'The quiz you are trying to delete does not exist',
                    user: req.user || null  // Add this line
                });
            }
            
            // Check if user is the creator
            if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'You can only delete quizzes you created',
                    user: req.user || null  // Add this line
                });
            }
            
            await Quiz.findByIdAndDelete(req.params.id);
            res.redirect('/profile');
        } catch (error) {
            console.error('Error deleting quiz:', error);
            res.render('error', {
                title: 'Error',
                message: 'Failed to delete quiz',
                user: req.user || null  // Add this line
            });
        }
    }
};

module.exports = quizController;