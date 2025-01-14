// routes/search.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Models = require('../models/Models'); // Ensure the path is correct
const userModel = require('../models/userModels'); // Ensure the path is correct
const assetsSchema = require('../models/assetsCollection'); // Ensure the path is correct

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
    const { userId, name, dimensions, imageUrl } = req.body;

    // Validate the request body
    if (!name || !dimensions || !Array.isArray(dimensions) || dimensions.length !== 2) {
      return res.status(400).send('Invalid input. Please provide userId, name, and valid dimensions.');
    }

    // Ensure the user ID in the token matches the one in the body
    // if (decoded.id !== userId) {
    //   return res.status(403).send('User ID mismatch. Unauthorized request.');
    // }
    // Create the new model
    userModel.create({
      name,
      dimensions,
      imgURL: imageUrl,
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

router.get('/assets', async (req, res) => {
  try {
    const assets = await assetsSchema.find();
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching assets.' });
  }
});

router.post('/update-model-json', async (req, res) => {
  console.log(req.body);
  const token = req.headers.authorization?.split(' ')[1]; // Extract JWT from header
  if (!token) return res.status(401).send('Access denied');

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Destructure the request body
    const { projectID, modelJSON } = req.body;

    // Validate the request body
    if (!projectID || !modelJSON) {
      return res.status(400).send('Invalid input. Please provide projectId and modelJSON.');
    }

    // Find the model by userId and projectId
    const userModelInstance = await userModel.findOne({ userId: decoded.id, _id: projectID });

    if (!userModelInstance) {
      return res.status(404).send('Model not found or unauthorized access.');
    }

    // Update the modelJSON field
    userModelInstance.modelJSON = modelJSON;
    await userModelInstance.save();

    res.status(200).json({
      message: 'Model JSON updated successfully',
      model: userModelInstance,
    });
  } catch (err) {
    console.error('Error occurred:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).send('Invalid token');
    }

    res.status(500).send('Internal server error');
  }
});

router.get('/get-model-json/:projectId', async (req, res) => {
  // Get the projectId from the URL parameter
  const { projectId } = req.params;

  // Validate that projectId is provided
  if (!projectId) {
    return res.status(400).send('Project ID is required.');
  }

  try {
    // Find the user model based on the projectId
    const userModelInstance = await userModel.findOne({ _id: projectId });

    // If no user model is found, return an error
    if (!userModelInstance) {
      return res.status(404).send('Model not found.');
    }

    // Return the found model as JSON
    res.status(200).json({
      message: 'Model retrieved successfully',
      model: userModelInstance
    });
  } catch (err) {
    console.error('Error occurred:', err);

    res.status(500).send('Internal server error');
  }
});

router.get('/models', async (req, res) => {
  try {
    // Extract token from the authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Extract JWT from header
    if (!token) {
      return res.status(401).json({ message: 'Access denied. Token is missing.' });
    }

    // Decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;  // User ID decoded from the token

    // Find all models by the userId
    const userModels = await userModel.find({ userId });

    if (!userModels || userModels.length === 0) {
      return res.status(404).json({ message: 'No models found for this user.' });
    }

    // Extract necessary details (id, name, dimensions) for each model
    const modelsData = userModels.map(model => ({
      id: model._id,
      name: model.name,
      dimensions: model.dimensions
    }));

    // Send the response with the models data
    return res.status(200).json({
      message: 'User models retrieved successfully',
      models: modelsData
    });

  } catch (err) {
    console.error('Error occurred:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
