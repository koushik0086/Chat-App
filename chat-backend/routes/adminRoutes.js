const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getStats,
} = require("../controllers/adminController");
const { verifyToken, requireRole } = require("../middleware/auth");

// All admin routes require login + admin role
router.use(verifyToken);
router.use(requireRole("admin"));

router.get("/users", getAllUsers);
router.get("/stats", getStats);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

module.exports = router;