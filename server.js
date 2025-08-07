const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Import your routes and cron jobs
const dynamicRoute = require("./routes/dynamicRoutes");
const autheRouter = require("./routes/userRoutes");
const currentRoute = require("./Auth/currentUserRoute");
require("./Controller/Cron");

// --- INITIALIZATION ---
dotenv.config();
const app = express();
const server = http.createServer(app);

// --- REVAMPED CORS CONFIGURATION ---
// Using a wildcard origin. WARNING: Less secure.
const corsOptions = {
  origin: "*",
  credentials: false, // MUST be false when origin is "*"
};

// --- SOCKET.IO INITIALIZATION ---
const io = new Server(server, {
  cors: {
    origin: "*", // Using wildcard here as well
    credentials: false,
  },
});

// Attach io to app for use in controllers
app.set("io", io);

// --- MIDDLEWARE SETUP ---
app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// --- DATABASE CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// --- API ROUTES ---
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api", dynamicRoute);
app.use("/api", autheRouter);
app.use("/api", currentRoute);

// --- SOCKET.IO EVENT HANDLERS ---
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (collection) => {
    console.log(`Client ${socket.id} joined room: ${collection}`);
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

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
