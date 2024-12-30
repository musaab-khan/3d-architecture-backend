const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto= require('crypto');
const User = require('../models/User');
const router = express.Router();

const verifyGoogleToken = async (token) => {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
  );
  const data = await response.json();
  return data;
};

// Google OAuth login - Accept token sent from frontend
router.post('/google', async (req, res) => {
  const { token } = req.body; // Get the Google ID token sent from the frontend

  try {
    // Verify the token using Google's API
    const googleUser = await verifyGoogleToken(token);

    // Check if the user already exists in the database using Google ID
    let user = await User.findOne({ googleId: googleUser.sub });
    if (!user) {
      // If the user doesn't exist, create a new user

      // Generate a random password using crypto (16 bytes = 32 hex chars)
      const randomPassword = crypto.randomBytes(16).toString('hex');


      user = new User({
        googleId: googleUser.sub,
        username: googleUser.name,
        email: googleUser.email,
        password: randomPassword, // Store the hashed random password
      });
      await user.save();
    }

    // Generate JWT token for the user
    const payload = { id: user._id, username: user.username };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

    // Send the JWT token back to the frontend
    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(500).send('Server error');
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(password)
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).send('User created successfully');
  } catch (err) {
    console.error(err);
    res.status(400).send('Error creating user');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request received:', { email, password });

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).send('Invalid credentials');
    }

    // Compare password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      console.log('Password does not match');
      return res.status(401).send('Invalid credentials');
    }

    // Generate JWT token after successful login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the token back in the response
    res.json({ token });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(400).send('Error logging in');
  }
});

// Protected route (example)
router.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');
  
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.json({ message: 'Access granted', userId: decoded.id });
  } catch {
    res.status(401).send('Invalid token');
  }
});

module.exports = router;