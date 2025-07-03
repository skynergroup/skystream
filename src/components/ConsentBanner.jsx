import React, { useState, useEffect } from 'react';
import { X, Shield, Settings, Check, ChevronDown, ChevronUp } from 'lucide-react';
import consentManager from '../utils/consentManager.js';
import './ConsentBanner.css';

const ConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [customPreferences, setCustomPreferences] = useState({
    analytics: false,
    marketing: false,
    functional: true,
  });

  useEffect(() => {
    // Check if consent banner should be shown
    if (consentManager.needsConsent()) {
      setIsVisible(true);
    }

    // Set initial custom preferences from stored consent
    const currentConsent = consentManager.getConsent();
    setCustomPreferences({
      analytics: currentConsent.analytics,
      marketing: currentConsent.marketing,
      functional: currentConsent.functional,
    });
  }, []);

  const handleAcceptAll = () => {
    consentManager.acceptAll();
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    consentManager.declineAll();
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    consentManager.saveCustomConsent(
      customPreferences.analytics,
      customPreferences.marketing
    );
    setIsVisible(false);
  };

  const handleCustomizeToggle = () => {
    setShowCustomize(!showCustomize);
  };

  const handlePreferenceChange = (category, value) => {
    setCustomPreferences(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="consent-banner-overlay">
      <div className="consent-banner">
        <div className="consent-banner-header">
          <div className="consent-banner-icon">
            <Shield size={24} />
          </div>
          <h3>Your Privacy Matters</h3>
        </div>

        <div className="consent-banner-content">
          <p>
            We use cookies and similar technologies to enhance your streaming experience, 
            analyze site usage, and understand which content is most popular. 
            Your privacy is important to us.
          </p>

          {showCustomize && (
            <div className="consent-preferences">
              <h4>Customize Your Preferences</h4>
              
              <div className="preference-item">
                <div className="preference-info">
                  <strong>Essential Cookies</strong>
                  <p>Required for the website to function properly. Cannot be disabled.</p>
                </div>
                <div className="preference-toggle">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    id="functional"
                  />
                  <label htmlFor="functional" className="toggle-label disabled">
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <strong>Analytics Cookies</strong>
                  <p>Help us understand how you use our site to improve your experience and see which content is popular.</p>
                </div>
                <div className="preference-toggle">
                  <input
                    type="checkbox"
                    checked={customPreferences.analytics}
                    onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                    id="analytics"
                  />
                  <label htmlFor="analytics" className="toggle-label">
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <strong>Marketing Cookies</strong>
                  <p>Used to track visitors across websites for advertising purposes. Currently disabled.</p>
                </div>
                <div className="preference-toggle">
                  <input
                    type="checkbox"
                    checked={false}
                    disabled={true}
                    id="marketing"
                  />
                  <label htmlFor="marketing" className="toggle-label disabled">
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="consent-banner-actions">
          <div className="consent-primary-actions">
            <button 
              className="consent-btn consent-btn-accept"
              onClick={handleAcceptAll}
            >
              <Check size={16} />
              Accept All
            </button>
            
            <button 
              className="consent-btn consent-btn-decline"
              onClick={handleDeclineAll}
            >
              Decline All
            </button>
          </div>

          <div className="consent-secondary-actions">
            <button 
              className="consent-btn consent-btn-customize"
              onClick={handleCustomizeToggle}
            >
              <Settings size={16} />
              Customize
              {showCustomize ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showCustomize && (
              <button 
                className="consent-btn consent-btn-save"
                onClick={handleSaveCustom}
              >
                Save Preferences
              </button>
            )}
          </div>
        </div>

        <div className="consent-banner-footer">
          <p>
            Learn more in our{' '}
            <a href="/privacy-policy" className="consent-link">
              Privacy Policy
            </a>
            {' '}and{' '}
            <a href="/cookie-policy" className="consent-link">
              Cookie Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
