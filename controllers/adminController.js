const User = require('../models/User');
const Quiz = require('../models/Quiz');
const ActivityLog = require('../models/ActivityLog');

// Helper function to get dashboard stats
exports.getAdminStats = async () => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    
    // Get new users/quizzes in the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newUsers = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const newQuizzes = await Quiz.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    
    // Get stats for different user roles
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const moderatorUsers = await User.countDocuments({ role: 'moderator' });
    
    // Get stats for quiz categories
    const categoryStats = await Quiz.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get the top category
    const topCategory = categoryStats.length > 0 ? 
      categoryStats[0]._id.charAt(0).toUpperCase() + categoryStats[0]._id.slice(1) : 
      'None';
    
    return {
      totalUsers,
      totalQuizzes,
      newUsers,
      newQuizzes,
      adminUsers,
      moderatorUsers,
      categoryStats,
      topCategory
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return {
      totalUsers: 0,
      totalQuizzes: 0,
      newUsers: 0,
      newQuizzes: 0,
      adminUsers: 0,
      moderatorUsers: 0,
      categoryStats: [],
      topCategory: 'None'
    };
  }
};

// Get real activity logs from database
const getActivityLogs = async () => {
  try {
    return await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(10);
  } catch (error) {
    console.error('Error getting activity logs:', error);
    return [];
  }
};

// Main dashboard controller
exports.getDashboard = async (req, res) => {
  try {
    // Get admin stats
    const stats = await this.getAdminStats();
    
    // Get real activity logs
    const activities = await getActivityLogs();
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.user,
      stats,
      activities
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load admin dashboard',
      user: req.user
    });
  }
};

// Keep other controller methods but simplify them as needed
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.render('admin/users', {
      title: 'User Management',
      user: req.user,
      users
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load user management',
      user: req.user
    });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('creator', 'name')
      .sort({ createdAt: -1 });
    
    res.render('admin/quizzes', {
      title: 'Quiz Management',
      user: req.user,
      quizzes
    });
  } catch (error) {
    console.error('Admin quizzes error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load quiz management',
      user: req.user
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const stats = await this.getAdminStats();
    
    res.render('admin/reports', {
      title: 'Reports & Analytics',
      user: req.user,
      stats
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load reports',
      user: req.user
    });
  }
};

exports.getSettings = async (req, res) => {
  try {
    res.render('admin/settings', {
      title: 'System Settings',
      user: req.user
    });
  } catch (error) {
    console.error('Admin settings error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load system settings',
      user: req.user
    });
  }
};