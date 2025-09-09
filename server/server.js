// server/server.js

// === CLEAR MODULE CACHE TO PREVENT CORRUPTED MODULES IN PRODUCTION ===
if (process.env.NODE_ENV === 'production') {
  // Clear require cache for critical modules
  const criticalModules = ['express', 'mongoose', 'cors', 'helmet'];
  criticalModules.forEach((moduleName) => {
    try {
      const modulePath = require.resolve(moduleName);
      delete require.cache[modulePath];
    } catch (err) {
      console.warn(`⚠️ Could not clear cache for module ${moduleName}:`, err.message);
    }
  });
}

// === IMPORT MODULES ===
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize Express + HTTP server
const app = express();
const server = http.createServer(app);

// === SECURITY MIDDLEWARE ===
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
  })
);

// === BODY PARSERS ===
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// === CORS ===
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

// === TEST ENDPOINT ===
app.get('/test', (req, res) => {
  res.json({ message: 'Server is live!' });
});

// === HEALTH CHECK ===
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// === IMPORT ROUTES SAFELY ===
let authRoutes, socialRoutes, uploadsRouter, userRoutes, commentsRoutes;
let searchRoutes, chatRoutes, messageRoutes, settingsRoutes, reactionsRoutes;
let callRoutes, adminRoutes;

try {
  // Main route imports (these use index.js files)
  authRoutes = require('./routes/auth'); // Uses routes/auth/index.js
  socialRoutes = require('./routes/social'); // Uses routes/social/index.js
  
  // Individual route imports
  uploadsRouter = require('./routes/uploads');
  userRoutes = require('./routes/user');
  commentsRoutes = require('./routes/comments');
  searchRoutes = require('./routes/search');
  chatRoutes = require('./routes/chat');
  messageRoutes = require('./routes/messages');
  settingsRoutes = require('./routes/settings');
  reactionsRoutes = require('./routes/reactions');
  callRoutes = require('./routes/calls');
  adminRoutes = require('./routes/admin');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// === USE ROUTES ===
if (authRoutes) app.use('/api/auth', authRoutes); // Handles ALL auth routes
if (socialRoutes) app.use('/api/social', socialRoutes); // Handles ALL social routes
if (uploadsRouter) app.use('/api/upload', uploadsRouter);
if (userRoutes) app.use('/api/user', userRoutes);
if (commentsRoutes) app.use('/api/comments', commentsRoutes);
if (searchRoutes) app.use('/api/search', searchRoutes);
if (chatRoutes) app.use('/api/chat', chatRoutes);
if (messageRoutes) app.use('/api/messages', messageRoutes);
if (settingsRoutes) app.use('/api/settings', settingsRoutes);
if (reactionsRoutes) app.use('/api', reactionsRoutes);
if (callRoutes) app.use('/api/calls', callRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === IMPORT MIDDLEWARE SAFELY ===
let authMiddleware, errorHandler;
try {
  authMiddleware = require('./middleware/auth');
  errorHandler = require('./middleware/errorHandler');
} catch (error) {
  console.error('❌ Error loading middleware:', error.message);
}

// Example protected route
if (authMiddleware) {
  app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Protected data', userId: req.user._id });
  });
}

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
if (errorHandler) {
  app.use(errorHandler);
} else {
  app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
    });
  });
}

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
try {
  const createPeerServer = require('./utils/peerServer');
  const peerServer = createPeerServer(server);
  if (peerServer) {
    app.use('/peerjs', peerServer);
    console.log('⚡ PeerJS server running on path /peerjs');
  }
} catch (error) {
  console.warn('⚠️ PeerJS server not started:', error.message);
}

// === SOCKET.IO ===
try {
  const { initSocket } = require('./utils/socketHandler');
  initSocket(server);
  console.log('🔌 Socket.IO initialized');
} catch (error) {
  console.warn('⚠️ Socket.IO not initialized:', error.message);
}

// === SERVE CLIENT IN PRODUCTION ===
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  if (require('fs').existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(clientBuildPath, 'index.html'));
    });
  } else {
    console.warn('⚠️ Client build folder not found');
  }
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

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// === START SERVER ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log('='.repeat(50));
});

module.exports = app;