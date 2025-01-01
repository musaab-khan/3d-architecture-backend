const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const UserModel = require('../models/UserModels');

// Protected route to create a userModel
router.post('/create-project', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract JWT from header
    if (!token) return res.status(401).send('Access denied');
  
    try {
      // Verify the JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Destructure the request body
      const { userId, name, dimensions, imgURL } = req.body;
  
      // Validate the request body
      if (!name || !dimensions || !Array.isArray(dimensions) || dimensions.length !== 2) {
        return res.status(400).send('Invalid input. Please provide userId, name, and valid dimensions.');
      }
  
      // Ensure the user ID in the token matches the one in the body
    //   if (decoded.id !== userId) {
    //     return res.status(403).send('User ID mismatch. Unauthorized request.');
    //   }
  
      // Create the new model
      UserModel.create({
        name,
        dimensions,
        imgURL: imgURL || null, // Default to null if imgURL is not provided
        userId,
      })
        .then((newModel) => {
          res.status(201).json({ message: 'Model created successfully', model: newModel });
        })
        .catch((err) => {
          console.error('Error creating model:', err);
          res.status(500).send('Internal server error');
        });
    } catch (err) {
      console.error('JWT verification failed:', err);
      res.status(401).send('Invalid token');
    }
  });
  