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

// --- DYNAMIC CORS CONFIGURATION ---
const allowedOrigins = [
  "http://188.166.242.109", // Production frontend
  "http://localhost:5173", // Local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// --- SOCKET.IO INITIALIZATION ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
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
  res.send("Hello World from your server!");
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
