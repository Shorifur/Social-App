const { PeerServer } = require('peer');
const { getIO } = require('./socketHandler');

const peerServer = PeerServer({
  port: 9000,
  path: '/peerjs',
  proxied: true
});

// Handle peer connection events
peerServer.on('connection', (client) => {
  console.log('Peer connected:', client.id);
  
  // Notify all clients about the new peer connection
  const io = getIO();
  io.emit('peer-connected', { peerId: client.id });
});

peerServer.on('disconnect', (client) => {
  console.log('Peer disconnected:', client.id);
  
  // Notify all clients about the peer disconnection
  const io = getIO();
  io.emit('peer-disconnected', { peerId: client.id });
});

module.exports = peerServer;