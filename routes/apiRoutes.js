// Admin API routes
router.get('/api/admin/stats', checkAuth, isAdmin, async (req, res) => {
    try {
        const stats = await adminController.getAdminStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

router.get('/api/admin/user/:userId', checkAuth, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('name email role active profilePic');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            active: user.active,
            profilePic: user.profilePic
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.post('/api/admin/user/role', checkAuth, isAdmin, async (req, res) => {
    try {
        const { userId, role } = req.body;
        
        if (!userId || !role) {
            return res.status(400).json({ error: 'User ID and role are required' });
        }
        
        // Validate role
        const validRoles = ['user', 'moderator', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ success: true, user: {
            id: user._id,
            name: user.name,
            role: user.role
        }});
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

router.post('/api/admin/user/status', checkAuth, isAdmin, async (req, res) => {
    try {
        const { userId, active } = req.body;
        
        if (!userId || active === undefined) {
            return res.status(400).json({ error: 'User ID and status are required' });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { active: Boolean(active) },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ success: true, user: {
            id: user._id,
            name: user.name,
            active: user.active
        }});
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

router.delete('/api/admin/user/:userId', checkAuth, isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Don't allow deleting yourself
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ error: 'You cannot delete your own account from admin panel' });
        }
        
        // Delete user's quizzes
        await Quiz.deleteMany({ creator: userId });
        
        // Delete the user
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

router.delete('/api/admin/quiz/:quizId', checkAuth, isAdmin, async (req, res) => {
    try {
        const { quizId } = req.params;
        
        const quiz = await Quiz.findByIdAndDelete(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
});

router.post('/api/admin/settings', checkAuth, isAdmin, async (req, res) => {
    try {
        // In a real app, you would save these settings to a database
        // For now, we'll just simulate success
        const settings = req.body;
        console.log('Saving settings:', settings);
        res.json({ success: true });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});