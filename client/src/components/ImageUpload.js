import React, { useState } from 'react';
import { 
  Button, 
  CircularProgress, 
  Avatar, 
  Box, 
  Typography,
  IconButton 
} from '@mui/material';
import { CameraAlt, Check, ErrorOutline, Delete } from '@mui/icons-material';
import api from '../utils/api';

export default function ImageUpload({ 
  currentUrl, 
  onUploadComplete, 
  type = 'profile',
  size = 100,
  disabled = false
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const { data } = await api.post(`/uploads/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onUploadComplete(data.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      await api.delete(`/uploads/${type}`);
      onUploadComplete('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to remove image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ 
        position: 'relative',
        width: size,
        height: size,
        mb: 2
      }}>
        <Avatar
          src={currentUrl}
          sx={{ 
            width: '100%', 
            height: '100%',
            fontSize: size * 0.4
          }}
        >
          {!currentUrl && <CameraAlt fontSize="inherit" />}
        </Avatar>
        
        {loading && (
          <CircularProgress 
            size={size * 0.5}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </Box>

      <input
        accept="image/*"
        style={{ display: 'none' }}
        id={`${type}-upload-input`}
        type="file"
        onChange={handleUpload}
        disabled={disabled || loading}
      />
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <label htmlFor={`${type}-upload-input`}>
          <Button
            component="span"
            variant="outlined"
            color={
              error ? 'error' : 
              success ? 'success' : 
              'primary'
            }
            disabled={disabled || loading}
            startIcon={
              loading ? <CircularProgress size={20} /> :
              success ? <Check /> :
              error ? <ErrorOutline /> :
              <CameraAlt />
            }
          >
            {loading ? 'Processing...' : 
             error ? 'Error' : 
             success ? 'Success!' : 
             currentUrl ? 'Change' : 'Upload'}
          </Button>
        </label>

        {currentUrl && !disabled && (
          <IconButton
            color="error"
            onClick={handleRemove}
            disabled={loading}
          >
            <Delete />
          </IconButton>
        )}
      </Box>

      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}