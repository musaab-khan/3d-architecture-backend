const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dimensions: { type: [Number], required: true },
  imgURL: { type: String, default: null },
  userId: { type: String, required: true },
});

// Use `mongoose.models` to avoid overwriting the model
const UserModel = mongoose.models.UserModel || mongoose.model('UserModel', UserSchema);

module.exports = UserModel;
