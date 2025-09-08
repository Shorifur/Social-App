// In client/src/pages/Feed.js
import React, { useState, useEffect } from 'react';
import { getFeedPosts } from '../api/posts';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeedPosts();
  }, []);

  const loadFeedPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await getFeedPosts(pageNum);
      
      if (pageNum === 1) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      setError('Failed to load feed');
      console.error('Feed loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadFeedPosts(page + 1);
    }
  };

  if (loading && page === 1) {
    return <div className="loading">Loading feed...</div>;
  }

  return (
    <div className="feed-page">
      <div className="container">
        <div className="feed-content">
          <CreatePost onPostCreated={handleNewPost} />
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="empty-feed">
                <h3>Your feed is empty</h3>
                <p>Follow some users to see their posts here</p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </div>
          
          {hasMore && (
            <button 
              onClick={handleLoadMore} 
              disabled={loading}
              className="load-more-btn"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;