const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dynamicRoute = require('./routes/dynamicRoutes');
const authRoute = require('./routes/userRoutes');
const currentRoute = require('./Auth/currentUserRoute');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path'); // Built-in Node.js module
// Load environment variables

dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app); // Create an HTTP server using Express
const io = socketIo(server); // Initialize Socket.IO with the HTTP server

app.use(cors()); // Allow all origins or configure as needed

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Simple GET route for '/'
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Use user routes
app.use('/api', dynamicRoute);
app.use('/api', authRoute);
app.use('/api', currentRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up Socket.IO events
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for custom events from clients (create, update for any model)
    socket.on('createModel', (modelName, data) => {
        console.log(`${modelName} created:`, data);
        // Broadcast to all clients that a model has been created
        io.emit(`${modelName}Created`, { message: `${modelName} created!`, data });
    });

    socket.on('updateModel', (modelName, data) => {
        console.log(`${modelName} updated:`, data);
        // Broadcast to all clients that a model has been updated
        io.emit(`${modelName}Updated`, { message: `${modelName} updated!`, data });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



