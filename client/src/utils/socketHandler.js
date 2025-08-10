// utils/socketHandler.js
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle post likes in real-time
    socket.on('like-post', (postId) => {
      io.emit('post-liked', postId); // Broadcast to all clients
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};