// server/server.js
const path = require('path'); // Must be first
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// === ROUTES ===
const authRoutes = require('./routes/auth');
const usersRouter = require('./routes/auth/users');
const passwordResetRoutes = require('./routes/auth/passwordReset');
const socialRoutes = require('./routes/social');
const uploadsRouter = require('./routes/uploads');
const userRoutes = require('./routes/user');
const commentsRoutes = require('./routes/comments');
const searchRoutes = require('./routes/search');
const chatRoutes = require('./routes/chat');
const messageRoutes = require('./routes/messages');
const settingsRoutes = require('./routes/settings');
const reactionRoutes = require('./routes/social/reactions');
const commentRoutes = require('./routes/social/comments');
const shareRoutes = require('./routes/social/shares');
const reactionsRoutes = require('./routes/reactions');

// ✅ NEW ROUTES
const storyRoutes = require('./routes/social/stories');
const callRoutes = require('./routes/calls');
const adminRoutes = require('./routes/admin');

// Middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Initialize express + HTTP server
const app = express();
const server = http.createServer(app);

// === SECURITY MIDDLEWARE ===
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// === BODY PARSERS ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === CORS ===
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// === TEST ENDPOINT ===
app.get('/test', (req, res) => {
  res.json({ message: 'Server is live!' });
});

// === HEALTH CHECK ENDPOINT ===
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// === API ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/users', usersRouter);
app.use('/api/social', socialRoutes);
app.use('/api/upload', uploadsRouter);
app.use('/api/user', userRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/social/reactions', reactionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api', reactionsRoutes);

// ✅ New API routes
app.use('/api/stories', storyRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/admin', adminRoutes);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Example protected route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Protected data',
    userId: req.user._id,
  });
});

// Handle 404 properly
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// === MONGODB CONNECTION ===
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// === PEERJS SERVER ===
const peerServer = require('./utils/peerServer');
peerServer(server);
console.log('⚡ PeerJS server running on port 9000');

// === SOCKET.IO (using centralized handler) ===
const { initSocket } = require('./utils/socketHandler');
initSocket(server);

// === SERVE CLIENT IN PRODUCTION ===
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

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

// === START SERVER ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
