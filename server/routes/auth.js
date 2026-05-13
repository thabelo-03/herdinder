const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'herdfinder_super_secret', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });

    // Check password
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token and send email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide an email address' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return 200 even if user not found for security (prevents email enumeration)
      return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    // (In a real app you might hash it before saving, but here we just save it directly for simplicity)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour

    await user.save();

    // Send email
    // NOTE: In production, configure this properly in .env
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or standard SMTP config
      auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password',
      },
    });

    // We will use a dummy link for now if the user hasn't configured it
    // Wait, the client handles it differently based on platform.
    const resetUrl = `http://localhost:8081/auth/reset-password?token=${resetToken}`;
    
    if (process.env.EMAIL_USER) {
      await transporter.sendMail({
        from: '"HerdFinder Support" <noreply@herdfinder.app>',
        to: user.email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please go to this link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      });
    } else {
      console.log('--- DEVELOPMENT MODE: EMAIL NOT SENT ---');
      console.log(`Password reset link: ${resetUrl}`);
    }

    res.status(200).json({ message: 'If that email is registered, a reset link has been sent.', devToken: resetToken });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'There was an error sending the email' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Missing token or new password' });
    }

    // Find user by token and ensure token hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Set new password (the pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

module.exports = router;
