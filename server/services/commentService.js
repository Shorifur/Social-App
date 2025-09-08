// In server/services/commentService.js
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const NotificationService = require('./notificationService');
const { emitNewComment } = require('../utils/socketHandler');

class CommentService {
  static async createComment(postId, authorId, content, parentCommentId = null, mentions = []) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const commentData = {
        post: postId,
        author: authorId,
        content,
        mentions,
        parentComment: parentCommentId
      };

      const comment = new Comment(commentData);
      await comment.save();
      
      // Populate author info
      await comment.populate('author', 'username profilePicture firstName lastName');
      
      // Update post comment count
      post.commentCount += 1;
      await post.save();

      // Notify post author (if not the commenter)
      if (post.author.toString() !== authorId) {
        await NotificationService.createNotification(
          post.author,
          'comment',
          authorId,
          postId,
          comment._id,
          `${comment.author.username} commented on your post`
        );
      }

      // Notify mentioned users
      for (const mentionId of mentions) {
        if (mentionId.toString() !== authorId) {
          await NotificationService.createNotification(
            mentionId,
            'mention',
            authorId,
            postId,
            comment._id,
            `${comment.author.username} mentioned you in a comment`
          );
        }
      }

      // Emit real-time comment event
      emitNewComment(postId, comment);

      return comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  static async getPostComments(postId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const comments = await Comment.find({
        post: postId,
        parentComment: null, // Only top-level comments
        deleted: false
      })
      .populate('author', 'username profilePicture firstName lastName')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username profilePicture firstName lastName'
        },
        options: { limit: 3 } // Only get first 3 replies
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      const total = await Comment.countDocuments({
        post: postId,
        parentComment: null,
        deleted: false
      });

      return {
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalComments: total
        }
      };
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  static async getCommentReplies(commentId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const comment = await Comment.findById(commentId)
        .populate({
          path: 'replies',
          populate: {
            path: 'author',
            select: 'username profilePicture firstName lastName'
          },
          options: { skip, limit }
        });

      if (!comment) {
        throw new Error('Comment not found');
      }

      return comment.replies;
    } catch (error) {
      console.error('Error getting comment replies:', error);
      throw error;
    }
  }

  static async likeComment(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        throw new Error('Comment not found');
      }

      await comment.addLike(userId);

      // Notify comment author (if not the liker)
      if (comment.author.toString() !== userId) {
        await NotificationService.createNotification(
          comment.author,
          'like',
          userId,
          comment.post,
          commentId,
          `${userId.username} liked your comment`
        );
      }

      return comment;
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }

  static async unlikeComment(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        throw new Error('Comment not found');
      }

      await comment.removeLike(userId);
      return comment;
    } catch (error) {
      console.error('Error unliking comment:', error);
      throw error;
    }
  }

  static async deleteComment(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Check if user is author or post author
      if (comment.author.toString() !== userId) {
        const post = await Post.findById(comment.post);
        if (post.author.toString() !== userId) {
          throw new Error('Not authorized to delete this comment');
        }
      }

      await comment.softDelete();
      return comment;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  static async addReply(commentId, authorId, content, mentions = []) {
    try {
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        throw new Error('Comment not found');
      }

      const replyData = {
        author: authorId,
        content,
        mentions
      };

      await comment.addReply(replyData);
      await comment.populate('replies.author', 'username profilePicture firstName lastName');

      const newReply = comment.replies[comment.replies.length - 1];

      // Notify comment author (if not the replier)
      if (comment.author.toString() !== authorId) {
        await NotificationService.createNotification(
          comment.author,
          'comment',
          authorId,
          comment.post,
          commentId,
          `${newReply.author.username} replied to your comment`
        );
      }

      // Notify mentioned users
      for (const mentionId of mentions) {
        if (mentionId.toString() !== authorId) {
          await NotificationService.createNotification(
            mentionId,
            'mention',
            authorId,
            comment.post,
            commentId,
            `${newReply.author.username} mentioned you in a reply`
          );
        }
      }

      return newReply;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  }
}

module.exports = CommentService;