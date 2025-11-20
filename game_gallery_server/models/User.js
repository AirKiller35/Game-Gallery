const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // No two users can have the same name
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email
  },
  password: {
    type: String,
    required: true,
  },
  // We can add a 'favorites' array here in the future
});

module.exports = mongoose.model('user', UserSchema);