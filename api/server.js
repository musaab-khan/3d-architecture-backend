const express = require('express');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('../config/db'); // Adjusted path
const authRoutes = require('./routes/auth'); // Adjusted path

require('../config/passport')(passport); // Adjusted path

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());
app.use(passport.initialize());
connectDB();
app.use('/auth', authRoutes);

module.exports = app;
