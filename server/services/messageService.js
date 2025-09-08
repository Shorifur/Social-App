// In server/services/messageService.js
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const NotificationService = require('./notificationService');
const { emitMessage, emitConversationUpdate } = require('../utils/socketHandler');

class MessageService {
  static async sendMessage(senderId, conversationId, content, messageType = 'text', mediaUrl = null) {
    try {
      // Check if conversation exists and user is participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.isParticipant(senderId)) {
        throw new Error('Conversation not found or access denied');
      }

      // Create message
      const message = new Message({
        conversationId,
        sender: senderId,
        content,
        messageType,
        mediaUrl
      });

      await message.save();
      await message.populate('sender', 'username profilePicture firstName lastName');

      // Update conversation last message
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      // Populate conversation for emitting
      await conversation.populate('participants', 'username profilePicture');

      // Emit message to all participants except sender
      conversation.participants.forEach(participant => {
        if (participant._id.toString() !== senderId) {
          emitMessage(participant._id.toString(), message);
          
          // Send notification
          NotificationService.createNotification(
            participant._id,
            'message',
            senderId,
            null,
            null,
            `New message from ${message.sender.username}`
          );
        }
      });

      // Emit conversation update to all participants
      conversation.participants.forEach(participant => {
        emitConversationUpdate(participant._id.toString(), conversation);
      });

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
    try {
      // Verify user has access to conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.isParticipant(userId)) {
        throw new Error('Conversation not found or access denied');
      }

      const skip = (page - 1) * limit;

      const messages = await Message.find({ 
        conversationId, 
        deleted: false 
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username profilePicture firstName lastName')
      .populate('readBy.userId', 'username');

      // Mark messages as read for this user
      const unreadMessages = messages.filter(msg => 
        !msg.readBy.some(read => read.userId._id.toString() === userId)
      );

      if (unreadMessages.length > 0) {
        await Message.updateMany(
          { 
            _id: { $in: unreadMessages.map(msg => msg._id) },
            'readBy.userId': { $ne: userId }
          },
          { 
            $push: { 
              readBy: { 
                userId: userId,
                readAt: new Date()
              } 
            } 
          }
        );
      }

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  static async getOrCreateConversation(userId1, userId2) {
    try {
      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        participants: { $all: [userId1, userId2], $size: 2 },
        isGroup: false
      }).populate('participants', 'username profilePicture firstName lastName');

      if (!conversation) {
        // Create new conversation
        conversation = new Conversation({
          participants: [userId1, userId2],
          isGroup: false
        });

        await conversation.save();
        await conversation.populate('participants', 'username profilePicture firstName lastName');
      }

      return conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  static async getUserConversations(userId) {
    try {
      const conversations = await Conversation.find({
        participants: userId,
        'deletedBy.userId': { $ne: userId }
      })
      .populate('participants', 'username profilePicture firstName lastName')
      .populate('lastMessage')
      .populate('groupAdmin', 'username')
      .sort({ lastMessageAt: -1 });

      return conversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  static async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);
      
      if (!message || message.sender.toString() !== userId) {
        throw new Error('Message not found or access denied');
      }

      message.deleted = true;
      message.deletedAt = new Date();
      message.deletedBy = userId;

      await message.save();

      // Emit message deletion to conversation participants
      const conversation = await Conversation.findById(message.conversationId);
      conversation.participants.forEach(participant => {
        emitMessage(participant._id.toString(), {
          action: 'delete',
          messageId: message._id
        });
      });

      return message;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}

module.exports = MessageService;