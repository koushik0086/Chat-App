const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const validateEnv = require("./config/validateEnv");

validateEnv();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

// ─── Middleware ────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/rooms",    require("./routes/roomRoutes"));
// app.use("/api/messages", require("./routes/messageRoutes"));
// app.use("/api/admin",    require("./routes/adminRoutes"));

// ─── Health check ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Chat API is running 🚀" });
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// ─── Socket.IO (Step 6) ───────────────────────────────────
// require("./socket")(io);

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});