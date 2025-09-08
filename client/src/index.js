// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';

import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './theme/theme';

import { AuthProvider } from './context/AuthContext'; // ✅ Updated AuthProvider import

const darkMode = false; // TODO: Replace with user/system preference if needed

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
