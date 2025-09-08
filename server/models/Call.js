// In server/models/Call.js
const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
  callId: {
    type: String,
    required: true,
    unique: true
  },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['audio', 'video'],
    default: 'video'
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'ongoing', 'completed', 'missed', 'rejected'],
    default: 'initiated'
  },
  startedAt: Date,
  endedAt: Date,
  duration: Number, // in seconds
  recordingUrl: String,
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Call', CallSchema);