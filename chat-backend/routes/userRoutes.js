const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");

// ─── GET /api/users ───────────────────────────────────────
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const users = await User.find()
      .select("_id name avatar role isOnline lastSeen")
      .sort({ isOnline: -1, name: 1 }); // online users first

    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;