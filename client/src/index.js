import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/global.css';

import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './theme/theme';

import { AuthProvider } from './context/AuthContext'; // ✅ Import your AuthContext

const darkMode = false; // Or use system preference if needed

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Wrap everything with AuthProvider */}
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
