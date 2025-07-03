import React, { useState, useEffect } from 'react';
import { Settings, Shield, Check, X, RefreshCw } from 'lucide-react';
import consentManager from '../utils/consentManager.js';
import './ConsentPreferences.css';

const ConsentPreferences = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
    functional: true,
  });
  const [consentSummary, setConsentSummary] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load current preferences when modal opens
      const currentConsent = consentManager.getConsent();
      setPreferences({
        analytics: currentConsent.analytics,
        marketing: currentConsent.marketing,
        functional: currentConsent.functional,
      });
      
      // Get consent summary
      setConsentSummary(consentManager.getConsentSummary());
    }
  }, [isOpen]);

  const handlePreferenceChange = (category, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const success = consentManager.saveCustomConsent(
        preferences.analytics,
        preferences.marketing
      );
      
      if (success) {
        // Update consent summary
        setConsentSummary(consentManager.getConsentSummary());
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
          setIsSaving(false);
        }, 1000);
      } else {
        setIsSaving(false);
        alert('Failed to save preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setIsSaving(false);
      alert('Failed to save preferences. Please try again.');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all privacy preferences? This will clear your consent and show the banner again.')) {
      consentManager.clearConsent();
      window.location.reload();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="consent-preferences-overlay">
      <div className="consent-preferences-modal">
        <div className="preferences-header">
          <div className="preferences-icon">
            <Settings size={24} />
          </div>
          <h2>Privacy Preferences</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="preferences-content">
          {consentSummary && (
            <div className="consent-status">
              <h3>Current Status</h3>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Consent Given:</span>
                  <span className={`status-value ${consentSummary.hasConsent ? 'active' : 'inactive'}`}>
                    {consentSummary.hasConsent ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Analytics:</span>
                  <span className={`status-value ${consentSummary.analytics ? 'active' : 'inactive'}`}>
                    {consentSummary.analytics ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {consentSummary.timestamp && (
                  <div className="status-item">
                    <span className="status-label">Last Updated:</span>
                    <span className="status-value">
                      {new Date(consentSummary.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="preferences-list">
            <h3>Manage Your Preferences</h3>
            
            <div className="preference-item">
              <div className="preference-info">
                <div className="preference-header">
                  <Shield size={18} />
                  <strong>Essential Cookies</strong>
                  <span className="required-badge">Required</span>
                </div>
                <p>
                  Necessary for the website to function properly. These cannot be disabled 
                  as they are essential for security, navigation, and basic functionality.
                </p>
              </div>
              <div className="preference-toggle">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  id="functional-prefs"
                />
                <label htmlFor="functional-prefs" className="toggle-label disabled">
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <div className="preference-header">
                  <Settings size={18} />
                  <strong>Analytics Cookies</strong>
                  <span className="optional-badge">Optional</span>
                </div>
                <p>
                  Help us understand how you use our site, which content is popular, 
                  and how we can improve your experience. All data is anonymized.
                </p>
                <ul className="preference-details">
                  <li>Page views and navigation patterns</li>
                  <li>Content popularity and search terms</li>
                  <li>Video player performance and preferences</li>
                  <li>General location (country/region only)</li>
                </ul>
              </div>
              <div className="preference-toggle">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                  id="analytics-prefs"
                />
                <label htmlFor="analytics-prefs" className="toggle-label">
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <div className="preference-header">
                  <X size={18} />
                  <strong>Marketing Cookies</strong>
                  <span className="disabled-badge">Disabled</span>
                </div>
                <p>
                  Currently not used. SkyStream does not display advertisements or 
                  track users for marketing purposes. This option is disabled.
                </p>
              </div>
              <div className="preference-toggle">
                <input
                  type="checkbox"
                  checked={false}
                  disabled={true}
                  id="marketing-prefs"
                />
                <label htmlFor="marketing-prefs" className="toggle-label disabled">
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="preferences-actions">
          <div className="primary-actions">
            <button 
              className="preferences-btn save-btn"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Save Preferences
                </>
              )}
            </button>
            
            <button 
              className="preferences-btn cancel-btn"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>

          <div className="secondary-actions">
            <button 
              className="preferences-btn reset-btn"
              onClick={handleReset}
              disabled={isSaving}
            >
              <RefreshCw size={16} />
              Reset All Preferences
            </button>
          </div>
        </div>

        <div className="preferences-footer">
          <p>
            Learn more about our data practices in our{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentPreferences;
