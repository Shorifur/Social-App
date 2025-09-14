// server.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Utils
const socketHandler = require('./utils/socketHandler');
const createPeerServer = require('./utils/peerServer');

// Load environment variables
dotenv.config();

// Initialize Express + HTTP server
const app = express();
const server = http.createServer(app);

// ✅ Trust proxy for reverse proxies (Render/Heroku)
app.set('trust proxy', true);

// ===============================
// Security Middleware
// ===============================
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
  })
);

// ===============================
// Body Parsers
// ===============================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===============================
// CORS Configuration
// ===============================
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-vercel-app.vercel.app',
  process.env.CLIENT_URL, // from .env
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Preflight
app.options('*', cors());

// ===============================
// Test & Health Endpoints
// ===============================
app.get('/test', (req, res) => res.json({ message: 'Server is live!' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// ===============================
// Uploads (ensure folder exists)
// ===============================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ===============================
// Dynamic Route Loader
// ===============================
const routes = [
  { path: './routes/auth', base: '/api/auth' },
  { path: './routes/social', base: '/api/social' },
  { path: './routes/uploads', base: '/api/upload' },
  { path: './routes/user', base: '/api/user' },
  { path: './routes/comments', base: '/api/comments' },
  { path: './routes/search', base: '/api/search' },
  { path: './routes/chat', base: '/api/chat' },
  { path: './routes/messages', base: '/api/messages' },
  { path: './routes/settings', base: '/api/settings' },
  { path: './routes/reactions', base: '/api' },
  { path: './routes/calls', base: '/api/calls' },
  { path: './routes/admin', base: '/api/admin' },
];

routes.forEach((r) => {
  try {
    const router = require(r.path);
    app.use(r.base, router);
  } catch (err) {
    console.warn(`⚠️ Could not load routes ${r.path}:`, err.message);
  }
});

// ===============================
// Middleware
// ===============================
let authMiddleware, errorHandler;
try {
  authMiddleware = require('./middleware/auth');
  errorHandler = require('./middleware/errorHandler');
} catch (err) {
  console.warn('⚠️ Middleware not loaded:', err.message);
}

if (authMiddleware) {
  app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Protected data', userId: req.user._id });
  });
}

// 404 handler
app.use('*', (req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// Error handler
app.use(errorHandler || ((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
  });
}));

// ===============================
// MongoDB Connection
// ===============================
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

// ===============================
// PeerJS Server
// ===============================
try {
  const peerServer = createPeerServer(server);
  if (peerServer) {
    app.use('/peerjs', peerServer);
    console.log('⚡ PeerJS server running on path /peerjs');
  }
} catch (err) {
  console.warn('⚠️ PeerJS server not started:', err.message);
}

// ===============================
// Socket.IO
// ===============================
try {
  socketHandler.initSocket(server);
  console.log('🔌 Socket.IO initialized');
} catch (err) {
  console.warn('⚠️ Socket.IO not initialized:', err.message);
}

// ===============================
// Serve Client in Production
// ===============================
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    console.warn('⚠️ Client build folder not found');
  }
}

// ===============================
// Graceful Shutdown
// ===============================
const shutdown = async () => {
  console.log('🛑 Shutting down server...');
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

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.name, err.message);
  process.exit(1);
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log('='.repeat(50));
});

module.exports = app;
