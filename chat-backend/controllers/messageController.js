const Message = require("../models/Message");
const Room = require("../models/Room");

// ─── @route  GET /api/messages/:roomId ────────────────────
const getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const messages = await Message.find({ roomId, isDeleted: false })
      .populate("sender", "name avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ roomId, isDeleted: false });

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // oldest first
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/messages/:roomId ───────────────────
const sendMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { content, type } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const message = await Message.create({
      roomId,
      sender: req.user._id,
      content,
      type: type || "text",
      readBy: [req.user._id],
    });

    await message.populate("sender", "name avatar role");

    // Update room's lastMessage
    room.lastMessage = message._id;
    await room.save();

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// ─── @route  DELETE /api/messages/:id ─────────────────────
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender or admin can delete
    const isSender = message.sender.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isSender && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await message.softDelete();

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage, deleteMessage };