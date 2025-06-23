const express = require("express");
const mongoose = require("mongoose");
const blogRoutes = require("./routes/blogRoutes");
const newsletterRoutes = require('./routes/newsletterRoutes');
const contactRoute = require("./routes/contactRoute");
const commentRoutes = require("./routes/commentRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://codenest-blog-frontend.vercel.app", "https://codenest-blog-frontend-tirb.vercel.app"],
  credentials: true,
}));


app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api", blogRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use("/api/contact-form", contactRoute);
app.use("/api/comments", commentRoutes);
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/profile', profileRoutes); // Authentication routes

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
