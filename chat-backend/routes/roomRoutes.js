const express = require("express");
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
  getOrCreatePrivateRoom,
} = require("../controllers/roomController");
const { verifyToken, requireRole } = require("../middleware/auth");

// All room routes require login
router.use(verifyToken);

router.get("/", getRooms);
router.get("/:id", getRoomById);
router.post("/", createRoom);
router.post("/:id/join", joinRoom);
router.post("/:id/leave", leaveRoom);
router.delete("/:id", requireRole("admin"), deleteRoom);

// ─── Direct Message Route ─────────────────────────────────
router.post("/private/:userId", getOrCreatePrivateRoom);

module.exports = router;