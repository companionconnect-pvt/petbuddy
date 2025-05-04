import { io } from 'socket.io-client';

// Create a socket connection
const socket = io('http://localhost:5001');  // URL of your server

// Export the socket instance so it can be used in other files
export { socket };
