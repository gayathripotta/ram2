require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message'); // Ensure the Message model is defined

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes for your API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));

// Root route to handle "Cannot GET" error
app.get('/', (req, res) => {
  res.send('Welcome to the chat server!');
});

// WebSocket for messaging
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('message', async (data) => {
    const { sender, content } = data;
    try {
      const message = await Message.create({ sender, content });
      io.emit('message', message); // Broadcast message to all connected clients
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server and listen on a specific port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`));