const Quiz = require('../models/Quiz');
const User = require('../models/User');

const quizController = {
    // Get all public quizzes for the homepage
    getAllQuizzes: async (req, res) => {
        try {
            const quizzes = await Quiz.find({ isPublic: true })
                .populate('creator', 'name')
                .sort({ createdAt: -1 });
                
            return quizzes;
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
                quizzes: quizzes
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
            title: 'Create Quiz'
        });
    },
    
    // Create a new quiz
    createQuiz: async (req, res) => {
        try {
            const { title, description, questions, isPublic } = req.body;
            
            const newQuiz = new Quiz({
                title,
                description,
                creator: req.user.id,
                questions: JSON.parse(questions),
                isPublic: isPublic === 'on'
            });
            
            await newQuiz.save();
            res.redirect('/profile');
        } catch (error) {
            console.error('Error creating quiz:', error);
            res.render('quiz/create', {
                title: 'Create Quiz',
                error: 'Failed to create quiz',
                formData: req.body
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
                    message: 'The quiz you are looking for does not exist'
                });
            }
            
            res.render('quiz/play', {
                title: quiz.title,
                quiz
            });
        } catch (error) {
            console.error('Error fetching quiz:', error);
            res.render('error', {
                title: 'Error',
                message: 'Failed to load quiz'
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
                    message: 'The quiz you are trying to edit does not exist'
                });
            }
            
            // Check if user is the creator
            if (quiz.creator.toString() !== req.user.id) {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'You can only edit quizzes you created'
                });
            }
            
            res.render('quiz/edit', {
                title: 'Edit Quiz',
                quiz
            });
        } catch (error) {
            console.error('Error fetching quiz for edit:', error);
            res.render('error', {
                title: 'Error',
                message: 'Failed to load quiz for editing'
            });
        }
    },
    
    // Update an existing quiz
    updateQuiz: async (req, res) => {
        try {
            const { title, description, questions, isPublic } = req.body;
            const quiz = await Quiz.findById(req.params.id);
            
            if (!quiz) {
                return res.status(404).render('error', {
                    title: 'Quiz Not Found',
                    message: 'The quiz you are trying to update does not exist'
                });
            }
            
            // Check if user is the creator
            if (quiz.creator.toString() !== req.user.id) {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'You can only update quizzes you created'
                });
            }
            
            quiz.title = title;
            quiz.description = description;
            quiz.questions = JSON.parse(questions);
            quiz.isPublic = isPublic === 'on';
            
            await quiz.save();
            res.redirect('/profile');
        } catch (error) {
            console.error('Error updating quiz:', error);
            res.render('quiz/edit', {
                title: 'Edit Quiz',
                error: 'Failed to update quiz',
                quiz: { ...req.body, _id: req.params.id }
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
                    message: 'The quiz you are trying to delete does not exist'
                });
            }
            
            // Check if user is the creator
            if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'You can only delete quizzes you created'
                });
            }
            
            await Quiz.findByIdAndDelete(req.params.id);
            res.redirect('/profile');
        } catch (error) {
            console.error('Error deleting quiz:', error);
            res.render('error', {
                title: 'Error',
                message: 'Failed to delete quiz'
            });
        }
    }
};

module.exports = quizController;