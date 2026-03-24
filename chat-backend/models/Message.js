const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room ID is required"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    // ─── File fields ───────────────────────────────────────
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    // ──────────────────────────────────────────────────────
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for fast room message queries ──────────────────
messageSchema.index({ roomId: 1, createdAt: -1 });

// ─── Soft delete method ───────────────────────────────────
messageSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.content = "This message was deleted";
  this.deletedAt = new Date();
  await this.save();
};

module.exports = mongoose.model("Message", messageSchema);
