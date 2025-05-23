const Server = require("socket.io");

const io = new Server(5000, {
  cors: {
    origin: "*", // You can restrict this in production
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
