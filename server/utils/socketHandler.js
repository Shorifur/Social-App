// server/utils/socketHandler.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const NotificationService = require('../services/notificationService');
const MessageService = require('../services/messageService');

let io;
const onlineUsers = new Map();

// === INIT SOCKET.IO ===
const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // --- Authentication middleware ---
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // --- Connection handler ---
  io.on('connection', (socket) => {
    console.log('🟢 User connected:', socket.userId);

    // Presence
    onlineUsers.set(socket.userId, socket.id);
    socket.join(`user_${socket.userId}`);
    io.emit('online-users', Array.from(onlineUsers.keys()));

    // --- Core handlers ---
    setupMessageHandlers(socket);
    setupCallHandlers(socket);

    // --- Notification handlers ---
    socket.on('mark_notification_read', async ({ notificationId }) => {
      try {
        await NotificationService.markAsRead(notificationId, socket.userId);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('mark_all_notifications_read', async () => {
      try {
        await NotificationService.markAllAsRead(socket.userId);
      } catch (err) {
        console.error(err);
      }
    });

    // --- Social features ---
    socket.on('post-created', (post) => {
      if (!post) return;
      socket.broadcast.emit('new-post', post);
    });

    socket.on('post-like', async ({ postId, postAuthorId, likedBy }) => {
      socket.to(`user_${postAuthorId}`).emit('new-like', {
        postId,
        likedBy,
        message: `${likedBy} liked your post`,
      });
      await NotificationService.createNotification(postAuthorId, 'like', socket.userId, postId);
    });

    socket.on('new-comment', async ({ postId, postAuthorId, commentBy, comment }) => {
      socket.to(`user_${postAuthorId}`).emit('comment-added', {
        postId,
        commentBy,
        comment,
      });
      await NotificationService.createNotification(
        postAuthorId,
        'comment',
        socket.userId,
        postId,
        null,
        `${commentBy} commented on your post`
      );
    });

    // --- Disconnect ---
    socket.on('disconnect', () => {
      console.log('🔴 User disconnected:', socket.userId);
      onlineUsers.delete(socket.userId);
      io.emit('presence-update', { userId: socket.userId, status: 'offline' });
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

// === MESSAGE HANDLERS ===
const setupMessageHandlers = (socket) => {
  socket.on('send_message', async ({ conversationId, content, messageType = 'text', mediaUrl = null }) => {
    try {
      await MessageService.sendMessage(
        socket.userId,
        conversationId,
        content,
        messageType,
        mediaUrl
      );
      // MessageService handles emitting updates
    } catch (err) {
      console.error(err);
      socket.emit('message_error', { error: err.message });
    }
  });

  socket.on('typing_start', ({ conversationId }) => {
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      conversationId
    });
  });

  socket.on('typing_stop', ({ conversationId }) => {
    socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
      userId: socket.userId,
      conversationId
    });
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });
};

// === CALL HANDLERS ===
const setupCallHandlers = (socket) => {
  // WebRTC signaling
  socket.on('webrtc_offer', (data) => {
    socket.to(`user_${data.targetUserId}`).emit('webrtc_offer', {
      offer: data.offer,
      callerId: socket.userId,
      callId: data.callId
    });
  });

  socket.on('webrtc_answer', (data) => {
    socket.to(`user_${data.targetUserId}`).emit('webrtc_answer', {
      answer: data.answer,
      callId: data.callId
    });
  });

  socket.on('webrtc_ice_candidate', (data) => {
    socket.to(`user_${data.targetUserId}`).emit('webrtc_ice_candidate', {
      candidate: data.candidate,
      callId: data.callId
    });
  });

  // Call lifecycle
  socket.on('call_initiate', async (data) => {
    try {
      const CallService = require('../services/callService');
      const call = await CallService.initiateCall(socket.userId, data.recipientId, data.type);
      socket.emit('call_initiated', { call });
    } catch (error) {
      socket.emit('call_error', { error: error.message });
    }
  });

  socket.on('call_accept', async (data) => {
    try {
      const CallService = require('../services/callService');
      const call = await CallService.acceptCall(data.callId, socket.userId);
      socket.emit('call_accepted', { call });
    } catch (error) {
      socket.emit('call_error', { error: error.message });
    }
  });

  socket.on('call_end', async (data) => {
    try {
      const CallService = require('../services/callService');
      const call = await CallService.endCall(data.callId, socket.userId);
      socket.emit('call_ended', { call });
    } catch (error) {
      socket.emit('call_error', { error: error.message });
    }
  });

  socket.on('call_reject', async (data) => {
    try {
      const CallService = require('../services/callService');
      const call = await CallService.rejectCall(data.callId, socket.userId);
      socket.emit('call_rejected', { call });
    } catch (error) {
      socket.emit('call_error', { error: error.message });
    }
  });
};

// === EMIT HELPERS ===
const getIO = () => {
  if (!io) throw new Error('❌ Socket.io not initialized!');
  return io;
};

const emitNotification = (userId, notification) => {
  getIO().to(`user_${userId}`).emit('new_notification', notification);
};

const emitMessage = (userId, message) => {
  getIO().to(`user_${userId}`).emit('new_message', message);
};

const emitConversationUpdate = (userId, conversation) => {
  getIO().to(`user_${userId}`).emit('conversation_updated', conversation);
};

const emitCallEvent = (userId, eventData) => {
  getIO().to(`user_${userId}`).emit('call_event', eventData);
};

const emitNewStory = async (userId, story) => {
  const User = require('../models/User');
  const user = await User.findById(userId).select('followers');
  if (user && user.followers) {
    user.followers.forEach((followerId) => {
      getIO().to(`user_${followerId}`).emit('new_story', story);
    });
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNotification,
  emitMessage,
  emitConversationUpdate,
  emitCallEvent,
  emitNewStory
};
