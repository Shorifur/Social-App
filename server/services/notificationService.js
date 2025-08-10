import Notification from '../models/Notification';

// Create a general notification
export const createNotification = async (userId, message, type, link) => {
  const notification = new Notification({
    user: userId,
    message,
    type, // e.g. 'like', 'comment', 'follow'
    link,
    read: false,
  });
  await notification.save();
  return notification;
};

// Get notifications for a user (latest 10)
export const getUserNotifications = async (userId) => {
  return await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10);
};

// Create a notification for story actions (reaction/view)
export const createStoryNotification = async (story, actionType) => {
  const messageTypes = {
    reaction: `${story.userId} received a reaction on their story`,
    view: `${story.userId}'s story was viewed`
  };

  const message = messageTypes[actionType];
  if (!message) throw new Error('Invalid actionType for story notification');

  const notification = new Notification({
    user: story.userId,
    message,
    type: 'story',
    relatedEntity: {
      type: 'story',
      id: story._id
    },
    read: false,
  });

  await notification.save();
  return notification;
};
