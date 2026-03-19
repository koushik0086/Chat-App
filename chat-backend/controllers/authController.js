const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper: generate JWT ──────────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// ─── Helper: send token response ──────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toPublicJSON(),
  });
};

// ─── @route  POST /api/auth/register ──────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/auth/login ─────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/auth/logout ────────────────────────
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date(),
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe };