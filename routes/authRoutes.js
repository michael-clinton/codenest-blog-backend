const express = require('express');
const { 
    initiateRegistration, 
    completeRegistration, 
    login,
    resendOtp
} = require('../controllers/authController');
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Registration routes
router.post('/initiate-registration', initiateRegistration);
router.post('/complete-registration', completeRegistration);

// Login route
router.post('/login', login);

router.post('/resend-otp', resendOtp);


// Protected products route
router.get("/products", authenticateToken, (req, res) => {
    res.status(200).json({ message: "Authorized to access products." });
});

// Contact route
// router.post('/contact', authenticateToken, handleContactForm);

// router.post('/contact', authenticateToken, handleContactForm);

module.exports = router;
