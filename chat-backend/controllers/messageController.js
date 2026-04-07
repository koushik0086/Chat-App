const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Message = require("../models/Message");
const Room = require("../models/Room");

// ─── Multer Storage Config ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    // Create uploads folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // e.g. 1714000000000-originalname.png
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// Export multer middleware to use in routes
const uploadMiddleware = upload.single("file");

// ─── @route  POST /api/messages/:roomId/upload ────────────
const uploadFile = (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { roomId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Detect type: image or file
      const isImage = req.file.mimetype.startsWith("image/");
      const type = isImage ? "image" : "file";

      // Public URL to access the file
      // Use BACKEND_URL env var so it works correctly on Render/cloud
      const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

      const message = await Message.create({
        roomId,
        sender: req.user._id,
        content: req.file.originalname, // fallback content = filename
        type,
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
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
  });
};

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
      messages: messages.reverse(),
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

module.exports = { getMessages, sendMessage, deleteMessage, uploadFile };
