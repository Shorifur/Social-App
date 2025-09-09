// server/utils/peerServer.js
const { ExpressPeerServer } = require('peer');
const { getIO } = require('./socketHandler');

const peerServer = (httpServer) => {
  try {
    // Create the PeerJS server attached to your existing HTTP server
    const peerServerInstance = ExpressPeerServer(httpServer, {
      debug: true,
      path: '/peerjs',
      allow_discovery: true,
    });

    // Handle peer connections
    peerServerInstance.on('connection', (client) => {
      console.log('Peer connected:', client.getId());

      // Notify all clients via Socket.IO
      const io = getIO();
      io.emit('peer-connected', { peerId: client.getId() });
    });

    peerServerInstance.on('disconnect', (client) => {
      console.log('Peer disconnected:', client.getId());

      // Notify all clients via Socket.IO
      const io = getIO();
      io.emit('peer-disconnected', { peerId: client.getId() });
    });

    return peerServerInstance;
  } catch (error) {
    console.error('PeerJS server error:', error.message);
    return null;
  }
};

module.exports = peerServer;
