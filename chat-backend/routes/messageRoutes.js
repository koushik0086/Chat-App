const express = require("express");
const router = express.Router();
const {
  getMessages,
  sendMessage,
  deleteMessage,
  uploadFile,
  getUnreadCount,
  markRoomAsRead,
} = require("../controllers/messageController");
const { verifyToken } = require("../middleware/auth");

// All message routes require login
router.use(verifyToken);

// ✅ Specific routes MUST come before /:roomId to avoid being matched as a roomId
router.get("/:roomId/unread-count", getUnreadCount);
router.post("/:roomId/mark-read", markRoomAsRead);
router.post("/:roomId/upload", uploadFile);

router.get("/:roomId", getMessages);
router.post("/:roomId", sendMessage);
router.delete("/:id", deleteMessage);

module.exports = router;
