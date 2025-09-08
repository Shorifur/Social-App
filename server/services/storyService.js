// In server/services/storyService.js
const Story = require('../models/Story');
const User = require('../models/User');
const NotificationService = require('./notificationService');
const { emitNewStory } = require('../utils/socketHandler');

class StoryService {
  static async createStory(userId, media, mediaType, content = '', duration = 5, location = null, hashtags = [], mentions = []) {
    try {
      const story = new Story({
        author: userId,
        media,
        mediaType,
        content,
        duration,
        location,
        hashtags,
        mentions
      });

      await story.save();
      await story.populate('author', 'username profilePicture firstName lastName');

      // Notify mentioned users
      for (const mentionId of mentions) {
        await NotificationService.createNotification(
          mentionId,
          'mention',
          userId,
          null,
          null,
          `${story.author.username} mentioned you in their story`
        );
      }

      // Emit to followers
      emitNewStory(userId, story);

      return story;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  static async getActiveStories(userId) {
    try {
      const user = await User.findById(userId).populate('following');
      const followingIds = user.following.map(f => f._id);
      followingIds.push(userId); // Include own stories

      const stories = await Story.find({
        author: { $in: followingIds },
        isActive: true,
        expiresAt: { $gt: new Date() }
      })
      .populate('author', 'username profilePicture firstName lastName')
      .sort({ createdAt: -1 });

      // Group stories by author
      const storiesByAuthor = {};
      stories.forEach(story => {
        if (!storiesByAuthor[story.author._id]) {
          storiesByAuthor[story.author._id] = {
            author: story.author,
            stories: []
          };
        }
        storiesByAuthor[story.author._id].stories.push(story);
      });

      return Object.values(storiesByAuthor);
    } catch (error) {
      console.error('Error getting stories:', error);
      throw error;
    }
  }

  static async viewStory(storyId, userId) {
    try {
      const story = await Story.findById(storyId);
      
      if (!story || !story.isActive || story.expiresAt < new Date()) {
        throw new Error('Story not available');
      }

      await story.addViewer(userId);

      return story;
    } catch (error) {
      console.error('Error viewing story:', error);
      throw error;
    }
  }

  static async getUserStories(userId) {
    try {
      const stories = await Story.find({
        author: userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      })
      .sort({ createdAt: -1 });

      return stories;
    } catch (error) {
      console.error('Error getting user stories:', error);
      throw error;
    }
  }

  static async deleteStory(storyId, userId) {
    try {
      const story = await Story.findOneAndUpdate(
        { _id: storyId, author: userId },
        { isActive: false },
        { new: true }
      );

      if (!story) {
        throw new Error('Story not found or access denied');
      }

      return story;
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }

  static async getStoryViewers(storyId, userId) {
    try {
      const story = await Story.findById(storyId)
        .populate('viewers.userId', 'username profilePicture firstName lastName');

      if (!story || story.author.toString() !== userId) {
        throw new Error('Access denied');
      }

      return story.viewers;
    } catch (error) {
      console.error('Error getting story viewers:', error);
      throw error;
    }
  }
}

module.exports = StoryService;