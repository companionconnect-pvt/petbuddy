// videoCall.js
const readyUsers = new Map(); // roomId → Set<socket.id>

module.exports = function setupVideoCall(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a room
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Mark this socket as ready; once 2 are ready, pick one initiator
    socket.on("ready", (roomId) => {
      if (!readyUsers.has(roomId)) {
        readyUsers.set(roomId, new Set());
      }
      const users = readyUsers.get(roomId);
      users.add(socket.id);

      // When exactly two users are ready, choose the first as initiator
      if (users.size === 2) {
        const [initiator] = users;
        io.to(initiator).emit("start-call");
        console.log(`start-call → initiator ${initiator} in room ${roomId}`);
      }
    });

    // Relay offer → everyone else
    socket.on("offer", (data) => {
      console.log(`Offer from ${socket.id} → room ${data.roomId}`);
      socket.to(data.roomId).emit("offer", data);
    });

    // Relay answer → everyone else
    socket.on("answer", (data) => {
      console.log(`Answer from ${socket.id} → room ${data.roomId}`);
      socket.to(data.roomId).emit("answer", data);
    });

    // Relay ICE candidates → everyone else
    socket.on("ice-candidate", (data) => {
      console.log(`ICE from ${socket.id} → room ${data.roomId}`);
      socket.to(data.roomId).emit("ice-candidate", data);
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // Remove from readyUsers
      for (const [roomId, users] of readyUsers) {
        if (users.delete(socket.id) && users.size === 0) {
          readyUsers.delete(roomId);
        }
      }

      // Inform peers in any rooms this socket was in
      socket.rooms.forEach((roomId) => {
        socket.to(roomId).emit("user-left", socket.id);
      });
    });
  });
};
