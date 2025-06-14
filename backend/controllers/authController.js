const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("[REGISTER] Attempting to register:", email);
    if (!email || !password) {
      console.log("[REGISTER] Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("[REGISTER] User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    console.log("[REGISTER] User created:", user.email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("[REGISTER] Error:", err);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("[LOGIN] Attempting login:", email);
    if (!email || !password) {
      console.log("[LOGIN] Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.log("[LOGIN] User not found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("[LOGIN] Invalid password for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("[LOGIN] Login successful:", email);
    res.json({ token });
  } catch (err) {
    console.error("[LOGIN] Error:", err);
    next(err);
  }
};

const profile = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

// List all users (for sharing dropdown)
const listUsers = async (req, res, next) => {
  try {
    // Exclude the current user from the list
    const users = await User.find({ _id: { $ne: req.user.id } }, 'username email _id');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, profile, listUsers }; 