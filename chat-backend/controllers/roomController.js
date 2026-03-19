const Room = require("../models/Room");
const Message = require("../models/Message");

// ─── @route  GET /api/rooms ───────────────────────────────
const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate("createdBy", "name avatar")
      .populate("members", "name avatar isOnline")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, rooms });
  } catch (error) {
    next(error);
  }
};

// ─── @route  GET /api/rooms/:id ───────────────────────────
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("createdBy", "name avatar")
      .populate("members", "name avatar isOnline");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/rooms ──────────────────────────────
const createRoom = async (req, res, next) => {
  try {
    const { name, description, isPrivate } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: "Room name already taken" });
    }

    const room = await Room.create({
      name,
      description,
      isPrivate: isPrivate || false,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    await room.populate("createdBy", "name avatar");

    res.status(201).json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/rooms/:id/join ─────────────────────
const joinRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const alreadyMember = room.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "Already a member of this room" });
    }

    room.members.push(req.user._id);
    await room.save();

    await room.populate("members", "name avatar isOnline");

    res.status(200).json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/rooms/:id/leave ────────────────────
const leaveRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.members = room.members.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );

    await room.save();

    res.status(200).json({ success: true, message: "Left room successfully" });
  } catch (error) {
    next(error);
  }
};

// ─── @route  DELETE /api/rooms/:id ────────────────────────
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Delete all messages in the room too
    await Message.deleteMany({ roomId: req.params.id });
    await room.deleteOne();

    res.status(200).json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRooms, getRoomById, createRoom, joinRoom, leaveRoom, deleteRoom };