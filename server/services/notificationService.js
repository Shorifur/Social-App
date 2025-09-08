// server/services/notificationService.js
const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitNotification } = require('../utils/socketHandler');

class NotificationService {
  /**
   * Create a notification
   * @param {String} userId - The user to notify
   * @param {String} type - Notification type: follow, like, comment, mention, message, share
   * @param {String} fromUserId - User who triggered the notification
   * @param {String|null} postId - Optional related post
   * @param {String|null} commentId - Optional related comment
   * @param {String|null} customMessage - Optional custom message
   */
  static async createNotification(userId, type, fromUserId, postId = null, commentId = null, customMessage = null) {
    try {
      let message;
      const fromUser = await User.findById(fromUserId).select('username firstName lastName');

      if (customMessage) {
        message = customMessage;
      } else {
        switch (type) {
          case 'follow':
            message = `${fromUser.username} started following you`;
            break;
          case 'like':
            message = `${fromUser.username} liked your post`;
            break;
          case 'comment':
            message = `${fromUser.username} commented on your post`;
            break;
          case 'mention':
            message = `${fromUser.username} mentioned you in a post`;
            break;
          case 'message':
            message = `New message from ${fromUser.username}`;
            break;
          case 'share':
            message = `${fromUser.username} shared your post`;
            break;
          default:
            message = 'You have a new notification';
        }
      }

      // Generate link based on notification type
      let link = '';
      switch (type) {
        case 'like':
        case 'comment':
        case 'share':
          link = `/post/${postId}`;
          break;
        case 'follow':
          link = `/profile/${fromUserId}`;
          break;
        case 'message':
          link = `/messages/${fromUserId}`;
          break;
      }

      const notification = await Notification.create({
        userId,
        type,
        fromUserId,
        postId,
        commentId,
        message,
        link,
        isRead: false,
      });

      await notification.populate('fromUserId', 'username profilePicture firstName lastName');

      // Real-time emit
      emitNotification(userId, notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get paginated notifications
   */
  static async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('fromUserId', 'username profilePicture firstName lastName')
        .populate('postId', 'content');

      const total = await Notification.countDocuments({ userId });
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });

      return {
        notifications,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        unreadCount,
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId, userId) {
    try {
      return await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      // Notify client
      const io = require('../server').io;
      io.to(`user_${userId}`).emit('notifications_all_read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId, userId) {
    try {
      await Notification.findOneAndDelete({ _id: notificationId, userId });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
