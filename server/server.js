const path = require('path'); // Must be first
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import route files
const authRoutes = require('./routes/auth');
const usersRouter = require('./routes/auth/users');
const postRoutes = require('./routes/social/posts');
const storyRoutes = require('./routes/social/stories');
const uploadsRouter = require('./routes/uploads');
const userRoutes = require('./routes/user');
const commentsRoutes = require('./routes/comments');
const searchRoutes = require('./routes/search');

// Middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler'); // Enhanced error handler

// Initialize app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// === SECURITY MIDDLEWARE SETUP ===
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// === BODY PARSERS ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS with production-ready settings
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// === ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRouter);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/upload', uploadsRouter);
app.use('/api/user', userRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/search', searchRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Test protected route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Protected data',
    userId: req.user._id,
  });
});

// Handle 404 for unknown API routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to MongoDB with enhanced options
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1); // Exit if DB connection fails
  });

// Socket.IO events
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('joinUserRoom', (userId) => {
    const roomName = `user_${userId}`;
    socket.join(roomName);
    console.log(`User socket ${socket.id} joined room: ${roomName}`);
  });

  socket.on('newNotification', (userId) => {
    const roomName = `user_${userId}`;
    io.to(roomName).emit('notification', 'New activity!');
  });

  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    const roomName = `user_${receiverId}`;
    io.to(roomName).emit('newMessage', { senderId, text });
  });

  socket.on('story:view', ({ storyId, userId }) => {
    console.log(`👁️ Story viewed: ${storyId} by user ${userId}`);
    // TODO: Update DB if needed
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

// Use enhanced error handler (must be after all routes)
app.use(errorHandler);

// Graceful shutdown
const shutdown = async () => {
  console.log('🛑 Received shutdown signal: closing server');
  try {
    await mongoose.disconnect();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});