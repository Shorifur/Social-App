// server/services/notifications/index.js

const sendNotification = async (userId, message) => {
  console.log(`🔔 Sending notification to user ${userId}: ${message}`);

  // TODO: Store notification in DB
  // Example:
  // await Notification.create({ userId, message, read: false, createdAt: new Date() });

  // TODO: Emit via Socket.IO if user is online
  // Example:
  // const socket = getUserSocket(userId);
  // if (socket) {
  //   socket.emit('notification', { message });
  // }
};

const getNotificationsForUser = async (userId) => {
  console.log(`📨 Fetching notifications for user ${userId}`);

  // TODO: Replace with actual DB query
  // Example:
  // return await Notification.find({ userId }).sort({ createdAt: -1 });

  // Temporary mock data
  return [
    { id: 1, message: 'Welcome to the platform!', read: false },
    { id: 2, message: 'Your post received a like!', read: true },
  ];
};

module.exports = {
  sendNotification,
  getNotificationsForUser,
};
