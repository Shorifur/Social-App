// src/components/settings/PrivacySettings.js
import React, { useState } from 'react';

const PrivacySettings = () => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowMessages: 'everyone',
    shareActivity: true,
    dataCollection: false
  });

  return (
    <div className="settings-section">
      <h2>Privacy Settings</h2>
      
      <div className="settings-group">
        <label>Profile Visibility</label>
        <select
          value={privacySettings.profileVisibility}
          onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
        >
          <option value="public">Public</option>
          <option value="friends">Friends Only</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div className="settings-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={privacySettings.showOnlineStatus}
            onChange={(e) => setPrivacySettings({...privacySettings, showOnlineStatus: e.target.checked})}
          />
          Show Online Status
        </label>
      </div>

      <div className="settings-group">
        <label>Who can message you</label>
        <select
          value={privacySettings.allowMessages}
          onChange={(e) => setPrivacySettings({...privacySettings, allowMessages: e.target.value})}
        >
          <option value="everyone">Everyone</option>
          <option value="friends">Friends Only</option>
          <option value="nobody">Nobody</option>
        </select>
      </div>

      <button className="save-btn">Save Privacy Settings</button>
    </div>
  );
};