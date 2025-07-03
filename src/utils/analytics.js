import { ANALYTICS_CONFIG } from './config';

// Google Analytics utility functions
class Analytics {
  constructor() {
    this.isInitialized = false;
    this.trackingId = ANALYTICS_CONFIG.trackingId;
    this.enabled = ANALYTICS_CONFIG.enabled;
  }

  // Initialize Google Analytics
  init() {
    if (!this.enabled || !this.trackingId || this.isInitialized) {
      return;
    }

    try {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      
      // Define gtag function
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      // Initialize with current date
      window.gtag('js', new Date());
      
      // Configure with tracking ID
      window.gtag('config', this.trackingId, {
        page_title: document.title,
        page_location: window.location.href,
      });

      this.isInitialized = true;
      console.log('[Analytics] Google Analytics initialized with ID:', this.trackingId);
    } catch (error) {
      console.error('[Analytics] Failed to initialize Google Analytics:', error);
    }
  }

  // Track page views
  trackPageView(path, title) {
    if (!this.isReady()) return;

    try {
      window.gtag('config', this.trackingId, {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href,
      });
      
      console.log('[Analytics] Page view tracked:', path);
    } catch (error) {
      console.error('[Analytics] Failed to track page view:', error);
    }
  }

  // Track custom events
  trackEvent(eventName, parameters = {}) {
    if (!this.isReady()) return;

    try {
      window.gtag('event', eventName, {
        event_category: parameters.category || 'engagement',
        event_label: parameters.label,
        value: parameters.value,
        ...parameters,
      });
      
      console.log('[Analytics] Event tracked:', eventName, parameters);
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  // Track content interactions with detailed metadata
  trackContentView(contentType, contentId, contentTitle, metadata = {}) {
    this.trackEvent('content_view', {
      category: 'content',
      label: `${contentType}_${contentId}`,
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
      content_genre: metadata.genres?.join(', ') || 'Unknown',
      content_year: metadata.year || 'Unknown',
      content_rating: metadata.rating || 'Unknown',
      content_runtime: metadata.runtime || 'Unknown',
      content_language: metadata.language || 'Unknown',
    });

    // Track specific content type popularity
    this.trackEvent(`${contentType}_view`, {
      category: `${contentType}_popularity`,
      label: contentTitle,
      content_id: contentId,
      content_title: contentTitle,
      content_genre: metadata.genres?.join(', ') || 'Unknown',
      content_year: metadata.year || 'Unknown',
      content_rating: metadata.rating || 'Unknown',
      value: 1, // For counting views
    });
  }

  // Track search queries
  trackSearch(searchTerm, resultCount = null) {
    this.trackEvent('search', {
      category: 'search',
      label: searchTerm,
      search_term: searchTerm,
      result_count: resultCount,
    });
  }

  // Track video player interactions with player info
  trackVideoEvent(action, contentType, contentId, contentTitle, playerInfo = {}) {
    this.trackEvent('video_' + action, {
      category: 'video',
      label: `${contentType}_${contentId}`,
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
      video_action: action,
      player_type: playerInfo.player || 'unknown',
      player_quality: playerInfo.quality || 'unknown',
      season: playerInfo.season || null,
      episode: playerInfo.episode || null,
    });

    // Track player usage statistics
    if (playerInfo.player) {
      this.trackEvent('player_usage', {
        category: 'player_analytics',
        label: playerInfo.player,
        player_type: playerInfo.player,
        content_type: contentType,
        action: action,
        value: 1,
      });
    }
  }

  // Track user engagement
  trackEngagement(action, category = 'engagement', label = null) {
    this.trackEvent(action, {
      category: category,
      label: label,
    });
  }

  // Track errors
  trackError(errorMessage, errorCategory = 'javascript_error') {
    this.trackEvent('exception', {
      category: errorCategory,
      label: errorMessage,
      description: errorMessage,
      fatal: false,
    });
  }

  // Check if analytics is ready
  isReady() {
    if (!this.enabled) {
      console.log('[Analytics] Analytics is disabled');
      return false;
    }

    if (!this.trackingId) {
      console.warn('[Analytics] No tracking ID configured');
      return false;
    }

    if (!this.isInitialized) {
      console.warn('[Analytics] Analytics not initialized');
      return false;
    }

    if (typeof window.gtag !== 'function') {
      console.warn('[Analytics] gtag function not available');
      return false;
    }

    return true;
  }

  // Track popular movies specifically
  trackMovieView(movieId, movieTitle, metadata = {}) {
    this.trackEvent('popular_movie', {
      category: 'movie_popularity',
      label: movieTitle,
      movie_id: movieId,
      movie_title: movieTitle,
      movie_genre: metadata.genres?.join(', ') || 'Unknown',
      movie_year: metadata.year || 'Unknown',
      movie_rating: metadata.rating || 'Unknown',
      movie_runtime: metadata.runtime || 'Unknown',
      value: 1,
    });
  }

  // Track popular TV series specifically
  trackSeriesView(seriesId, seriesTitle, metadata = {}) {
    this.trackEvent('popular_series', {
      category: 'series_popularity',
      label: seriesTitle,
      series_id: seriesId,
      series_title: seriesTitle,
      series_genre: metadata.genres?.join(', ') || 'Unknown',
      series_year: metadata.year || 'Unknown',
      series_rating: metadata.rating || 'Unknown',
      series_seasons: metadata.seasons || 'Unknown',
      value: 1,
    });
  }

  // Track popular anime specifically
  trackAnimeView(animeId, animeTitle, metadata = {}) {
    this.trackEvent('popular_anime', {
      category: 'anime_popularity',
      label: animeTitle,
      anime_id: animeId,
      anime_title: animeTitle,
      anime_genre: metadata.genres?.join(', ') || 'Unknown',
      anime_year: metadata.year || 'Unknown',
      anime_rating: metadata.rating || 'Unknown',
      anime_episodes: metadata.episodes || 'Unknown',
      value: 1,
    });
  }

  // Track episode views for series/anime
  trackEpisodeView(contentType, contentId, contentTitle, season, episode, metadata = {}) {
    this.trackEvent('episode_view', {
      category: `${contentType}_episodes`,
      label: `${contentTitle} S${season}E${episode}`,
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
      season: season,
      episode: episode,
      episode_title: metadata.episodeTitle || `Episode ${episode}`,
      value: 1,
    });
  }

  // Track player performance and preferences
  trackPlayerPerformance(playerType, contentType, performance = {}) {
    this.trackEvent('player_performance', {
      category: 'player_analytics',
      label: `${playerType}_${contentType}`,
      player_type: playerType,
      content_type: contentType,
      load_time: performance.loadTime || null,
      success_rate: performance.success ? 1 : 0,
      error_type: performance.errorType || null,
      value: performance.success ? 1 : 0,
    });
  }

  // Track genre preferences
  trackGenreInteraction(genre, contentType, action = 'view') {
    this.trackEvent('genre_preference', {
      category: 'content_preferences',
      label: `${genre}_${contentType}`,
      genre: genre,
      content_type: contentType,
      action: action,
      value: 1,
    });
  }

  // Track user viewing patterns
  trackViewingSession(sessionData = {}) {
    this.trackEvent('viewing_session', {
      category: 'user_behavior',
      label: 'session_data',
      session_duration: sessionData.duration || null,
      content_count: sessionData.contentCount || 1,
      content_types: sessionData.contentTypes?.join(', ') || 'unknown',
      players_used: sessionData.playersUsed?.join(', ') || 'unknown',
      value: sessionData.contentCount || 1,
    });
  }

  // Set user properties
  setUserProperty(propertyName, value) {
    if (!this.isReady()) return;

    try {
      window.gtag('config', this.trackingId, {
        custom_map: {
          [propertyName]: value,
        },
      });

      console.log('[Analytics] User property set:', propertyName, value);
    } catch (error) {
      console.error('[Analytics] Failed to set user property:', error);
    }
  }

  // Enable/disable analytics
  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled && !this.isInitialized) {
      this.init();
    }
  }
}

// Create singleton instance
const analytics = new Analytics();

// Make analytics available globally for testing in development
if (process.env.NODE_ENV === 'development') {
  window.skyStreamAnalytics = analytics;
  console.log('🧪 Analytics available globally as window.skyStreamAnalytics for testing');
}

// Export both the class and instance
export { Analytics };
export default analytics;
