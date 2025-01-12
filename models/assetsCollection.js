const mongoose = require('mongoose');

const assetsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  modelName: {
    type: String,
    required: true,
  },
  modelURL: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
    required: true,
  },
}, { collection: 'assetsCollection' }); // Explicitly set the collection name

module.exports = mongoose.model('Asset', assetsSchema);
