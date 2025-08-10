import { useState, useEffect } from 'react';
import { getPosts, createPost } from '../api/posts';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch posts when page changes
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getPosts(page); // getPosts accepts page now
        if (data.length === 0) {
          setHasMore(false); // No more posts to load
        } else {
          // Append new posts for subsequent pages or replace for page 1
          setPosts(prev => (page === 1 ? data : [...prev, ...data]));
        }
      } catch (err) {
        console.error('Failed to fetch posts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page]);

  const addPost = async (post) => {
    try {
      const data = await createPost(post);
      setPosts(prev => [data, ...prev]);
    } catch (err) {
      console.error('Failed to add post', err);
    }
  };

  // Function to load next page
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  return { posts, addPost, loadMore, hasMore, loading };
};
