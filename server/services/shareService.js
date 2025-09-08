// In server/services/shareService.js
const Share = require('../models/Share');
const Post = require('../models/Post');
const NotificationService = require('./notificationService');
const { emitNewShare } = require('../utils/socketHandler');

class ShareService {
  static async sharePost(postId, userId, content = '', audience = 'public') {
    try {
      const originalPost = await Post.findById(postId);
      
      if (!originalPost) {
        throw new Error('Post not found');
      }

      // Create new post for the share
      const sharedPost = new Post({
        content: content || `Shared: ${originalPost.content.substring(0, 100)}...`,
        author: userId,
        media: originalPost.media,
        originalPost: postId,
        privacy: audience
      });

      await sharedPost.save();

      // Create share record
      const share = new Share({
        post: sharedPost._id,
        user: userId,
        content,
        audience,
        originalPost: postId
      });

      await share.save();

      // Update original post share count
      originalPost.shareCount += 1;
      await originalPost.save();

      // Notify original post author
      if (originalPost.author.toString() !== userId) {
        await NotificationService.createNotification(
          originalPost.author,
          'share',
          userId,
          postId,
          null,
          `${userId.username} shared your post`
        );
      }

      // Emit real-time share event
      emitNewShare(originalPost._id, share);

      return { sharedPost, share };
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  }

  static async getUserShares(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const shares = await Share.find({ user: userId })
        .populate('post')
        .populate('originalPost')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Share.countDocuments({ user: userId });

      return {
        shares,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalShares: total
        }
      };
    } catch (error) {
      console.error('Error getting user shares:', error);
      throw error;
    }
  }

  static async getPostShares(postId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const shares = await Share.find({ originalPost: postId })
        .populate('user', 'username profilePicture firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Share.countDocuments({ originalPost: postId });

      return {
        shares,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalShares: total
        }
      };
    } catch (error) {
      console.error('Error getting post shares:', error);
      throw error;
    }
  }

  static async deleteShare(shareId, userId) {
    try {
      const share = await Share.findById(shareId);
      
      if (!share) {
        throw new Error('Share not found');
      }

      if (share.user.toString() !== userId) {
        throw new Error('Not authorized to delete this share');
      }

      // Delete the shared post
      await Post.findByIdAndDelete(share.post);

      // Delete the share record
      await Share.findByIdAndDelete(shareId);

      // Update original post share count
      const originalPost = await Post.findById(share.originalPost);
      if (originalPost) {
        originalPost.shareCount = Math.max(0, originalPost.shareCount - 1);
        await originalPost.save();
      }

      return true;
    } catch (error) {
      console.error('Error deleting share:', error);
      throw error;
    }
  }
}

module.exports = ShareService;