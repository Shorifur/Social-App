// client/src/components/ImageUpload.js
import React, { useState, useRef } from 'react';
import {
  Button,
  CircularProgress,
  Avatar,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { CameraAlt, Check, ErrorOutline, Delete } from '@mui/icons-material';
import { uploadProfilePicture, uploadPostImages, deleteImage } from '../api/uploads';

export default function ImageUpload({
  type = 'profile',        // 'profile' | 'cover' | 'post'
  currentUrl = '',
  size = 120,
  multiple = false,
  maxFiles = 10,
  disabled = false,
  onUploadComplete
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const token = localStorage.getItem('token');

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let response;

      if (type === 'post') {
        // Multiple post images
        const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
        response = await uploadPostImages(validFiles, token);
        onUploadComplete && onUploadComplete(response.fileUrls);
      } else {
        // Profile or Cover (single)
        const file = files[0];
        if (file.size > 5 * 1024 * 1024) {
          setError('File size must be less than 5MB');
          return;
        }
        response = await uploadProfilePicture(file, token); // Handles profile by default
        onUploadComplete && onUploadComplete(response.url);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      await deleteImage(type, token);
      onUploadComplete && onUploadComplete('');
      setSuccess(true);
    } catch {
      setError('Failed to remove image');
    } finally {
      setLoading(false);
    }
  };

  // === Drag & Drop for post uploads only ===
  const handleDrop = (e) => {
    e.preventDefault();
    if (type === 'post') {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* Avatar preview for profile/cover */}
      {type !== 'post' && (
        <Box sx={{ position: 'relative', width: size, height: size, mb: 2, mx: 'auto' }}>
          <Avatar
            src={currentUrl}
            sx={{ width: size, height: size, fontSize: size * 0.4 }}
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
      )}

      {/* File input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        multiple={type === 'post' && multiple}
        style={{ display: 'none' }}
        onChange={(e) => handleUpload(e.target.files)}
        disabled={disabled || loading}
      />

      {/* Upload controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Button
          component="span"
          variant="outlined"
          color={error ? 'error' : success ? 'success' : 'primary'}
          disabled={disabled || loading}
          onClick={() => fileInputRef.current.click()}
          startIcon={
            loading ? <CircularProgress size={20} /> :
            success ? <Check /> :
            error ? <ErrorOutline /> :
            <CameraAlt />
          }
        >
          {loading ? 'Uploading...' :
           error ? 'Retry' :
           success ? 'Success!' :
           type === 'post' ? 'Upload Images' :
           currentUrl ? 'Change' : 'Upload'}
        </Button>

        {currentUrl && type !== 'post' && (
          <IconButton color="error" onClick={handleRemove} disabled={loading}>
            <Delete />
          </IconButton>
        )}
      </Box>

      {type === 'post' && (
        <Box
          sx={{
            border: '2px dashed #aaa',
            borderRadius: 2,
            p: 2,
            mt: 2,
            cursor: 'pointer'
          }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
        >
          <Typography variant="body2" color="textSecondary">
            Drag & drop images here or click to browse
          </Typography>
          <Typography variant="caption">
            {multiple ? `Up to ${maxFiles} images` : 'Single image only'}
          </Typography>
        </Box>
      )}

      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
