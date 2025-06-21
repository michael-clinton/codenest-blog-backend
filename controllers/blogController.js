const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Category = require("../models/Category");

// 📘 Get paginated blogs with comment count
const getPaginatedBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const { category, tag } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    const totalBlogs = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const blogsWithCommentCount = await Promise.all(
      blogs.map(async (blog) => {
        const commentCount = await Comment.countDocuments({ blogId: blog._id });
        return {
          ...blog.toObject(),
          commentsCount: commentCount,
        };
      })
    );

    res.status(200).json({
      blogs: blogsWithCommentCount,
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching paginated blogs:", error);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

const getBlogsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 4 } = req.query;

    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const query = {
      category: { $regex: new RegExp(`^${category.name}$`, 'i') },
      isPublished: true
    };

    const totalCount = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({ blogs, totalCount });
  } catch (error) {
    console.error("Error fetching blogs by category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true });
    res.status(200).json({ blogs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blogs', error: err.message });
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await Blog.distinct("tags", { isPublished: true });
    res.status(200).json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
};

const getCategoryCounts = async (req, res) => {
  try {
    const counts = await Blog.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(counts);
  } catch (error) {
    console.error("Error fetching category counts:", error);
    res.status(500).json({ message: "Failed to fetch category counts" });
  }
};

const getCategories = async (req, res) => {
  try {
    const topCategories = await Blog.aggregate([
      { $match: { category: { $exists: true, $ne: null }, isPublished: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          category: "$_id"
        }
      }
    ]);

    const categories = topCategories.map(cat => cat.category);
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching top categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const getSingleBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findOneAndUpdate(
      { _id: id, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found or not published' });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getTwoRandomBlogs = async (req, res) => {
  try {
    const blogs = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $sample: { size: 2 } }
    ]);
    const [previousPost = null, nextPost = null] = blogs;

    res.status(200).json({ success: true, previousPost, nextPost });
  } catch (error) {
    console.error("Error fetching random blogs:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { userId, firstName } = req.body;
    const { id: blogId } = req.params;

    if (!userId || !firstName) {
      return res.status(400).json({ error: "userId and firstName are required" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog || !blog.isPublished) {
      return res.status(404).json({ error: "Blog not found or not published" });
    }

    const existingLikeIndex = blog.likes.findIndex(
      (like) => like.userId.toString() === userId.toString()
    );

    if (existingLikeIndex !== -1) {
      blog.likes.splice(existingLikeIndex, 1);
      await blog.save();
      return res.status(200).json({ message: "Unliked", likes: blog.likes });
    } else {
      blog.likes.push({ userId, firstName, likedAt: new Date() });
      await blog.save();
      return res.status(200).json({ message: "Liked", likes: blog.likes });
    }
  } catch (error) {
    console.error("Toggle Like Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found or not published" });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("Get Blog Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPopularPosts = async (req, res) => {
  try {
    const popularPosts = await Blog.aggregate([
      { $match: { isPublished: true } },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          popularityScore: { $add: [{ $size: "$likes" }, "$commentsCount"] }
        }
      },
      { $sort: { popularityScore: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json(popularPosts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching popular posts", error: err });
  }
};

module.exports = {
  getPaginatedBlogs,
  getBlogById,
  getTags,
  getCategoryCounts,
  getCategories,
  getSingleBlog,
  getTwoRandomBlogs,
  toggleLike,
  getPopularPosts,
  getAllBlogs,
  getAllCategories,
  getBlogsByCategory,
};
