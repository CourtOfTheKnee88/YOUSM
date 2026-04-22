const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const { dbPath, insertMessage } = require('./db');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const messagesRouter = require('./routes/messages');
const threadsRouter = require('./routes/threads');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/messages', messagesRouter);
app.use('/threads', threadsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server running',
    dbPath,
    time: new Date().toISOString()
  });
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_thread', (threadId) => {
    socket.join(threadId);
    console.log(`User ${socket.id} joined thread room: ${threadId}`);
  });

  socket.on('send_message', (data) => {
    try {
      const savedMessage = insertMessage(data.threadId, data.senderId, data.content);
      io.to(data.threadId).emit('receive_message', savedMessage);
    } catch (error) {
      console.error('❌ Socket Error (send_message):', error.message);
    }
  });

  socket.on('new_post', (post) => {
    io.emit('post_created', post);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global Error Handler
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : error.message,
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 YOUSM backend listening on http://${HOST}:${PORT}`);
});