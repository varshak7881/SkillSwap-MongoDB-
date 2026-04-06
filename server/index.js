const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// Store online users
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // User joins with their userId
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("✅ User online:", userId);
  });

  // Join a barter chat room
  socket.on("joinRoom", (barterRequestId) => {
    socket.join(barterRequestId);
    console.log("💬 Joined room:", barterRequestId);
  });

  // Send a real time message
  socket.on("sendMessage", (data) => {
    io.to(data.barterRequestId).emit("receiveMessage", data);
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(data.barterRequestId).emit("userTyping", data);
  });

  socket.on("disconnect", () => {
    // Remove from online users
    Object.keys(onlineUsers).forEach((userId) => {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    });
    console.log("❌ User disconnected:", socket.id);
  });
});

// Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Routes
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));
app.use("/api/barter",   require("./routes/barterRoutes"));
app.use("/api/reviews",  require("./routes/reviewRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// Health check
app.get("/api", (req, res) => {
  res.json({ message: "SkillBarter API is running 🚀" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));