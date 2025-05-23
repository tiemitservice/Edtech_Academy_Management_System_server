// client.js
const { io } = require("socket.io-client");
const API_URL = "http://localhost:5000"; // Match backend URL
const socket = io(API_URL, {
  autoConnect: false, // Connect manually in onMounted
  transports: ["websocket"], // Ensure WebSocket transport
  cors: {
    origin: "http://localhost:5173", // Match your Vue.js frontend
  },
});

export default socket;
