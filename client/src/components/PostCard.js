import { useState, useEffect } from 'react';
import { reactToPost, removeReaction, getUserReaction } from '../api/reactions';
import { useAuth } from '../hooks/useAuth';
import './PostCard.css';

const PostCard = ({ post, onComment }) => { // Removed unused 'user' from props
  const [userReaction, setUserReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState(post.reactionCounts || {});
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();

  const loadUserReaction = async () => {
    try {
      const response = await getUserReaction(post._id);
      setUserReaction(response?.userReaction || null);
    } catch (error) {
      console.error('Error loading user reaction:', error);
    }
  };

  useEffect(() => {
    loadUserReaction();
  }, [post._id, loadUserReaction]); // Added loadUserReaction to dependencies

  const handleReaction = async (reactionType) => {
    try {
      if (userReaction === reactionType) {
        await removeReaction(post._id);
        setUserReaction(null);
        setReactionCounts((prev) => ({
          ...prev,
          [reactionType]: Math.max(0, (prev[reactionType] || 0) - 1),
        }));
      } else {
        const response = await reactToPost(post._id, reactionType);
        setUserReaction(reactionType);
        setReactionCounts(response.reactionCounts);
      }
      setShowReactionPicker(false);
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onComment(post._id, comment.trim());
      setComment('');
    }
  };

  const getReactionIcon = (type) => {
    switch (type) {
      case 'like':
        return '👍';
      case 'love':
        return '❤️';
      case 'haha':
        return '😄';
      case 'wow':
        return '😲';
      case 'sad':
        return '😢';
      case 'angry':
        return '😠';
      case 'dislike':
        return '👎';
      default:
        return '👍';
    }
  };

  const getTotalReactions = () => {
    return Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="post-card">
      {/* Post header */}
      <div className="post-header">
        <img
          src={post.user?.profilePicture || '/default-avatar.jpg'}
          alt={post.user?.firstName}
          className="post-avatar"
        />
        <div className="post-user-info">
          <h4>
            {post.user?.firstName} {post.user?.lastName}
          </h4>
          <span className="post-time">{formatDate(post.createdAt)}</span>
        </div>
      </div>

      {/* Post content */}
      <div className="post-content">
        <p>{post.content}</p>
        {post.image && <img src={post.image} alt="Post" className="post-image" />}
      </div>

      {/* Reaction + comment stats */}
      <div className="post-stats">
        {getTotalReactions() > 0 && <span>{getTotalReactions()} reactions</span>}
        <span>{post.comments.length} comments</span>
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`action-btn ${userReaction ? 'active' : ''}`}
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
          onClick={() => handleReaction('like')}
        >
          {userReaction ? getReactionIcon(userReaction) : '👍'}{' '}
          {userReaction ? 'Reacted' : 'React'}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="action-btn"
        >
          💬 Comment
        </button>

        <button className="action-btn">🔄 Share</button>
      </div>

      {/* Reaction picker */}
      {showReactionPicker && (
        <div
          className="reaction-picker"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          {['like', 'love', 'haha', 'wow', 'sad', 'angry', 'dislike'].map((type) => (
            <button
              key={type}
              className="reaction-option"
              onClick={() => handleReaction(type)}
              title={type.charAt(0).toUpperCase() + type.slice(1)}
            >
              {getReactionIcon(type)}
            </button>
          ))}
        </div>
      )}

      {/* Comments */}
      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
            />
            <button type="submit" disabled={!comment.trim()}>
              Post
            </button>
          </form>

          <div className="comments-list">
            {post.comments.map((c) => (
              <div key={c._id} className="comment">
                <img
                  src={c.user?.profilePicture || '/default-avatar.jpg'}
                  alt={c.user?.firstName}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <strong>{c.user?.firstName}</strong>
                  <p>{c.content}</p>
                  <span className="comment-time">{formatDate(c.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
