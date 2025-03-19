const express = require('express');
const jwt = require('jsonwebtoken');
const crypto= require('crypto');
const User = require('../models/User');
const router = express.Router();
const axios = require('axios');

router.post('/google-login', async (req, res) => {
  const { tokenId } = req.body; // The token sent from the frontend (Google's token)

  try {
    // Step 1: Verify the Google token
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`);

    const { email, name,  sub: googleId } = googleResponse.data; // Extract user data from Google response
    console.log(email)
    // Step 2: Check if the user already exists in your database
    let user = await User.findOne({ email });
    
    if (!user) {
      // If the user does not exist, create a new one
      user = new User({
        email,
        username: name,
        googleId,
        password: crypto.randomBytes(25).toString('hex'), // Since Google login doesn't require a password
      });
      await user.save(); // Save the new user to the database
    }

    // Step 3: Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

    // Step 4: Send the token back to the frontend
    res.json({ token });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(500).send('Internal server error');
  }
});


// // Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(password)
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).send('User created successfully');
  } catch (err) {
    console.error(err);
    if(err.code=11000){
      res.status(409).send('User with this email already exists');
      clg('User with this email already exists');
    }
    else{
      res.status(400).send('Error creating user. Try Again');
    }
  }
});

// Signup
// router.post('/signup', async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     console.log(password)
//     const user = new User({ username, email, password });
//     await user.save();
//     res.status(201).send('User created successfully');
//   } catch (err) {
//     console.error(err);
//     res.status(400).send('Error creating user');
//   }
// });
// router.post('/signup', async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     console.log('Password received:', password ? 'Yes' : 'No');
    
//     if (!email || !username || !password) {
//       return res.status(400).send('All fields are required');
//     }
    
//     // Check if user with this email already exists
//     const existingUserByEmail = await User.findOne({ email });
//     if (existingUserByEmail) {
//       console.log('Email already exists:', email);
//       return res.status(409).send('User with this email already exists');
//     }
    
//     // Check if username is already taken
//     const existingUserByUsername = await User.findOne({ username });
//     if (existingUserByUsername) {
//       console.log('Username already taken:', username);
//       return res.status(409).send('Username already taken');
//     }
    
//     // Create and save the new user
//     const user = new User({ username, email, password });
//     await user.save();
//     console.log('User created successfully:', email);
//     res.status(201).send('User created successfully');
//   } catch (err) {
//     console.error('Error in signup route:', err);
    
//     // Check if error is a MongoDB duplicate key error
//     if (err.name === 'MongoServerError' && err.code === 11000) {
//       // Extract the duplicated field from the error message
//       const field = Object.keys(err.keyPattern)[0];
//       console.log(`Duplicate key error for field: ${field}`);
//       return res.status(409).send(`User with this ${field} already exists`);
//     }
    
//     // Handle validation errors
//     if (err.name === 'ValidationError') {
//       const errorMessages = Object.values(err.errors).map(e => e.message);
//       console.log('Validation error:', errorMessages);
//       return res.status(400).send(errorMessages.join(', '));
//     }
    
//     console.log('Generic error creating user');
//     // res.status(500).send('Error creating user');
//   }
// });

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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: 'Access granted', userId: decoded.id });
  } catch {
    res.status(401).send('Invalid token');
  }
});

module.exports = router;