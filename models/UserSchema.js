const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true },

  // Optional fields
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  profileImage: { type: String, default: '' }, // User avatar image

  // User status and metadata
  isEmailVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user'], default: 'user' }, // Only 'user' role

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
