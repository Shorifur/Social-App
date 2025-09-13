// src/components/settings/NotificationSettings.js
import React, { useState } from 'react';

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    messages: true,
    likes: true,
    comments: true,
    shares: true,
    mentions: true,
    emailNotifications: false,
    pushNotifications: true
  });

  return (
    <div className="settings-section">
      <h2>Notification Preferences</h2>
      
      {Object.entries(notifications).map(([key, value]) => (
        <div key={key} className="settings-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
            />
            {key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
          </label>
        </div>
      ))}

      <button className="save-btn">Save Notification Settings</button>
    </div>
  );
};