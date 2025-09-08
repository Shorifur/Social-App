// In server/services/searchService.js
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

class SearchService {
  static async searchUsers(query, page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const searchFilter = {
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { 'profile.firstName': { $regex: query, $options: 'i' } },
          { 'profile.lastName': { $regex: query, $options: 'i' } }
        ],
        isActive: true,
        ...filters
      };

      const users = await User.find(searchFilter)
        .select('username profilePicture profile.firstName profile.lastName profile.bio followers following')
        .sort({ followers: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(searchFilter);

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total
        }
      };
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  static async searchPosts(query, page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const searchFilter = {
        content: { $regex: query, $options: 'i' },
        deleted: false,
        ...filters
      };

      const posts = await Post.find(searchFilter)
        .populate('author', 'username profilePicture firstName lastName')
        .sort({ likeCount: -1, commentCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments(searchFilter);

      return {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total
        }
      };
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  static async searchComments(query, page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const searchFilter = {
        content: { $regex: query, $options: 'i' },
        deleted: false,
        ...filters
      };

      const comments = await Comment.find(searchFilter)
        .populate('author', 'username profilePicture firstName lastName')
        .populate('post')
        .sort({ likeCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Comment.countDocuments(searchFilter);

      return {
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalComments: total
        }
      };
    } catch (error) {
      console.error('Error searching comments:', error);
      throw error;
    }
  }

  static async globalSearch(query, page = 1, limit = 10) {
    try {
      const [users, posts, comments] = await Promise.all([
        this.searchUsers(query, page, limit / 3),
        this.searchPosts(query, page, limit / 3),
        this.searchComments(query, page, limit / 3)
      ]);

      return {
        users: users.users,
        posts: posts.posts,
        comments: comments.comments,
        pagination: {
          currentPage: page,
          totalPages: Math.max(
            users.pagination.totalPages,
            posts.pagination.totalPages,
            comments.pagination.totalPages
          )
        }
      };
    } catch (error) {
      console.error('Error in global search:', error);
      throw error;
    }
  }

  static async advancedSearch(params, page = 1, limit = 20) {
    try {
      const {
        query,
        type, // 'users', 'posts', 'comments', 'all'
        sortBy = 'relevance',
        timeRange,
        author,
        tags,
        minLikes,
        maxLikes
      } = params;

      let filters = {};
      let sort = {};

      // Time range filter
      if (timeRange) {
        const timeFilters = {
          '24h': Date.now() - 24 * 60 * 60 * 1000,
          'week': Date.now() - 7 * 24 * 60 * 60 * 1000,
          'month': Date.now() - 30 * 24 * 60 * 60 * 1000,
          'year': Date.now() - 365 * 24 * 60 * 60 * 1000
        };
        if (timeFilters[timeRange]) {
          filters.createdAt = { $gte: new Date(timeFilters[timeRange]) };
        }
      }

      // Author filter
      if (author) {
        const authorUser = await User.findOne({
          $or: [
            { username: author },
            { 'profile.firstName': author },
            { 'profile.lastName': author }
          ]
        });
        if (authorUser) {
          filters.author = authorUser._id;
        }
      }

      // Tags filter
      if (tags && tags.length > 0) {
        filters.tags = { $in: tags };
      }

      // Likes filter
      if (minLikes !== undefined) {
        filters.likeCount = { ...filters.likeCount, $gte: minLikes };
      }
      if (maxLikes !== undefined) {
        filters.likeCount = { ...filters.likeCount, $lte: maxLikes };
      }

      // Sort options
      const sortOptions = {
        relevance: { score: { $meta: 'textScore' } },
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        popular: { likeCount: -1 },
        most_commented: { commentCount: -1 }
      };
      sort = sortOptions[sortBy] || sortOptions.relevance;

      let results;
      switch (type) {
        case 'users':
          results = await this.searchUsers(query, page, limit, filters);
          break;
        case 'posts':
          results = await this.searchPosts(query, page, limit, filters);
          break;
        case 'comments':
          results = await this.searchComments(query, page, limit, filters);
          break;
        default:
          results = await this.globalSearch(query, page, limit);
      }

      return results;
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw error;
    }
  }
}

module.exports = SearchService;