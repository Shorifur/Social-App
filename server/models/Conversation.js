// server/models/Conversation.js
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: Date,
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: String,
    groupPhoto: String,
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        deletedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ isGroup: 1 });

// Virtual for counting unread messages per user
ConversationSchema.virtual('unreadCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversationId',
  count: true,
  match: { deleted: false }, // only count non-deleted messages
});

// Check if a user is a participant
ConversationSchema.methods.isParticipant = function (userId) {
  return this.participants.some(
    (participant) => participant.toString() === userId.toString()
  );
};

// Check if a conversation is deleted for a user
ConversationSchema.methods.isDeletedForUser = function (userId) {
  return this.deletedBy.some(
    (entry) => entry.userId.toString() === userId.toString()
  );
};

module.exports = mongoose.model('Conversation', ConversationSchema);
