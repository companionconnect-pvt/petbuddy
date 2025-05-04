const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

// Import routes
const clinicRoutes = require("./routes/clinicAuth");
const petHouseAuth = require("./routes/pethouseAuth.js");
const authRoutes = require("./routes/authRoutes.js");
const driverRoutes = require("./routes/driverRoutes.js");
const userRoutes = require("./routes/userRoutes");
const petRoutes = require("./routes/petRoutes");
const setupVideoCall = require("./socket/videoCall");  // Import video call logic
const chatRoutes = require("./routes/chatRoutes.js");
const chatBotRoutes  = require("./routes/chatbotRoutes.js");

// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update in production
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(cors()); // Allow requests from all origins during development

// Routes
app.use("/api/petclinic", clinicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pethouse", petHouseAuth);
app.use("/api/driver", driverRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pet", petRoutes);
app.use("/api/chat", chatRoutes); // Chat route
app.use("/api/chatbot", chatBotRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Start the server once MongoDB is connected
    server.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit on failure
  });

// Chat Logic (Socket.IO)
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (ticketId) => {
    socket.join(ticketId);
  });

  socket.on("sendMessage", ({ ticketId, senderId, senderName, message }) => {
    const chatMessage = { ticketId, senderId, senderName, message, timestamp: new Date() };
    
    // Emit message to all users in the room
    io.to(ticketId).emit("receiveMessage", chatMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Setup video call logic
setupVideoCall(io);

