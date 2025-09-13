// src/components/settings/AppearanceSettings.js
import React, { useState } from 'react';

const AppearanceSettings = () => {
  const [appearance, setAppearance] = useState({
    theme: 'light',
    fontSize: 'medium',
    reduceMotion: false,
    highContrast: false
  });

  return (
    <div className="settings-section">
      <h2>Appearance Settings</h2>
      
      <div className="settings-group">
        <label>Theme</label>
        <select
          value={appearance.theme}
          onChange={(e) => setAppearance({...appearance, theme: e.target.value})}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto (System)</option>
        </select>
      </div>

      <div className="settings-group">
        <label>Font Size</label>
        <select
          value={appearance.fontSize}
          onChange={(e) => setAppearance({...appearance, fontSize: e.target.value})}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="settings-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={appearance.reduceMotion}
            onChange={(e) => setAppearance({...appearance, reduceMotion: e.target.checked})}
          />
          Reduce Motion
        </label>
      </div>

      <button className="save-btn">Save Appearance Settings</button>
    </div>
  );
};