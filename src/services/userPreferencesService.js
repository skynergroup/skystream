/**
 * User Preferences Service
 * Manages user preferences for video quality, subtitles, player settings, etc.
 */

import { analytics } from '../utils';

class UserPreferencesService {
  constructor() {
    this.STORAGE_KEY = 'skystream_user_preferences';
    this.defaultPreferences = {
      // Video preferences
      preferredQuality: 'auto', // 'auto', '1080p', '720p', '480p'
      autoPlay: true,
      
      // Subtitle preferences
      subtitlesEnabled: false,
      subtitleLanguage: 'en',
      subtitleSize: 'medium', // 'small', 'medium', 'large'
      
      // Player preferences
      preferredPlayer: 'videasy', // 'videasy', 'vidsrc'
      volume: 80, // 0-100
      playbackSpeed: 1.0, // 0.5, 0.75, 1.0, 1.25, 1.5, 2.0
      
      // Interface preferences
      theme: 'dark', // 'dark', 'light'
      language: 'en',
      
      // Content preferences
      showAdultContent: false,
      preferredGenres: [],
      contentLanguage: 'en',
      
      // Notification preferences
      enableNotifications: true,
      newContentNotifications: true,
      watchlistNotifications: true,
      
      // Privacy preferences
      trackWatchHistory: true,
      shareWatchActivity: false,
      analyticsConsent: true,
      
      // Accessibility preferences
      highContrast: false,
      reducedMotion: false,
      screenReaderMode: false,
      
      // Advanced preferences
      bufferSize: 'medium', // 'small', 'medium', 'large'
      skipIntro: false,
      skipCredits: false,
      
      // Last updated
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Get all user preferences
   */
  getPreferences() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const preferences = stored ? JSON.parse(stored) : {};
      
      // Merge with defaults to ensure all properties exist
      return {
        ...this.defaultPreferences,
        ...preferences,
        updatedAt: preferences.updatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return this.defaultPreferences;
    }
  }

  /**
   * Update user preferences (partial update)
   */
  updatePreferences(updates) {
    try {
      const currentPreferences = this.getPreferences();
      const newPreferences = {
        ...currentPreferences,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newPreferences));
      
      // Track preference changes
      Object.keys(updates).forEach(key => {
        analytics.trackEvent('preference_changed', {
          category: 'user_preferences',
          label: key,
          preference_name: key,
          old_value: currentPreferences[key],
          new_value: updates[key]
        });
      });

      return newPreferences;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      return null;
    }
  }

  /**
   * Get specific preference value
   */
  getPreference(key) {
    const preferences = this.getPreferences();
    return preferences[key];
  }

  /**
   * Set specific preference value
   */
  setPreference(key, value) {
    return this.updatePreferences({ [key]: value });
  }

  /**
   * Reset preferences to defaults
   */
  resetPreferences() {
    try {
      const resetPreferences = {
        ...this.defaultPreferences,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(resetPreferences));
      
      analytics.trackEvent('preferences_reset', {
        category: 'user_preferences',
        label: 'reset_to_defaults'
      });
      
      return resetPreferences;
    } catch (error) {
      console.error('Failed to reset preferences:', error);
      return null;
    }
  }

  /**
   * Export preferences for backup
   */
  exportPreferences() {
    const preferences = this.getPreferences();
    const exportData = {
      preferences,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import preferences from backup
   */
  importPreferences(importData) {
    try {
      const data = typeof importData === 'string' ? JSON.parse(importData) : importData;
      
      if (data.preferences) {
        const importedPreferences = {
          ...this.defaultPreferences,
          ...data.preferences,
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(importedPreferences));
        
        analytics.trackEvent('preferences_imported', {
          category: 'user_preferences',
          label: 'import_successful'
        });
        
        return importedPreferences;
      }
      
      throw new Error('Invalid import data format');
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return null;
    }
  }

  /**
   * Get video quality options
   */
  getQualityOptions() {
    return [
      { value: 'auto', label: 'Auto (Recommended)', description: 'Automatically adjust based on connection' },
      { value: '1080p', label: '1080p HD', description: 'High quality, requires good connection' },
      { value: '720p', label: '720p HD', description: 'Good quality, moderate bandwidth' },
      { value: '480p', label: '480p SD', description: 'Standard quality, low bandwidth' }
    ];
  }

  /**
   * Get subtitle language options
   */
  getSubtitleLanguageOptions() {
    return [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'it', label: 'Italian' },
      { value: 'pt', label: 'Portuguese' },
      { value: 'ja', label: 'Japanese' },
      { value: 'ko', label: 'Korean' },
      { value: 'zh', label: 'Chinese' },
      { value: 'ar', label: 'Arabic' },
      { value: 'hi', label: 'Hindi' },
      { value: 'ru', label: 'Russian' }
    ];
  }

  /**
   * Get playback speed options
   */
  getPlaybackSpeedOptions() {
    return [
      { value: 0.5, label: '0.5x' },
      { value: 0.75, label: '0.75x' },
      { value: 1.0, label: '1x (Normal)' },
      { value: 1.25, label: '1.25x' },
      { value: 1.5, label: '1.5x' },
      { value: 2.0, label: '2x' }
    ];
  }

  /**
   * Apply preferences to video player
   */
  applyPlayerPreferences(playerElement) {
    const preferences = this.getPreferences();
    
    if (playerElement) {
      try {
        // Apply volume
        if (preferences.volume !== undefined) {
          playerElement.volume = preferences.volume / 100;
        }
        
        // Apply playback speed
        if (preferences.playbackSpeed !== undefined) {
          playerElement.playbackRate = preferences.playbackSpeed;
        }
        
        // Apply autoplay
        if (preferences.autoPlay !== undefined) {
          playerElement.autoplay = preferences.autoPlay;
        }
        
      } catch (error) {
        console.error('Failed to apply player preferences:', error);
      }
    }
  }

  /**
   * Get preferences for analytics
   */
  getAnalyticsPreferences() {
    const preferences = this.getPreferences();
    return {
      analyticsConsent: preferences.analyticsConsent,
      trackWatchHistory: preferences.trackWatchHistory,
      shareWatchActivity: preferences.shareWatchActivity
    };
  }

  /**
   * Check if user has given analytics consent
   */
  hasAnalyticsConsent() {
    return this.getPreference('analyticsConsent');
  }

  /**
   * Update analytics consent
   */
  setAnalyticsConsent(consent) {
    return this.setPreference('analyticsConsent', consent);
  }
}

// Create and export singleton instance
const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;
