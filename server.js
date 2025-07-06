const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dynamicRoute = require("./routes/dynamicRoutes");
const autheRouter = require("./routes/userRoutes");
const currentRoute = require("./Auth/currentUserRoute");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("./Controller/Cron");

// Initialize express app
dotenv.config();
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    // origin: "https://edtech-academy-management-system-cl.vercel.app/",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
// Attach io to app for use in controllers
app.set("io", io);
app.use(
  cors({
    origin: "http://localhost:5173",
    // origin: "https://edtech-academy-management-system-cl.vercel.app/",

    credentials: true,
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/api", dynamicRoute);
app.use("/api", autheRouter);
app.use("/api", currentRoute);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (collection) => {
    console.log(`Client joined room: ${collection}`);
    socket.join(collection);
  });

  socket.on("send-message", (message) => {
    console.log("Message received:", message);
    io.emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
