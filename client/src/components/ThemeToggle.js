import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export default function ThemeToggle({ darkMode, setDarkMode }) {
  const theme = useTheme();
  
  return (
    <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        onClick={() => setDarkMode(!darkMode)}
        size="large"
        sx={{
          color: theme.palette.mode === 'dark' ? '#ffeb3b' : '#ff9800',
          '&:hover': {
            bgcolor: 'transparent',
            transform: 'rotate(30deg)',
            transition: 'transform 0.3s ease'
          }
        }}
      >
        {darkMode ? (
          <LightMode fontSize="medium" />
        ) : (
          <DarkMode fontSize="medium" />
        )}
      </IconButton>
    </Tooltip>
  );
}