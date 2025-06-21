const nodemailer = require("nodemailer");

// Controller function to handle contact form submission
const sendContactMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,  // from .env
            pass: process.env.GMAIL_PASSWORD,  // from .env
        },
    });


    const mailOptions = {
        from: email,
        to: "michaelclinton084@gmail.com",
        subject: `[Contact Form] ${subject}`,
        text: `
You have received a new message from the contact form on your website.

--------------------------------------
Name: ${name}
Email: ${email}

Message:
${message}
--------------------------------------

Please respond to the sender at your earliest convenience.
  `.trim(),
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error("Email sending failed:", error);
        res.status(500).json({ error: "Failed to send the message. Please try again later." });
    }
};

module.exports = { sendContactMessage };
