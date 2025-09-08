// In client/src/pages/Settings.js
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

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
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

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-sidebar">
          <h3>Settings</h3>
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={activeTab === 'privacy' ? 'active' : ''}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </button>
          <button 
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button 
            className={activeTab === 'appearance' ? 'active' : ''}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <ProfileSettings 
              user={user} 
              onUpdate={handleProfileUpdate} 
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
          
          {/* Add other settings tabs */}
        </div>
      </div>
    </div>
  );
};

// Example Profile Settings Component
const ProfileSettings = ({ user, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    firstName: user.profile.firstName || '',
    lastName: user.profile.lastName || '',
    bio: user.profile.bio || '',
    website: user.profile.website || '',
    location: user.profile.location || '',
    birthDate: user.profile.birthDate || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="settings-tab">
      <h2>Profile Settings</h2>
      <form onSubmit={handleSubmit}>
        {/* Form fields for profile settings */}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Settings;