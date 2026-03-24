const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Room = require("../models/Room");

module.exports = (io) => {
  // ─── Auth Middleware for Socket ───────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // ─── On Connection ────────────────────────────────────────
  io.on("connection", async (socket) => {
    console.log(`⚡ User connected: ${socket.user.name} (${socket.id})`);

    await User.findByIdAndUpdate(socket.user._id, {
      isOnline: true,
      lastSeen: new Date(),
    });

    socket.broadcast.emit("user-online", {
      userId: socket.user._id,
      name: socket.user.name,
      isOnline: true,
    });

    // ─── Join Room ──────────────────────────────────────────
    socket.on("join-room", async (roomId) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return socket.emit("error", { message: "Room not found" });

        socket.join(roomId);
        console.log(`🚪 ${socket.user.name} joined room: ${room.name}`);

        socket.to(roomId).emit("user-joined", {
          userId: socket.user._id,
          name: socket.user.name,
          roomId,
        });

        socket.emit("joined-room", { roomId, roomName: room.name });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // ─── Leave Room ─────────────────────────────────────────
    socket.on("leave-room", async (roomId) => {
      try {
        socket.leave(roomId);
        console.log(`🚶 ${socket.user.name} left room: ${roomId}`);

        socket.to(roomId).emit("user-left", {
          userId: socket.user._id,
          name: socket.user.name,
          roomId,
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // ─── Send Text Message ───────────────────────────────────
    socket.on("send-message", async (data) => {
      try {
        const { roomId, content, type } = data;

        if (!roomId || !content) {
          return socket.emit("error", { message: "roomId and content are required" });
        }

        const room = await Room.findById(roomId);
        if (!room) return socket.emit("error", { message: "Room not found" });

        const message = await Message.create({
          roomId,
          sender: socket.user._id,
          content,
          type: type || "text",
          readBy: [socket.user._id],
        });

        await message.populate("sender", "name avatar role");

        room.lastMessage = message._id;
        await room.save();

        // Broadcast to everyone in room including sender
        io.to(roomId).emit("new-message", message);

        console.log(`💬 Message in ${roomId} by ${socket.user.name}: ${content}`);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // ─── Broadcast File Message (already saved via REST API) ─
    // Called after a successful /upload API call so other users get it live
    socket.on("broadcast-file", async (data) => {
      try {
        const { roomId, messageId } = data;

        if (!roomId || !messageId) return;

        // Fetch the already-saved message from DB
        const message = await Message.findById(messageId).populate(
          "sender",
          "name avatar role"
        );

        if (!message) return;

        // Send to everyone ELSE in the room (sender already has it locally)
        socket.to(roomId).emit("new-message", message);

        console.log(`📎 File broadcast in ${roomId} by ${socket.user.name}: ${message.fileName}`);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // ─── Typing Start ────────────────────────────────────────
    socket.on("typing-start", (roomId) => {
      socket.to(roomId).emit("user-typing", {
        userId: socket.user._id,
        name: socket.user.name,
        roomId,
      });
    });

    // ─── Typing Stop ─────────────────────────────────────────
    socket.on("typing-stop", (roomId) => {
      socket.to(roomId).emit("user-stop-typing", {
        userId: socket.user._id,
        name: socket.user.name,
        roomId,
      });
    });

    // ─── Get Online Users ────────────────────────────────────
    socket.on("get-online-users", async () => {
      try {
        const onlineUsers = await User.find({ isOnline: true }).select(
          "name avatar isOnline lastSeen"
        );
        socket.emit("online-users", onlineUsers);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // ─── Delete Message ──────────────────────────────────────
    socket.on("delete-message", async (data) => {
      try {
        const { messageId, roomId } = data;

        const message = await Message.findById(messageId);
        if (!message) return socket.emit("error", { message: "Message not found" });

        const isSender = message.sender.toString() === socket.user._id.toString();
        const isAdmin = socket.user.role === "admin";

        if (!isSender && !isAdmin) {
          return socket.emit("error", { message: "Not authorized to delete this message" });
        }

        await message.softDelete();

        io.to(roomId).emit("message-deleted", { messageId, roomId });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // ─── Disconnect ──────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`❌ User disconnected: ${socket.user.name} (${socket.id})`);

      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: new Date(),
      });

      socket.broadcast.emit("user-offline", {
        userId: socket.user._id,
        name: socket.user.name,
        isOnline: false,
        lastSeen: new Date(),
      });
    });
  });
};
