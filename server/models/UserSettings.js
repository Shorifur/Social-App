// In server/models/UserSettings.js
const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  privacy: {
    profile: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    messages: {
      type: String,
      enum: ['everyone', 'friends', 'none'],
      default: 'friends'
    },
    onlineStatus: {
      type: Boolean,
      default: true
    },
    readReceipts: {
      type: Boolean,
      default: true
    }
  },
  notifications: {
    email: {
      newMessage: { type: Boolean, default: true },
      newFollower: { type: Boolean, default: true },
      postLikes: { type: Boolean, default: true },
      postComments: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true }
    },
    push: {
      newMessage: { type: Boolean, default: true },
      newFollower: { type: Boolean, default: true },
      postLikes: { type: Boolean, default: true },
      postComments: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true }
    },
    inApp: {
      newMessage: { type: Boolean, default: true },
      newFollower: { type: Boolean, default: true },
      postLikes: { type: Boolean, default: true },
      postComments: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true }
    }
  },
  theme: {
    mode: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    primaryColor: {
      type: String,
      default: '#4361ee'
    }
  },
  language: {
    type: String,
    default: 'en'
  },
  accessibility: {
    reduceMotion: { type: Boolean, default: false },
    highContrast: { type: Boolean, default: false },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
  },
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    loginAlerts: { type: Boolean, default: true },
    activeSessions: [{
      device: String,
      browser: String,
      ip: String,
      location: String,
      lastActive: Date,
      token: String
    }]
  },
  data: {
    dataSaver: { type: Boolean, default: false },
    autoPlayVideos: { type: Boolean, default: true },
    imageQuality: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserSettings', UserSettingsSchema);