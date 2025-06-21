const express = require("express");
const router = express.Router();
const {
  getCommentsByBlogId,
  createComment
} = require("../controllers/commentController");


// Route to post a comment
router.post("/add", createComment);  

// Route to get all comments for a blog
router.get("/:blogId", getCommentsByBlogId);

      

module.exports = router;
