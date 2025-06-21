// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String, // Image URL or path
    required: true
  }
});

module.exports = mongoose.model('Category', categorySchema);
