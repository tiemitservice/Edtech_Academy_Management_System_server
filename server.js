const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// --- FIX: Correctly import the cors library ---
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

// --- CORS CONFIGURATION ---
// It's good practice to define your CORS options in a variable
const corsOptions = {
  origin: [
    // "http://localhost:5173",
    "http://188.166.242.109",
  ],
  credentials: true,
};

// --- SOCKET.IO INITIALIZATION ---
const io = new Server(server, {
  cors: corsOptions, // Reuse the same CORS options
});

// Attach io to app for use in controllers
app.set("io", io);

// --- MIDDLEWARE SETUP ---
// **IMPORTANT**: The order of middleware is critical.

// 1. CORS Middleware - This should come first!
// This allows your server to accept cross-origin requests.
app.use(cors(corsOptions));

// 2. Body Parsers
// These parse incoming request bodies.
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// 3. Static File Serving
// This serves files from your 'Uploads' directory.
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// --- DATABASE CONNECTION ---
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log("MongoDB connection error:", err));
mongoose.connect(process.env.MONGO_URI);

// --- API ROUTES ---
// All your API routes should be defined after the core middleware.
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
