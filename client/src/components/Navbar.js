import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
  Typography,
  Paper,
  InputBase,
  Box,
} from '@mui/material';
import {
  Notifications,
  Chat,
  Search
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { motion } from 'framer-motion';

function Navbar({ darkMode, setDarkMode }) {
  const { user = null, loading = false } = useContext(AuthContext) || {};
  const [unreadCount] = useState(4); // Removed setUnreadCount as it was unused

  if (loading) return null;

  return (
    <AppBar
      position="sticky"
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        color: darkMode ? 'white' : 'inherit',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        {/* 🅰️ Logo */}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          SociAl
        </Typography>

        {/* 🔍 Search Bar */}
        <Paper
          component="form"
          sx={{
            p: '2px 10px',
            display: 'flex',
            alignItems: 'center',
            width: 400,
            borderRadius: '20px',
            bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0, 0, 0, 0.05)'
          }}
        >
          <InputBase
            placeholder="Search..."
            sx={{ ml: 1, flex: 1, color: darkMode ? 'white' : 'inherit' }}
          />
          <IconButton type="submit">
            <Search />
          </IconButton>
        </Paper>

        {/* 🧭 Icon Group */}
        <Box sx={{ display: 'flex', gap: 1, ml: 3, alignItems: 'center' }}>
          {/* 🔔 Notification Badge with Animation */}
          <IconButton>
            <Badge
              badgeContent={unreadCount}
              color="error"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{
                '& .MuiBadge-badge': {
                  animation: 'pulse 2s infinite',
                }
              }}
            >
              <Notifications />
            </Badge>
          </IconButton>

          {/* 💬 Chat Badge */}
          <IconButton>
            <Badge badgeContent={2} color="error">
              <Chat />
            </Badge>
          </IconButton>

          {/* 🌗 Animated Theme Toggle */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </motion.div>

          {/* 👤 Avatar */}
          {user?._id && (
            <Link to={`/${user.username}`}>
              <IconButton>
                <Avatar
                  src={user.profilePicture || user.avatar || '/default-avatar.png'}
                  alt={user.username}
                />
              </IconButton>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
