import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import SocketManager from '../utils/socket';

const ConnectionTest = () => {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [socketStatus, setSocketStatus] = useState('Testing...');

  useEffect(() => {
    // Test API connection
    api.get('/api/health')
      .then(response => {
        setApiStatus('Connected ✅');
      })
      .catch(error => {
        setApiStatus('Failed ❌: ' + error.message);
      });

    // Test Socket connection
    const socket = SocketManager.connect();
    socket.on('connect', () => {
      setSocketStatus('Connected ✅');
    });
    
    socket.on('connect_error', (error) => {
      setSocketStatus('Failed ❌: ' + error.message);
    });

    return () => {
      SocketManager.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Connection Test</h3>
      <p>API: {apiStatus}</p>
      <p>Socket: {socketStatus}</p>
      <button onClick={() => window.location.reload()}>Retest</button>
    </div>
  );
};

export default ConnectionTest;