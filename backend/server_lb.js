const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Route Imports
const clinicRoutes = require("./routes/clinicAuth.js");
const petHouseAuth = require("./routes/pethouseAuth.js");
const authRoutes = require("./routes/authRoutes.js");
const driverRoutes = require("./routes/driverRoutes.js");
const userRoutes = require("./routes/userRoutes");
const petRoutes = require("./routes/petRoutes");
const chatRoutes = require("./routes/chatRoutes.js");
const chatBotRoutes = require("./routes/chatbotRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
const consultationRoutes = require("./routes/consultationRoutes.js");
const setupVideoCall = require("./socket/videoCall");

// Determine the server role based on environment variable
// Set SERVER_ROLE=api for API servers
// Set SERVER_ROLE=realtime for the Realtime server
const serverRole = process.env.SERVER_ROLE || "api"; // Default to api if not set

// Initialize app
const app = express();
const server = http.createServer(app);

let io = null; // Initialize Socket.IO only if it's the realtime server

if (serverRole === "realtime") {
  io = new Server(server, {
    cors: {
      origin: "*", // Update to restrict in production
      methods: ["GET", "POST"],
    },
    // Specify the path for Socket.IO if needed, default is /socket.io/
    // path: '/realtime/'
  });
  console.log("✨ Running as Realtime Server");
} else {
  console.log("✨ Running as API Server");
}

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - Only enable on API servers
if (serverRole === "api") {
  console.log("📦 Enabling API Routes");
  app.use("/api/petclinic", clinicRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/pethouse", petHouseAuth);
  app.use("/api/driver", driverRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/pet", petRoutes);
  app.use("/api/booking", bookingRoutes);
  app.use("/api/chat", chatRoutes); // Chat API routes (like fetching history) can stay on API server
  app.use("/api/chatbot", chatBotRoutes);
  app.use("/api/consultation", consultationRoutes);
}

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Use different ports or manage ports externally
    const port = process.env.PORT || 5000; // Use environment variable for port
    server.listen(port, () =>
      console.log(`🚀 Server (${serverRole}) running on port ${port}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Socket.IO Logic - Only enable on the Realtime server
if (serverRole === "realtime" && io) {
  console.log("💬 Enabling Socket.IO Logic");
  io.on("connection", (socket) => {
    console.log("✅ A user connected");

    socket.on("joinRoom", (ticketId) => {
      socket.join(ticketId);
      console.log(`Socket ${socket.id} joined room ${ticketId}`);
    });

    socket.on(
      "sendMessage",
      ({ ticketId, senderId, senderName, encryptedMessage }) => {
        const chatMessage = {
          ticketId,
          senderId,
          senderName,
          encryptedMessage,
          timestamp: new Date(),
        };

        console.log(`Message received for ticket ${ticketId}`);
        // Broadcast to all users in the ticket room
        io.to(ticketId).emit("receiveMessage", chatMessage);
      }
    );

    socket.on("locationUpdate", (location) => {
      console.log("📍 Location update received:", location);
      // Broadcast location to all other clients (except sender) in the same room if applicable,
      // or globally if location updates are for all drivers/users. Adjust logic as needed.
      socket.broadcast.emit("driverLocation", location); // This broadcasts to all connected sockets except the sender
    });

    socket.on("disconnect", () => {
      console.log("❎ A user disconnected");
    });
  });

  // Socket.IO: Video Call - Only setup on the Realtime server
  setupVideoCall(io);
  console.log("📹 Setting up Video Call logic");
} else if (serverRole === "api") {
  console.log("🚫 Socket.IO Logic Disabled on API Server");
}

// Note: Standard API routes (like fetching chat history) should remain on the API servers.
// Realtime events (sending/receiving messages, video signals) go through the Socket.IO server.
