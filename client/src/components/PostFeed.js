import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import PostCard from './PostCard';
import axios from '../api/axios';
import './PostFeed.css';

const PostFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch posts with pagination
  const fetchPosts = async (pageNum = 1) => {
    try {
      const response = await axios.get(`/api/posts?page=${pageNum}&limit=10`);

      if (response.data.status === 'success') {
        const newPosts = response.data.data.posts;

        setPosts(prev =>
          pageNum === 1 ? newPosts : [...prev, ...newPosts]
        );

        setHasMore(pageNum < response.data.pagination.pages);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle like/unlike
  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`);

      if (response.data.status === 'success') {
        const { liked } = response.data.data;

        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? {
                  ...post,
                  likes: liked
                    ? [...post.likes, user._id]
                    : post.likes.filter(id => id !== user._id),
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Handle adding a comment
  const handleComment = async (postId, content) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, { content });

      if (response.data.status === 'success') {
        const newComment = response.data.data.comment;

        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? { ...post, comments: [...post.comments, newComment] }
              : post
          )
        );
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Load more posts
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  if (loading && posts.length === 0) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="post-feed">
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
        />
      ))}

      {hasMore && (
        <button
          className="load-more-btn"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default PostFeed;
