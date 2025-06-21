const mongoose = require('mongoose');
const Blog = require('./models/Blog');
const Category = require('./models/Category');

mongoose.connect('mongodb://localhost:27017/blogDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  syncBlogCategories(); // call your function only after connection
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

const syncBlogCategories = async () => {
  try {
    const blogs = await Blog.find();
    for (const blog of blogs) {
      const category = await Category.findOne({ name: blog.category });
      if (category) {
        blog.category = category._id;
        await blog.save();
      }
    }
    console.log("✅ Blog categories synced.");
    mongoose.disconnect(); // close the connection when done
  } catch (err) {
    console.error("❌ Error syncing:", err);
  }
};
