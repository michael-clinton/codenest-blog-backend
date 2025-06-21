const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, getUserById } = require('../controllers/profileController');

const router = express.Router();

// ✅ 1. Multer storage config (memory-based, which is good if you're uploading to cloud or processing in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ 2. Token-based auth middleware applied to all routes
router.use(authenticateToken);

// ✅ 3. GET route to fetch user profile

router.get('/basic/:userId', getUserById);

router.get('/:id', getUserProfile);

router.patch('/:id', upload.single('profileImage'), updateUserProfile);

module.exports = router;
