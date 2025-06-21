const Comment = require("../models/Comment");

// Get all comments for a specific blog
const getCommentsByBlogId = async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Post a new comment
const createComment = async (req, res) => {
  try {
    const { blogId, name, email, subject, message, parentId, image } = req.body;
    console.log("Incoming comment body:", req.body); // 🔍 Debug

    if (!blogId || !name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newComment = new Comment({
      blogId,
      name,
      email,
      subject,
      message,
      image: image || "/default-user.png", // ✅ Use image from frontend, or fallback
      parentId: parentId || null,
    });

    const savedComment = await newComment.save();
    res.status(200).json(savedComment);
  } catch (err) {
    console.error("❌ Comment creation failed:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

module.exports = {
  getCommentsByBlogId,
  createComment
};
