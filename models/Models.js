
const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tags: [{ type: String }],
  dimensions: { type: [Number], required: true },
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.model('Models', modelSchema);
