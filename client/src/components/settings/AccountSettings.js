// src/components/settings/AccountSettings.js
import React, { useState } from 'react';

const AccountSettings = () => {
  const [userData, setUserData] = useState({
    username: 'current_user',
    email: 'user@example.com',
    phone: '+1234567890'
  });

  return (
    <div className="settings-section">
      <h2>Account Information</h2>
      <div className="settings-group">
        <label>Username</label>
        <input 
          type="text" 
          value={userData.username}
          onChange={(e) => setUserData({...userData, username: e.target.value})}
        />
      </div>
      <div className="settings-group">
        <label>Email</label>
        <input 
          type="email" 
          value={userData.email}
          onChange={(e) => setUserData({...userData, email: e.target.value})}
        />
      </div>
      <div className="settings-group">
        <label>Phone Number</label>
        <input 
          type="tel" 
          value={userData.phone}
          onChange={(e) => setUserData({...userData, phone: e.target.value})}
        />
      </div>
      <button className="save-btn">Save Changes</button>
    </div>
  );
};