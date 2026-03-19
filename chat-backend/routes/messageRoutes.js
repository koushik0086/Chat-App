const express = require("express");
const router = express.Router();
const {
  getMessages,
  sendMessage,
  deleteMessage,
} = require("../controllers/messageController");
const { verifyToken } = require("../middleware/auth");

// All message routes require login
router.use(verifyToken);

router.get("/:roomId", getMessages);
router.post("/:roomId", sendMessage);
router.delete("/:id", deleteMessage);

module.exports = router;