const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Room name must be at least 2 characters"],
      maxlength: [50, "Room name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Auto-add creator to members on creation ──────────────
roomSchema.pre("save", function (next) {
  if (this.isNew) {
    const alreadyMember = this.members.some(
      (id) => id.toString() === this.createdBy.toString()
    );
    if (!alreadyMember) {
      this.members.push(this.createdBy);
    }
  }
  next();
});

module.exports = mongoose.model("Room", roomSchema);