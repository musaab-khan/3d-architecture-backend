// routes/search.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Models = require('../models/Models'); // Ensure the path is correct
const userModel = require('../models/userModels'); // Ensure the path is correct

// Search Route
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).send('Query parameter is required');
  }

  try {
    const searchResults = await Models.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: 'i' } }, 
            { tags: { $regex: query, $options: 'i' } },
          ],
        },
      },
      { $limit: 10 },
    ]);

    // if (searchResults.length === 0) {
    //   return res.status(404).send('Lol no results found');
    // }

    res.status(200).json(searchResults);
  } catch (err) {
    console.error('Error during search:', err);
    res.status(500).send('Internal server error');
  }
});


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
    // if (decoded.id !== userId) {
    //   return res.status(403).send('User ID mismatch. Unauthorized request.');
    // }
    console.log('Decoded ID:', decoded.id);
    // Create the new model
    userModel.create({
      name,
      dimensions,
      imgURL: imgURL || null, // Default to null if imgURL is not provided
      userId: decoded.id
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


module.exports = router;
