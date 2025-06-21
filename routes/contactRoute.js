const express = require("express");
const router = express.Router();

const { sendContactMessage } = require("../controllers/contactController");

// POST /contact
router.post("/contact", sendContactMessage);

module.exports = router;
