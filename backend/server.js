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

// Initialize app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update to restrict in production
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/petclinic", clinicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pethouse", petHouseAuth);
app.use("/api/driver", driverRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pet", petRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chatbot", chatBotRoutes);
app.use("/api/consultation", consultationRoutes);

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Socket.IO Chat Logic
io.on("connection", (socket) => {
  console.log("✅ A user connected");

  socket.on("joinRoom", (ticketId) => {
    socket.join(ticketId);
  });

  socket.on("sendMessage", ({ ticketId, senderId, senderName, encryptedMessage }) => {
    const chatMessage = {
      ticketId,
      senderId,
      senderName,
      encryptedMessage,
      timestamp: new Date(),
    };

    // Broadcast to all users in the ticket room
    io.to(ticketId).emit("receiveMessage", chatMessage);
  });
  socket.on("locationUpdate", (location) => {
    console.log("📍 Location update received:", location);

    // Broadcast location to all other clients (except sender)
    socket.broadcast.emit("driverLocation", location);
  });

  socket.on("disconnect", () => {
    console.log("❎ A user disconnected");
  });
});

// Socket.IO: Video Call
setupVideoCall(io);
