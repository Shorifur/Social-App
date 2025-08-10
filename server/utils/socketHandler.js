const onlineUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id);

    // ✅ Track when user comes online (manual or auto ping)
    socket.on('set-online', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} is now online`);
      io.emit('online-users', Array.from(onlineUsers.keys()));

      // Optional: Join personal room for notifications
      socket.join(`user-${userId}`);
    });

    // ✅ Optional fallback for frontends using 'user-active' naming
    socket.on('user-active', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(`user-${userId}`);
      io.emit('presence-update', { userId, status: 'online' });
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });

    // 🔔 Join personal notification room
    socket.on('join-notifications', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`🔔 User ${userId} joined notification room`);
    });

    // 📩 Send direct notification
    socket.on('send-notification', ({ userId, message }) => {
      console.log(`📨 Sending notification to user-${userId}: ${message}`);
      io.to(`user-${userId}`).emit('new-notification', message);
    });

    // 💬 Join chat room
    socket.on('join-chat', (chatId) => {
      socket.join(`chat-${chatId}`);
      console.log(`💬 Socket joined chat room: chat-${chatId}`);
    });

    // ✍️ Typing indicator
    socket.on('typing', ({ chatId, userId, isTyping }) => {
      socket.to(`chat-${chatId}`).emit('typing-indicator', { userId, isTyping });
    });

    // 🔌 Clean disconnect
    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('presence-update', { userId, status: 'offline' });
          break;
        }
      }
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });
  });
};
