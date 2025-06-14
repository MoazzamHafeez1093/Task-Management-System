const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { listUsers } = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const trimmedEmail = email ? email.trim().toLowerCase() : '';
    const trimmedUsername = username ? username.trim().toLowerCase() : '';
    const trimmedPassword = password ? password.trim() : '';
    console.log('Register request received:', { username: trimmedUsername, email: trimmedEmail, password: trimmedPassword ? '***' : '' });

    // Validate input
    if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
      console.log('Missing fields:', { username: !!trimmedUsername, email: !!trimmedEmail, password: !!trimmedPassword });
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ 
      $or: [{ email: trimmedEmail }, { username: trimmedUsername }] 
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return res.status(400).json({ 
        message: existingUser.email === trimmedEmail 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username: trimmedUsername,
      email: trimmedEmail,
      password: trimmedPassword
    });

    console.log('[REGISTER] Trimmed password before hashing:', trimmedPassword);
    // Save user (hashing happens in pre-save hook)
    await user.save();
    console.log('[REGISTER] Hashed password saved:', user.password);
    console.log('User created successfully:', user.email);

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token generated successfully');

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: Object.values(err.errors).map(val => val.message).join(', ')
      });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email ? email.trim().toLowerCase() : '';
    const trimmedPassword = password ? password.trim() : '';
    console.log('Login request received:', { email: trimmedEmail, password: trimmedPassword ? '***' : '' });

    // Validate input
    if (!trimmedEmail || !trimmedPassword) {
      console.log('Missing fields:', { email: !!trimmedEmail, password: !!trimmedPassword });
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for existing user
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      console.log('User not found:', trimmedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    console.log('[LOGIN] Trimmed password to compare:', trimmedPassword);
    console.log('[LOGIN] Hashed password in DB:', user.password);
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!isMatch) {
      console.log('Invalid password for user:', trimmedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', user.email);
    console.log('Token generated successfully');

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    console.log('Get user request received for ID:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user.email);
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List all users (for sharing dropdown)
router.get('/users', auth, listUsers);

module.exports = router; 