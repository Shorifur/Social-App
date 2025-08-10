import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Edit,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import ImageUpload from '../components/ImageUpload';
import PostList from '../components/PostList';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser = null } = useContext(AuthContext) || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    phone: '',
    profilePicture: '',
    coverPhoto: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [{ data: userData }, { data: postsData }] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/posts?userId=${id}`)
        ]);

        setUser(userData);
        setPosts(postsData);
        setFormData({
          bio: userData.bio || '',
          phone: userData.phone || '',
          profilePicture: userData.profilePicture || '',
          coverPhoto: userData.coverPhoto || ''
        });
      } catch (err) {
        console.error('Failed to fetch profile data', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleSave = async () => {
    try {
      const { data } = await api.put('/users', formData);
      setUser(data);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (!user) return <Typography>User not found</Typography>;

  const isCurrentUser = currentUser?._id === user._id;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Cover Photo Section */}
      <Box sx={{
        height: 300,
        background:
          formData.coverPhoto
            ? `url(${formData.coverPhoto}) center/cover`
            : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        position: 'relative'
      }}>
        {editMode && (
          <Box sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            bgcolor: 'background.paper',
            p: 1,
            borderRadius: 1,
            boxShadow: 3
          }}>
            <ImageUpload
              currentUrl={formData.coverPhoto}
              onUploadComplete={(url) => setFormData({ ...formData, coverPhoto: url })}
              type="cover"
              size={80}
            />
          </Box>
        )}
      </Box>

      {/* Profile Header */}
      <Box sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: { xs: 2, md: 4 },
        mt: -8,
        position: 'relative'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-end' },
          gap: 3
        }}>
          <Box sx={{
            position: 'relative',
            width: 160,
            height: 160,
            mt: -4
          }}>
            <ImageUpload
              currentUrl={formData.profilePicture}
              onUploadComplete={(url) => setFormData({ ...formData, profilePicture: url })}
              type="profile"
              size={160}
              disabled={!editMode}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 600 }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {user.email}
            </Typography>
            <Typography variant="body2">
              {formData.bio || 'No bio yet'}
            </Typography>
            <Typography variant="caption">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>

          {isCurrentUser && (
            <Button
              startIcon={<Edit />}
              onClick={() => {
                if (editMode) {
                  // cancel changes
                  setFormData({
                    bio: user.bio || '',
                    phone: user.phone || '',
                    profilePicture: user.profilePicture || '',
                    coverPhoto: user.coverPhoto || ''
                  });
                }
                setEditMode(!editMode);
              }}
              variant="outlined"
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
          )}
        </Box>
      </Box>

      {editMode && (
        <Box sx={{ maxWidth: 600, mx: 'auto', px: 2, mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ mt: 2 }}
          >
            Save Changes
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Tabs Section */}
      <Box sx={{ px: { xs: 2, md: 4 } }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ mb: 3 }}>
          <Tab label="Posts" />
          <Tab label="Comments" />
        </Tabs>

        {tabValue === 0 && <PostList posts={posts} />}
        {tabValue === 1 && (
          <Box sx={{ mt: 3 }}>
            {posts.length === 0 ? (
              <Typography variant="body1">No comments available.</Typography>
            ) : (
              posts.flatMap(post =>
                post.comments
                  ?.filter(comment => comment.user?.username === user.username)
                  .map(comment => (
                    <Box key={comment._id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        On post: {post.content?.substring(0, 50)}...
                      </Typography>
                      <Typography variant="body1">{comment.text}</Typography>
                    </Box>
                  ))
              )
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
