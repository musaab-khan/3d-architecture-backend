const express = require('express');
const cors = require('cors'); // Import the CORS package
const passport = require('passport');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const createModelRoutes = require('./routes/startProject');

// Passport configuration
require('./config/passport')(passport);

const app = express();

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://3d-architecture.vercel.app'], // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow cookies and credentials if needed
}));

app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Connect to MongoDB
connectDB();

// Use Routes
app.use('/auth', authRoutes);
app.use('/idk', searchRoutes);
app.use('/project', searchRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));