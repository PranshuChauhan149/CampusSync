import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDb from "./config/DB.js";
import userRoutes from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// ---------------- MIDDLEWARE ----------------
const defaultClientOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://campus-sync-mu.vercel.app",
];

const envOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultClientOrigins;

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ---------------- ROUTES ----------------
app.get("/", (req, res) => {
  res.send("CampusSync Server is running...");
});

app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

// ---------------- SOCKET.IO ----------------
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSockets = new Map(); // Track user-socket mapping

io.on("connection", (socket) => {
  console.log("\n🔌 ============================================");
  console.log("✅ User connected:", socket.id);

  // User joins their room for chat
  socket.on("join", (userId) => {
    socket.join(userId);
    userSockets.set(userId, socket.id);
    console.log(`👤 User ${userId} joined room for chat`);
    console.log(`   Socket ID: ${socket.id}`);
    
    // Emit user online status
    io.emit("user-online", { userId });
    console.log(`📡 Broadcasting user online: ${userId}`);
  });

  // User joins a conversation
  socket.on("join-conversation", (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    console.log(`💬 User joined conversation room: conversation-${conversationId}`);
    console.log(`   Socket rooms:`, socket.rooms);
  });

  // Leave conversation
  socket.on("leave-conversation", (conversationId) => {
    socket.leave(`conversation-${conversationId}`);
    console.log(`🚪 User left conversation: conversation-${conversationId}`);
  });

  // Send message (broadcast to conversation)
  socket.on("send-message", (data) => {
    const { conversationId, message } = data;
    console.log(`\n📨 MESSAGE RECEIVED on Socket`);
    console.log(`   Conversation: ${conversationId}`);
    console.log(`   From: ${message.sender.username}`);
    console.log(`   Content: ${message.content.substring(0, 50)}...`);
    console.log(`   Broadcasting to room: conversation-${conversationId}`);
    
    io.to(`conversation-${conversationId}`).emit("receive-message", {
      conversationId,
      message,
    });
    console.log(`✅ Message broadcasted`);
  });

  // Typing indicator
  socket.on("user-typing", (data) => {
    const { conversationId, userId, username } = data;
    console.log(`⌨️  ${username} is typing in conversation: ${conversationId}`);
    io.to(`conversation-${conversationId}`).emit("user-typing", {
      userId,
      username,
    });
  });

  // Stop typing
  socket.on("user-stop-typing", (data) => {
    const { conversationId, userId } = data;
    console.log(`⏸️  User ${userId} stopped typing in conversation: ${conversationId}`);
    io.to(`conversation-${conversationId}`).emit("user-stop-typing", {
      userId,
    });
  });

  // Message read notification
  socket.on("message-read", (data) => {
    const { conversationId, readBy } = data;
    console.log(`👁️  Messages marked as read in conversation: ${conversationId}`);
    io.to(`conversation-${conversationId}`).emit("message-read", {
      readBy,
    });
  });

  // User disconnects
  socket.on("disconnect", () => {
    // Find and remove user from map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`\n👋 User ${userId} disconnected`);
        console.log(`   Socket ID: ${socket.id}`);
        io.emit("user-offline", { userId });
        console.log(`📡 Broadcasting user offline: ${userId}`);
        console.log("============================================\n");
        break;
      }
    }
  });
});

app.set("io", io);

// Export userSockets for access in controllers if needed
app.set("userSockets", userSockets);

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  connectDb();
  console.log(`CampusSync server is running on port ${PORT}`);
});
