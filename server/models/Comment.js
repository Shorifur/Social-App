// server/models/Comment.js
const mongoose = require('mongoose');

// ===============================
// Reply Schema
// ===============================
const ReplySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ===============================
// Comment Schema
// ===============================
const CommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  replies: [ReplySchema],
  replyCount: {
    type: Number,
    default: 0
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ===============================
// Indexes for performance
// ===============================
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ parentComment: 1 });

// ===============================
// Hooks
// ===============================
CommentSchema.pre('save', function (next) {
  this.likeCount = this.likes.length;
  this.replyCount = this.replies.length;
  next();
});

ReplySchema.pre('save', function (next) {
  this.likeCount = this.likes.length;
  next();
});

// ===============================
// Instance Methods
// ===============================

// Add like
CommentSchema.methods.addLike = function (userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likeCount = this.likes.length;
  }
  return this.save();
};

// Remove like
CommentSchema.methods.removeLike = function (userId) {
  if (this.likes.includes(userId)) {
    this.likes = this.likes.filter(id => id.toString() !== userId.toString());
    this.likeCount = this.likes.length;
  }
  return this.save();
};

// Add reply
CommentSchema.methods.addReply = function (replyData) {
  this.replies.push(replyData);
  this.replyCount = this.replies.length;
  return this.save();
};

// Soft delete comment
CommentSchema.methods.softDelete = function () {
  this.deleted = true;
  this.content = '[deleted]';
  this.likes = [];
  this.likeCount = 0;
  this.mentions = [];
  return this.save();
};

module.exports = mongoose.model('Comment', CommentSchema);
