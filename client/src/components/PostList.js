import React, { useEffect, useState, useContext } from 'react';
import { Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Post from './Post';
import Loading from './Loading'; // ⬅️ Import the loading spinner

export default function PostList() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // ⬅️ Loading state

  // 🌐 Fetch posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts');
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false); // ✅ Done loading
      }
    };
    fetchPosts();
  }, []);

  // 🔁 Refresh posts after likes/comments
  const refreshPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Error refreshing posts:', err);
    }
  };

  if (loading) return <Loading />; // ⬅️ Show spinner while loading

  return (
    <Box sx={{ mt: 2 }}>
      {posts.map((post) => (
        <Post 
          key={post._id} 
          post={post} 
          currentUser={user}
          onInteraction={refreshPosts} 
        />
      ))}
    </Box>
  );
}
