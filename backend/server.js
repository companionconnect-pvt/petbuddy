const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const clinicRoutes = require("./routes/clinicAuth.js");
const petHouseAuth = require("./routes/pethouseAuth.js");
const authRoutes = require("./routes/authRoutes.js");
const driverRoutes = require("./routes/driverRoutes.js");
const userRoutes = require("./routes/userRoutes");
const petRoutes = require("./routes/petRoutes");
const setupVideoCall = require("./socket/videoCall"); // Import video call logic
const chatRoutes = require("./routes/chatRoutes.js");
const chatBotRoutes = require("./routes/chatbotRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
const consultationRoutes = require("./routes/consultationRoutes.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update in production
    methods: ["GET", "POST"],
  },
});

// Middleware setup
app.use(cors()); // Enable all CORS requests or customize based on your needs
app.use(express.json()); // Parse incoming JSON requests

// Routes setup
app.use("/api/petclinic", clinicRoutes);
app.use("/api/auth", authRoutes); // General user authentication routes
app.use("/api/pethouse", petHouseAuth); // Pet house specific authentication routes
app.use("/api/driver", driverRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pet", petRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/chat", chatRoutes); // Chat route
app.use("/api/chatbot", chatBotRoutes);
app.use("/api/consultation", consultationRoutes);
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit the process if the connection fails
  });

// Chat Logic (Socket.IO)
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (ticketId) => {
    socket.join(ticketId);
  });

  socket.on("sendMessage", ({ ticketId, senderId, senderName, message }) => {
    const chatMessage = {
      ticketId,
      senderId,
      senderName,
      message,
      timestamp: new Date(),
    };

    // Emit message to all users in the room
    io.to(ticketId).emit("receiveMessage", chatMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Setup video call logic
setupVideoCall(io);
