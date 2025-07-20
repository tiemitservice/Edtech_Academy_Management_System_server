const { Server } = require("socket.io");

const io = new Server(5000, {
  cors: {
    origin: [
      // "http://localhost:5173",
      "http://188.166.242.109", // your deployed IP frontend
      // "https://edtech-academy-management-system-cl.vercel.app", // your Vercel frontend
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
