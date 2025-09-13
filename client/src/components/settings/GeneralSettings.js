// src/components/settings/GeneralSettings.js
import React from 'react';

const GeneralSettings = () => {
  return (
    <div className="settings-section">
      <h2>General Settings</h2>
      <div className="settings-group">
        <label>Language</label>
        <select>
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </div>
      <div className="settings-group">
        <label>Timezone</label>
        <select>
          <option>UTC-5 (EST)</option>
          <option>UTC-8 (PST)</option>
        </select>
      </div>
    </div>
  );
};