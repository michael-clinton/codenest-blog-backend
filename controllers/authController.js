const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const sendEmail = require('../utils/mailer');

// Temporary storage for OTP and user data
const tempUsers = {};

/**
 * Initiates user registration by generating OTP and sending it to the user's email.
 */
// const initiateRegistration = async (req, res) => {
//     try {
//         const { email, password, name } = req.body;

//         // Validate required fields
//         if (!name || !email || !password) {
//             return res.status(400).json({ error: 'Name, email, and password are required.' });
//         }

//         // Check if the user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ error: 'Email already registered.' });
//         }

//         // Generate OTP and hash the password
//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
//         const hashedPassword = await bcrypt.hash(password, 10);

//         console.log(`Generated OTP for ${email}: ${otp}`);

//         // Save temporary user data
//         tempUsers[email] = {
//             name,
//             hashedPassword,
//             otp,
//             otpExpires,
//         };

//         // Send OTP via email
//         await sendEmail(email, 'Email Verification OTP', `Your OTP is: ${otp}`);

//         res.status(200).json({ message: 'OTP sent to your email. Complete registration to proceed.' });
//     } catch (err) {
//         console.error('Error in initiateRegistration:', err);
//         res.status(500).json({ error: 'Server error.' });
//     }
// };

const initiateRegistration = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        // Check if the username is unique
        const existingUsername = await User.findOne({ name });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username is already taken. Please choose another one.' });
        }

        // Check if the email is unique
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        // Generate OTP and hash the password
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`Generated OTP for ${email}: ${otp}`);

        // Save temporary user data
        tempUsers[email] = {
            name,
            hashedPassword,
            otp,
            otpExpires,
        };

        // Send OTP via email
        await sendEmail(email, 'Email Verification OTP', `Your OTP is: ${otp}`);

        res.status(200).json({ message: 'OTP sent to your email. Complete registration to proceed.' });
    } catch (err) {
        console.error('Error in initiateRegistration:', err);
        res.status(500).json({ error: 'Server error.' });
    }
};


/**
 * Completes user registration by validating OTP and saving user data to the database.
 */
// const completeRegistration = async (req, res) => {
//     try {
//         const { email, otp } = req.body;

//         // Validate input
//         if (!email || !otp) {
//             return res.status(400).json({ error: 'Email and OTP are required.' });
//         }

//         // Retrieve temporary user data
//         const tempUserData = tempUsers[email];
//         if (!tempUserData) {
//             return res.status(400).json({ error: 'No registration found for this email or OTP expired.' });
//         }

//         const { name, hashedPassword, otp: savedOtp, otpExpires } = tempUserData;

//         // Validate OTP and expiration
//         if (otp !== savedOtp || Date.now() > otpExpires) {
//             return res.status(400).json({ error: 'Invalid or expired OTP.' });
//         }

//         // Save user to the database
//         const newUser = new User({
//             name,
//             email,
//             password: hashedPassword,
//             isEmailVerified: true,
//         });
//         await newUser.save();

//         // Remove temporary data
//         delete tempUsers[email];

//         res.status(201).json({ message: 'User registered successfully.' });
//     } catch (err) {
//         console.error('Error in completeRegistration:', err);
//         res.status(500).json({ error: 'Server error.' });
//     }
// };

const resendOtp = async (req, res) => {
  const { email } = req.body;
  const tempData = tempUsers[email];
  if (!tempData) {
    return res.status(400).json({ error: 'Registration not initiated for this email.' });
  }

  const otp = generateOTP(); // Your OTP generator
  tempData.otp = otp;
  tempData.otpExpires = Date.now() + 5 * 60 * 1000;

  await sendOtpEmail(email, otp); // Your existing mail function

  res.json({ message: 'OTP resent successfully.' });
};

const completeRegistration = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required.' });
        }

        const tempData = tempUsers[email];
        if (!tempData) {
            return res.status(400).json({ error: 'No registration found or OTP expired.' });
        }

        if (otp !== tempData.otp || Date.now() > tempData.otpExpires) {
            return res.status(400).json({ error: 'Invalid or expired OTP.' });
        }

        const newUser = new User({
            name: tempData.name,
            email,
            password: tempData.hashedPassword,
            isEmailVerified: true
        });

        await newUser.save();
        delete tempUsers[email];

        const token = jwt.sign(
            { userId: newUser._id, username: newUser.name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'User registered and logged in successfully.',
            token,
            user: {
                id: newUser._id,
                username: newUser.name,
                email: newUser.email
            }
        });
    } catch (err) {
        console.error('completeRegistration Error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * Logs in a user by validating credentials and generating a JWT.
 */
// const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Validate required fields
//         if (!email || !password) {
//             return res.status(400).json({ error: 'Email and password are required.' });
//         }

//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ error: 'Invalid email or password.' });
//         }

//         // Check if email is verified
//         if (!user.isEmailVerified) {
//             return res.status(400).json({ error: 'Email is not verified. Please verify your email first.' });
//         }

//         // Validate password
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             return res.status(400).json({ error: 'Invalid email or password.' });
//         }

//         // Generate JWT
//         const token = jwt.sign(
//             { userId: user._id, email: user.email },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' }
//         );

//         // Respond with token and user data
//         res.status(200).json({
//             message: 'Login successful.',
//             token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//         });
//     } catch (err) {
//         console.error('Error in login:', err);
//         res.status(500).json({ error: 'Server error.' });
//     }
// };

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("📩 Received login request with:");
    console.log("Username:", username);
    console.log("Password:", password);

    if (!username || !password) {
      console.log("⚠️ Missing credentials.");
      return res.status(400).json({ status: false, error: 'Username and password are required.' });
    }

    const user = await User.findOne({ name: username });
    console.log("🔍 User found in DB:", user ? user.name : 'None');

    if (!user) {
      console.log("❌ User not found.");
      return res.status(400).json({ status: false, error: 'Invalid username or password.' });
    }

    if (!user.isEmailVerified) {
      console.log("⚠️ Email not verified.");
      return res.status(400).json({ status: false, error: 'Email is not verified. Please verify your email first.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("✅ Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ Password mismatch.");
      return res.status(400).json({ status: false, error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("🔑 JWT generated:", token);

    return res.status(200).json({
      status: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Error in login:', err);
    return res.status(500).json({ status: false, error: 'Server error.' });
  }
};


module.exports = {
    initiateRegistration,
    completeRegistration,
    login,
    resendOtp
};