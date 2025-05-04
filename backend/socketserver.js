const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Apply CORS middleware to allow the frontend to make requests
app.use(cors({
  origin: 'http://localhost:5174',  // Allow only this origin (frontend URL)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Initialize Socket.io on the same HTTP server
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5174",  // Allow the frontend origin for Socket.io
    methods: ["GET", "POST"]
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New socket.io connection');

  // Listen for location updates from the driver
  socket.on('locationUpdate', (location) => {
    console.log('Location update:', location);
    // Broadcast the location to all other connected clients (except the sender)
    socket.broadcast.emit('driverLocation', location);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
});

// Start the server (API and WebSocket server both on port 5001)
server.listen(5001, () => {
  console.log('Server running on http://localhost:5001');
});
