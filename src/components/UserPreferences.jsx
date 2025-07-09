import { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Download, Upload } from 'lucide-react';
import userPreferencesService from '../services/userPreferencesService';
import { Button } from './index';
import './UserPreferences.css';

const UserPreferences = ({ onClose, onPreferencesChange }) => {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('video');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      setLoading(true);
      const userPrefs = userPreferencesService.getPreferences();
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const saved = userPreferencesService.updatePreferences(preferences);
      if (saved && onPreferencesChange) {
        onPreferencesChange(saved);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetPreferences = () => {
    if (confirm('Are you sure you want to reset all preferences to defaults?')) {
      const defaults = userPreferencesService.resetPreferences();
      if (defaults) {
        setPreferences(defaults);
        if (onPreferencesChange) {
          onPreferencesChange(defaults);
        }
      }
    }
  };

  const exportPreferences = () => {
    const exportData = userPreferencesService.exportPreferences();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skystream-preferences.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importPreferences = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = userPreferencesService.importPreferences(e.target.result);
          if (imported) {
            setPreferences(imported);
            if (onPreferencesChange) {
              onPreferencesChange(imported);
            }
          }
        } catch (error) {
          alert('Failed to import preferences. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'video', label: 'Video', icon: '🎬' },
    { id: 'audio', label: 'Audio & Subtitles', icon: '🔊' },
    { id: 'interface', label: 'Interface', icon: '🎨' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="user-preferences loading">
        <div className="preferences-header">
          <h2>Loading Preferences...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="user-preferences">
      <div className="preferences-header">
        <h2>
          <Settings size={24} />
          User Preferences
        </h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="preferences-content">
        <div className="preferences-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="preferences-panel">
          {activeTab === 'video' && (
            <div className="preference-section">
              <h3>Video Settings</h3>
              
              <div className="preference-group">
                <label>Preferred Quality</label>
                <select
                  value={preferences.preferredQuality || 'auto'}
                  onChange={(e) => handlePreferenceChange('preferredQuality', e.target.value)}
                >
                  {userPreferencesService.getQualityOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <small>Automatically adjust video quality based on your connection</small>
              </div>

              <div className="preference-group">
                <label>Preferred Player</label>
                <select
                  value={preferences.preferredPlayer || 'videasy'}
                  onChange={(e) => handlePreferenceChange('preferredPlayer', e.target.value)}
                >
                  <option value="videasy">Server 1 (Videasy)</option>
                  <option value="vidsrc">Server 2 (VidSrc)</option>
                </select>
              </div>

              <div className="preference-group">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.autoPlay || false}
                    onChange={(e) => handlePreferenceChange('autoPlay', e.target.checked)}
                  />
                  Auto-play videos
                </label>
              </div>

              <div className="preference-group">
                <label>Playback Speed</label>
                <select
                  value={preferences.playbackSpeed || 1.0}
                  onChange={(e) => handlePreferenceChange('playbackSpeed', parseFloat(e.target.value))}
                >
                  {userPreferencesService.getPlaybackSpeedOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="preference-section">
              <h3>Audio & Subtitle Settings</h3>
              
              <div className="preference-group">
                <label>Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={preferences.volume || 80}
                  onChange={(e) => handlePreferenceChange('volume', parseInt(e.target.value))}
                />
                <span>{preferences.volume || 80}%</span>
              </div>

              <div className="preference-group">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.subtitlesEnabled || false}
                    onChange={(e) => handlePreferenceChange('subtitlesEnabled', e.target.checked)}
                  />
                  Enable subtitles by default
                </label>
              </div>

              <div className="preference-group">
                <label>Subtitle Language</label>
                <select
                  value={preferences.subtitleLanguage || 'en'}
                  onChange={(e) => handlePreferenceChange('subtitleLanguage', e.target.value)}
                >
                  {userPreferencesService.getSubtitleLanguageOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="preference-group">
                <label>Subtitle Size</label>
                <select
                  value={preferences.subtitleSize || 'medium'}
                  onChange={(e) => handlePreferenceChange('subtitleSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'interface' && (
            <div className="preference-section">
              <h3>Interface Settings</h3>
              
              <div className="preference-group">
                <label>Theme</label>
                <select
                  value={preferences.theme || 'dark'}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div className="preference-group">
                <label>Language</label>
                <select
                  value={preferences.language || 'en'}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div className="preference-group">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.highContrast || false}
                    onChange={(e) => handlePreferenceChange('highContrast', e.target.checked)}
                  />
                  High contrast mode
                </label>
              </div>

              <div className="preference-group">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.reducedMotion || false}
                    onChange={(e) => handlePreferenceChange('reducedMotion', e.target.checked)}
                  />
                  Reduce motion and animations
                </label>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="preference-section">
              <h3>Privacy Settings</h3>
              
              <div className="preference-group">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.trackWatchHistory || true}
                    onChange={(e) => handlePreferenceChange('trackWatchHistory', e.target.checked)}
                  />
                  Track watch history
                </label>
                <small>Enable to see continue watching and get recommendations</small>
              </div>

              <div className="preference-group">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.analyticsConsent || true}
                    onChange={(e) => handlePreferenceChange('analyticsConsent', e.target.checked)}
                  />
                  Allow analytics and usage tracking
                </label>
                <small>Help improve the service by sharing anonymous usage data</small>
              </div>

              <div className="preference-group">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.enableNotifications || true}
                    onChange={(e) => handlePreferenceChange('enableNotifications', e.target.checked)}
                  />
                  Enable notifications
                </label>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="preference-section">
              <h3>Advanced Settings</h3>
              
              <div className="preference-group">
                <label>Buffer Size</label>
                <select
                  value={preferences.bufferSize || 'medium'}
                  onChange={(e) => handlePreferenceChange('bufferSize', e.target.value)}
                >
                  <option value="small">Small (Faster start)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="large">Large (Smoother playback)</option>
                </select>
              </div>

              <div className="preference-group">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.skipIntro || false}
                    onChange={(e) => handlePreferenceChange('skipIntro', e.target.checked)}
                  />
                  Auto-skip intros (when available)
                </label>
              </div>

              <div className="preference-group">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.skipCredits || false}
                    onChange={(e) => handlePreferenceChange('skipCredits', e.target.checked)}
                  />
                  Auto-skip credits (when available)
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="preferences-footer">
        <div className="footer-left">
          <Button
            variant="ghost"
            size="small"
            icon={<Download size={16} />}
            onClick={exportPreferences}
          >
            Export
          </Button>
          
          <label className="import-button">
            <Button
              variant="ghost"
              size="small"
              icon={<Upload size={16} />}
              as="span"
            >
              Import
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={importPreferences}
              style={{ display: 'none' }}
            />
          </label>

          <Button
            variant="ghost"
            size="small"
            icon={<RotateCcw size={16} />}
            onClick={resetPreferences}
          >
            Reset
          </Button>
        </div>

        <div className="footer-right">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<Save size={16} />}
            onClick={savePreferences}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
