const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { createToken } = require('../utils/jwtUtils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Create OAuth client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/auth/google/callback`
);

// Google login initiation
router.get('/google', (req, res) => {
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    include_granted_scopes: true
  });
  res.redirect(authorizeUrl);
});

// Google callback
router.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await client.getToken(code);
    
    // Get user info
    client.setCredentials(tokens);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    // Find or create user
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      // Create new user if not exists
      user = new User({
        name: payload.name,
        email: payload.email,
        password: crypto.randomBytes(16).toString('hex'), // Random password
        profilePic: payload.picture,
        authProviders: [{ provider: 'google', providerId: payload.sub }]
      });
      await user.save();
    } else if (!user.authProviders.some(p => p.provider === 'google')) {
      // Add Google as auth provider if user exists but hasn't used Google before
      user.authProviders.push({ provider: 'google', providerId: payload.sub });
      await user.save();
    }
    
    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie and redirect
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.redirect('/profile');
  } catch (error) {
    console.error('Google auth error:', error);
    res.redirect('/auth/login?error=Google+authentication+failed');
  }
});

module.exports = router;