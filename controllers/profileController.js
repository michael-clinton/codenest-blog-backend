const UserAdmin = require('../models/UserSchema'); // adjust path as needed
const uploadToCloudinary = require('../utils/cloudinaryUploader'); // adjust path
const User = require('../models/UserSchema'); // adjust path if needed

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserAdmin.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Update user profile by ID
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, bio, phone } = req.body;

    console.log('req.file:', req.file); // Debug: check if file is received

    let profileImageUrl = null;
    if (req.file) {
      profileImageUrl = await uploadToCloudinary(req.file);
      console.log('Cloudinary uploaded URL:', profileImageUrl);
    }

    const user = await UserAdmin.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (profileImageUrl) user.profileImage = profileImageUrl;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// GET /api/profile/basic/:userId
const getUserById = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Validate ObjectId format before querying (optional but safer)
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    const user = await User.findById(userId).select('firstName email profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('❌ Error fetching user details:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserProfile, updateUserProfile, getUserById };