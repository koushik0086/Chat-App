const User = require("../models/User");
const Room = require("../models/Room");
const Message = require("../models/Message");

// ─── @route  GET /api/admin/users ─────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// ─── @route  PATCH /api/admin/users/:id/role ──────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be user or admin" });
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── @route  DELETE /api/admin/users/:id ──────────────────
const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ─── @route  GET /api/admin/stats ─────────────────────────
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalRooms, totalMessages, onlineUsers] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments(),
      Message.countDocuments({ isDeleted: false }),
      User.countDocuments({ isOnline: true }),
    ]);

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalRooms, totalMessages, onlineUsers },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser, getStats };