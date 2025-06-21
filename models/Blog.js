const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  titleLine1: { type: String, required: true },
  titleLine2: String,
  category: String,
  tags: [String],
  image: String,

  author: String,
  authorImage: String, // Used as authorAvatar in UI

  contentParagraphs: [String],
  quotes: [String],

  views: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },

  likes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      firstName: String,
      likedAt: { type: Date, default: Date.now }
    }
  ],

  commentsCount: { type: Number, default: 0 },

  socialLinks: {
    facebook: String,
    twitter: String,
    dribbble: String,
    behance: String
  }

}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Blog', blogSchema);
