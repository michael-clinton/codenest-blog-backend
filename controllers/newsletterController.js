const NewsletterSubscriber = require('../models/NewsletterSubscriber');

const subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Save to DB, handle duplicates gracefully
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already subscribed' });
    }

    await NewsletterSubscriber.create({ email });
    return res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

module.exports = { subscribe };
