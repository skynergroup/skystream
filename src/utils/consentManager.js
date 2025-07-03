/**
 * Consent Management System for SkyStream
 * Handles GDPR compliance and Google Analytics consent mode
 */

import { ANALYTICS_CONFIG } from './config.js';

class ConsentManager {
  constructor() {
    this.consentKey = 'skystream_consent_preferences';
    this.consentVersion = '1.0';
    this.defaultConsent = {
      analytics: false,
      marketing: false,
      functional: true, // Always true for essential functionality
      timestamp: null,
      version: this.consentVersion,
    };
    
    this.callbacks = {
      onConsentChange: [],
      onConsentGiven: [],
      onConsentDenied: [],
    };

    this.init();
  }

  init() {
    // Initialize Google Analytics consent mode with default denied state
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        functionality_storage: 'granted', // Essential for site functionality
        security_storage: 'granted', // Essential for security
      });
    }

    // Check for existing consent
    const existingConsent = this.getStoredConsent();
    if (existingConsent && this.isConsentValid(existingConsent)) {
      this.applyConsent(existingConsent);
    }
  }

  /**
   * Get stored consent preferences
   */
  getStoredConsent() {
    try {
      const stored = localStorage.getItem(this.consentKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('[Consent] Failed to read stored consent:', error);
      return null;
    }
  }

  /**
   * Check if stored consent is still valid
   */
  isConsentValid(consent) {
    if (!consent || !consent.timestamp || !consent.version) {
      return false;
    }

    // Check if consent is from current version
    if (consent.version !== this.consentVersion) {
      return false;
    }

    // Check if consent is not older than 13 months (GDPR requirement)
    const consentAge = Date.now() - consent.timestamp;
    const thirteenMonths = 13 * 30 * 24 * 60 * 60 * 1000;
    
    return consentAge < thirteenMonths;
  }

  /**
   * Check if user has given consent
   */
  hasConsent() {
    const consent = this.getStoredConsent();
    return consent && this.isConsentValid(consent);
  }

  /**
   * Check if user needs to see consent banner
   */
  needsConsent() {
    return !this.hasConsent();
  }

  /**
   * Get current consent preferences
   */
  getConsent() {
    const stored = this.getStoredConsent();
    if (stored && this.isConsentValid(stored)) {
      return stored;
    }
    return this.defaultConsent;
  }

  /**
   * Save consent preferences
   */
  saveConsent(preferences) {
    const consent = {
      ...this.defaultConsent,
      ...preferences,
      timestamp: Date.now(),
      version: this.consentVersion,
    };

    try {
      localStorage.setItem(this.consentKey, JSON.stringify(consent));
      this.applyConsent(consent);
      this.triggerCallbacks('onConsentChange', consent);
      
      if (consent.analytics) {
        this.triggerCallbacks('onConsentGiven', consent);
      } else {
        this.triggerCallbacks('onConsentDenied', consent);
      }
      
      return true;
    } catch (error) {
      console.error('[Consent] Failed to save consent:', error);
      return false;
    }
  }

  /**
   * Apply consent preferences to Google Analytics
   */
  applyConsent(consent) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consent.analytics ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied',
        ad_user_data: consent.marketing ? 'granted' : 'denied',
        ad_personalization: consent.marketing ? 'granted' : 'denied',
      });

      // If analytics consent is given, initialize analytics
      if (consent.analytics && ANALYTICS_CONFIG.enabled) {
        // Re-initialize analytics with consent
        window.gtag('config', ANALYTICS_CONFIG.trackingId, {
          anonymize_ip: true,
          respect_dnt: true,
        });
      }
    }
  }

  /**
   * Accept all consent categories
   */
  acceptAll() {
    return this.saveConsent({
      analytics: true,
      marketing: false, // Keep marketing false for privacy
      functional: true,
    });
  }

  /**
   * Decline all non-essential consent categories
   */
  declineAll() {
    return this.saveConsent({
      analytics: false,
      marketing: false,
      functional: true, // Always keep functional for site operation
    });
  }

  /**
   * Save custom consent preferences
   */
  saveCustomConsent(analytics = false, marketing = false) {
    return this.saveConsent({
      analytics,
      marketing,
      functional: true,
    });
  }

  /**
   * Clear all consent data (for testing or user request)
   */
  clearConsent() {
    try {
      localStorage.removeItem(this.consentKey);
      
      // Reset consent mode to default denied state
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
      
      return true;
    } catch (error) {
      console.error('[Consent] Failed to clear consent:', error);
      return false;
    }
  }

  /**
   * Register callback for consent events
   */
  onConsentChange(callback) {
    this.callbacks.onConsentChange.push(callback);
  }

  onConsentGiven(callback) {
    this.callbacks.onConsentGiven.push(callback);
  }

  onConsentDenied(callback) {
    this.callbacks.onConsentDenied.push(callback);
  }

  /**
   * Trigger callbacks
   */
  triggerCallbacks(event, data) {
    this.callbacks[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[Consent] Callback error for ${event}:`, error);
      }
    });
  }

  /**
   * Get consent summary for display
   */
  getConsentSummary() {
    const consent = this.getConsent();
    return {
      hasConsent: this.hasConsent(),
      needsConsent: this.needsConsent(),
      analytics: consent.analytics,
      marketing: consent.marketing,
      functional: consent.functional,
      timestamp: consent.timestamp,
      version: consent.version,
    };
  }
}

// Create singleton instance
const consentManager = new ConsentManager();

export default consentManager;
