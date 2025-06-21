const express = require("express");
const { getPaginatedBlogs, getCategoryCounts, getTags,  getCategories, getSingleBlog, getTwoRandomBlogs, toggleLike, getPopularPosts, getAllBlogs, getAllCategories, getBlogsByCategory } = require("../controllers/blogController");

const router = express.Router();

// Route to fetch paginated blogs
// Static or more specific routes first
router.get('/blog/tags', getTags);
router.get('/blog/popular-posts', getPopularPosts);
router.get('/blog/random-two', getTwoRandomBlogs);
router.get('/blog/categories', getCategories);
router.get('/blog/categories-all', getAllCategories);
router.get('/blog/category-counts', getCategoryCounts);
router.get('/blog/category/:slug', getBlogsByCategory); // more specific
router.post('/blog/:id/like', toggleLike); // specific before generic
router.get("/blog/:id", getSingleBlog); // generic last
router.get("/blogs", getPaginatedBlogs);
router.get("/blogs-all", getAllBlogs); // okay here


module.exports = router;
