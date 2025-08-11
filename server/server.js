const path = require('path'); // Must be first
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit'); // Added rate limiter

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
const searchRoutes = require('./routes/search'); // <-- Added search routes

// Middleware
const authMiddleware = require('./middleware/auth');

// Initialize app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// === SECURITY MIDDLEWARE SETUP - BEFORE OTHER MIDDLEWARES AND ROUTES ===

// Helmet helps secure your app by setting various HTTP headers
app.use(helmet());

// Rate limiter to limit repeated requests from same IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);

// === BODY PARSERS ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// === ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRouter);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/upload', uploadsRouter);
app.use('/api/user', userRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/search', searchRoutes); // <-- Use search routes

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Socket.IO events
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join user room for personal notifications
  socket.on('joinUserRoom', (userId) => {
    const roomName = `user_${userId}`;
    socket.join(roomName);
    console.log(`User socket ${socket.id} joined room: ${roomName}`);
  });

  // Listen for newNotification event and emit to specific user room
  socket.on('newNotification', (userId) => {
    const roomName = `user_${userId}`;
    io.to(roomName).emit('notification', 'New activity!');
  });

  // Direct Messaging (Socket.IO)
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

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received: closing server');
  await mongoose.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
