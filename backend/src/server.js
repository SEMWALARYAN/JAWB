require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const server = http.createServer(app);

// Socket.io for realtime features
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
