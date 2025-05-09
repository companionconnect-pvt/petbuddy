const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const NodeCache = require('node-cache')
const myCache = new NodeCache()

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
    origin: "*", 
    methods: ["GET", "POST"],
  },
});



const cacheAllRoutes = (req, res, next) => {
   
    const userId = req.user?._id;
    const cacheKeyPrefix = userId ? `cache::${userId}::` : 'cache::public::';

    
    const key = cacheKeyPrefix + req.originalUrl + '::' + req.method;

    console.log(`[Cache Middleware] Request received for: ${req.originalUrl} with method: ${req.method}. Cache Key: ${key}`);

   
    if (req.method === 'GET') {
        const cachedData = myCache.get(key);

        if (cachedData) {
            console.log(`[Cache Middleware] Cache hit for key: ${key}`);
            
            try {
                
                const originalSend = res.send;
                res.send = originalSend; // Restore
                res.send(cachedData);
            } catch (sendError) {
                console.error(`[Cache Middleware] Error sending cached data for key ${key}:`, sendError);
                
                next();
            }
            return; 
        } else {
            console.log(`[Cache Middleware] Cache miss for key: ${key}. Proceeding to route handler.`);
            
            const originalSend = res.send;
            res.send = function (body) {
                console.log(`[Cache Middleware] Intercepting res.send for key: ${key}. Caching data.`);
               
                try {
                    
                    myCache.set(key, body);
                    console.log(`[Cache Middleware] Data cached successfully for key: ${key}`);
                } catch (cacheError) {
                    console.error(`[Cache Middleware] Error caching data for key ${key}:`, cacheError);
                   
                } finally {
                     
                     res.send = originalSend;
                     originalSend.call(this, body);
                }
            };
            next(); 
        }
    } else {
        
        console.log(`[Cache Middleware] Bypassing cache for non-GET method: ${req.method}`);
        
        next(); 
    }
};


app.use(cacheAllRoutes);


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

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log("✅ A user connected");

  // Chat: Join a ticket room
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
    io.to(ticketId).emit("receiveMessage", chatMessage);
  });

  // Location: Join booking room
  socket.on("joinBookingRoom", (bookingId) => {
    socket.join(bookingId);
    console.log(`📦 Joined booking room: ${bookingId}`);
  });

  // Location: Broadcast driver's location only to users in the booking room
  socket.on("locationUpdate", ({ bookingId, lat, lng }) => {
    if (bookingId && lat && lng) {
      console.log(`📍 Location update for booking ${bookingId}:`, lat, lng);
      io.to(bookingId).emit("locationUpdate", { bookingId, lat, lng });
    }
  });

  // Leave room (optional cleanup)
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`🚪 Left room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("❎ A user disconnected");
  });
});

// Socket.IO: Video Call Logic
setupVideoCall(io);

