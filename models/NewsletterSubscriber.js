// models/NewsletterSubscriber.js
const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,      // prevent duplicate emails
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'], // basic email validation
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);

module.exports = NewsletterSubscriber;
