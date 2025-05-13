const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { checkAuth } = require('../middleware/checkAuth');
const argon2 = require('argon2');
const { createToken } = require('../utils/jwtUtils'); // Import the token creation utility

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'profiles');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created upload directory:', uploadDir);
}

// Configure multer storage for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = 'public/uploads/profiles';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only images are allowed"));
    }
});

// Update profile information
router.post('/profile', checkAuth, upload.single('profilePic'), async (req, res) => {
    try {
        console.log('Profile update request received');
        const { name, email, bio } = req.body;
        
        // Basic validation
        if (!name || !email) {
            return res.redirect('/settings?error=Name+and+email+are+required');
        }
        
        // Check if email exists for another user
        const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
        if (existingUser) {
            return res.redirect('/settings?error=Email+already+in+use');
        }
        
        // Update user
        const user = await User.findById(req.user.id);
        
        // Check if name has changed - this will determine if we need to update the profile picture
        const nameChanged = user.name !== name;
        
        user.name = name;
        user.email = email;
        user.bio = bio || '';
        
        // Handle profile picture options
        if (req.file) {
            // New file uploaded - replace existing profile pic
            console.log('New profile picture uploaded:', req.file.filename);
            
            // Delete old profile picture if it exists
            if (user.profilePic && !user.profilePic.includes('googleusercontent')) {
                try {
                    const oldPath = path.join(__dirname, '..', 'public', user.profilePic);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                        console.log('Old profile picture deleted');
                    }
                } catch (err) {
                    console.error('Error deleting old profile picture:', err);
                }
            }
            
            // Update with new profile picture
            user.profilePic = 'uploads/profiles/' + req.file.filename;
            console.log('New profile picture path:', user.profilePic);
        } else if (nameChanged && user.profilePic && user.profilePic.startsWith('http')) {
            // If name changed and user has a Google profile picture, switch to using name initial
            console.log('Name changed - switching to name initial for profile');
            user.profilePic = ''; // Clear profile pic to default to initial
        }
        
        await user.save();
        console.log('User profile updated successfully');
        
        // Update the session with fresh user data
        const updatedUser = await User.findById(req.user.id);
        
        // Generate new token with updated user data
        const token = createToken({
            id: updatedUser._id,
            role: updatedUser.role,
            name: updatedUser.name,
            email: updatedUser.email,
            profilePic: updatedUser.profilePic,
            bio: updatedUser.bio
        });
        
        // Set the new token
        res.cookie('token', token, { 
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        
        res.redirect('/settings?success=Profile+updated&cache=' + Date.now());
    } catch (error) {
        console.error('Profile update error:', error);
        res.redirect('/settings?error=Update+failed');
    }
});

// Password change
router.post('/password', checkAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        if (newPassword !== confirmPassword) {
            return res.redirect('/settings?error=Passwords+do+not+match');
        }
        
        if (newPassword.length < 6) {
            return res.redirect('/settings?error=Password+must+be+at+least+6+characters');
        }
        
        const user = await User.findById(req.user.id);
        
        // Verify current password
        const isMatch = await argon2.verify(user.password, currentPassword);
        if (!isMatch) {
            return res.redirect('/settings?error=Current+password+is+incorrect');
        }
        
        // Hash new password
        const hashedPassword = await argon2.hash(newPassword);
        user.password = hashedPassword;
        
        await user.save();
        res.redirect('/settings?success=Password+updated');
    } catch (error) {
        console.error('Password update error:', error);
        res.redirect('/settings?error=Password+update+failed');
    }
});

// Delete account
router.get('/delete-account', checkAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Delete user's profile picture if it exists
        if (user.profilePic && !user.profilePic.includes('googleusercontent')) {
            try {
                const picPath = path.join(__dirname, '..', 'public', user.profilePic);
                if (fs.existsSync(picPath)) {
                    fs.unlinkSync(picPath);
                }
            } catch (err) {
                console.error('Error deleting profile picture:', err);
            }
        }
        
        // ADDED: Delete all quizzes created by this user
        const Quiz = require('../models/Quiz');
        await Quiz.deleteMany({ creator: req.user.id });
        console.log(`Deleted all quizzes created by user ${user.name} (${user._id})`);
        
        // Delete user
        await User.findByIdAndDelete(req.user.id);
        
        // Clear session
        res.clearCookie('token');
        
        res.redirect('/');
    } catch (error) {
        console.error('Account deletion error:', error);
        res.redirect('/settings?error=Account+deletion+failed');
    }
});

// Add this route at the end before module.exports
router.get('/debug', checkAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Check file existence
        let fileExists = false;
        let fullPath = '';
        if (user.profilePic) {
            fullPath = path.join(__dirname, '..', 'public', user.profilePic);
            fileExists = fs.existsSync(fullPath);
        }
        
        res.json({
            session_user: req.user,
            db_user: user,
            profilePicInDb: user.profilePic,
            fullPath: fullPath,
            fileExists: fileExists
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Add this route for debugging tokens
router.get('/check-token', checkAuth, (req, res) => {
    res.json({
        user: req.user,
        tokenExists: !!req.cookies.token
    });
});

module.exports = router;