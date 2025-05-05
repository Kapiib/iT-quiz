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
    console.log("Google callback received with code", req.query.code ? "PRESENT" : "MISSING");
    const code = req.query.code;
    
    console.log("Getting tokens from Google...");
    const { tokens } = await client.getToken(code);
    console.log("Tokens received from Google");
    
    // Get user info
    client.setCredentials(tokens);
    console.log("Verifying ID token...");
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    console.log("User info retrieved:", payload.email);
    
    // Find or create user
    console.log("Looking for existing user...");
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      console.log("Creating new user...");
      // Create new user if not exists
      user = new User({
        name: payload.name,
        email: payload.email,
        password: crypto.randomBytes(16).toString('hex'), // Random password
        profilePic: payload.picture,
        authProviders: [{ provider: 'google', providerId: payload.sub }]
      });
      await user.save();
      console.log("New user created:", user.email);
    } else {
      console.log("Existing user found:", user.email);
      if (!user.authProviders || !user.authProviders.some(p => p.provider === 'google')) {
        // Add Google as auth provider if user exists but hasn't used Google before
        console.log("Adding Google provider to existing user");
        if (!user.authProviders) {
          user.authProviders = [];
        }
        user.authProviders.push({ provider: 'google', providerId: payload.sub });
        await user.save();
      }
    }
    
    // Create JWT
    console.log("Creating JWT token...");
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie and redirect
    console.log("Setting cookie and redirecting...");
    res.cookie('token', token, { 
      httpOnly: true,
      secure: false, // Change to false for HTTP testing
      sameSite: 'lax', // Add this for better compatibility
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    console.log("Redirecting to profile page...");
    return res.redirect('/profile');
  } catch (error) {
    console.error('Google auth error DETAILS:', error.message);
    console.error('Error stack:', error.stack);
    return res.redirect('/auth/login?error=' + encodeURIComponent('Google authentication failed: ' + error.message));
  }
});

module.exports = router;