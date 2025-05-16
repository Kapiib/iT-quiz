const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { createToken } = require('../utils/jwtUtils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/activityLogger'); // Add this import

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
    console.log("Google callback received");
    const code = req.query.code;
    
    console.log("Getting tokens from Google");
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
    let isNewUser = false;

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
      isNewUser = true;
    } else if (!user.authProviders || !user.authProviders.some(p => p.provider === 'google')) {
      // Add Google as auth provider if user exists but hasn't used Google before
      if (!user.authProviders) {
        user.authProviders = [];
      }
      user.authProviders.push({ provider: 'google', providerId: payload.sub });
      await user.save();
    }
    
    // Log the activity - new or returning Google user
    if (isNewUser) {
      await logActivity('user', 'Google Registration', `New user registered via Google: ${payload.email}`, user._id, req.ip);
    } else {
      if (user.role === 'admin') {
        await logActivity('admin', 'Admin Google Login', `Administrator logged in via Google: ${user.email}`, user._id, req.ip);
      } else if (user.role === 'moderator') {
        await logActivity('admin', 'Moderator Google Login', `Moderator logged in via Google: ${user.email}`, user._id, req.ip);
      } else {
        await logActivity('user', 'Google Login', `User logged in via Google: ${user.email}`, user._id, req.ip);
      }
    }

    // Create JWT - add profilePic to the payload
    const token = createToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic, // Add this line to include profilePic
      createdAt: user.createdAt
    });
    
    // Set cookie and redirect
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    console.log(`User authenticated via Google: ${user.name} (${user.email})`);
    
    res.redirect('/profile');
  } catch (error) {
    console.error('GOOGLE AUTH ERROR:', error);
    console.error('Error stack:', error.stack);
    // You could render an error page with detailed information
    return res.status(500).send(`
      <h1>Authentication Error</h1>
      <p>${error.message}</p>
      <a href="/auth/login">Back to login</a>
    `);
  }
});

module.exports = router;