// client/src/pages/Settings.js
import React, { useState, useEffect } from 'react';
import {
  getSettings,
  updateSettings,
  updateProfile,
  changePassword,
  updateProfilePicture,
  updateCoverPhoto
} from '../api/settings';
import { useAuth } from '../hooks/useAuth';

// Import your settings components
import GeneralSettings from '../components/settings/GeneralSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import DatingSettings from '../components/settings/DatingSettings';
import BlindDatingMatch from '../components/settings/BlindDatingMatch';
import NotificationSettings from '../components/settings/NotificationSettings';
import AccountSettings from '../components/settings/AccountSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';

import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await getSettings();
      setSettings(response.settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSettingsUpdate = async (newSettings) => {
    try {
      setLoading(true);
      const response = await updateSettings(newSettings);
      setSettings(response.settings);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (profileData) => {
    try {
      setLoading(true);
      const response = await updateProfile(profileData);
      updateUser(response.user);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'dating', label: 'Dating Preferences', icon: '💕' },
    { id: 'blind-dating', label: 'Blind Dating', icon: '🎭' }
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and privacy settings</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-main">
          {activeTab === 'general' && (
            <GeneralSettings
              settings={settings}
              onUpdate={handleSettingsUpdate}
              loading={loading}
            />
          )}
          {activeTab === 'account' && (
            <AccountSettings
              user={user}
              onUpdate={handleProfileUpdate}
              onPasswordChange={changePassword}
              onUpdateProfilePicture={updateProfilePicture}
              onUpdateCoverPhoto={updateCoverPhoto}
              loading={loading}
            />
          )}
          {activeTab === 'privacy' && settings && (
            <PrivacySettings
              settings={settings}
              onUpdate={handleSettingsUpdate}
              loading={loading}
            />
          )}
          {activeTab === 'notifications' && settings && (
            <NotificationSettings
              settings={settings}
              onUpdate={handleSettingsUpdate}
              loading={loading}
            />
          )}
          {activeTab === 'appearance' && settings && (
            <AppearanceSettings
              settings={settings}
              onUpdate={handleSettingsUpdate}
              loading={loading}
            />
          )}
          {activeTab === 'dating' && (
            <DatingSettings
              settings={settings}
              onUpdate={handleSettingsUpdate}
              loading={loading}
            />
          )}
          {activeTab === 'blind-dating' && (
            <BlindDatingMatch
              settings={settings}
              onUpdate={handleSettingsUpdate}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
