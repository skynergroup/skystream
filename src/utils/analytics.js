import { ANALYTICS_CONFIG } from './config';
import consentManager from './consentManager.js';

// Google Analytics utility functions with consent management
class Analytics {
  constructor() {
    this.isInitialized = false;
    this.trackingId = ANALYTICS_CONFIG.trackingId;
    this.enabled = ANALYTICS_CONFIG.enabled;
    this.consentGiven = false;

    // Set up consent change listener
    consentManager.onConsentChange((consent) => {
      this.consentGiven = consent.analytics;
      if (this.consentGiven && !this.isInitialized) {
        this.init();
      }
    });

    // Check if consent already exists
    const currentConsent = consentManager.getConsent();
    this.consentGiven = currentConsent.analytics;
  }

  // Initialize Google Analytics (only called when consent is given)
  init() {
    if (!this.enabled || !this.trackingId || this.isInitialized || !this.consentGiven) {
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

      // Configure with tracking ID and privacy settings
      window.gtag('config', this.trackingId, {
        page_title: document.title,
        page_location: window.location.href,
        anonymize_ip: true,
        respect_dnt: true,
        allow_google_signals: false, // Disable advertising features
        allow_ad_personalization_signals: false,
      });

      this.isInitialized = true;
      console.log('[Analytics] Google Analytics initialized with consent and privacy settings');
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

  // Track content interactions with comprehensive metadata
  trackContentView(contentType, contentId, contentTitle, metadata = {}) {
    const eventData = {
      category: 'content_engagement',
      label: `${contentType}_${contentId}`,
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
      content_genre: metadata.genres?.join(', ') || 'Unknown',
      content_year: metadata.year || 'Unknown',
      content_rating: metadata.rating || 'Unknown',
      content_runtime: metadata.runtime || 'Unknown',
      content_language: metadata.language || 'Unknown',
      content_country: metadata.country || 'Unknown',
      content_director: metadata.director || 'Unknown',
      content_cast: metadata.cast?.slice(0, 5).join(', ') || 'Unknown',
      content_popularity: metadata.popularity || 'Unknown',
      content_vote_average: metadata.vote_average || 'Unknown',
      content_vote_count: metadata.vote_count || 'Unknown',
      content_budget: metadata.budget || 'Unknown',
      content_revenue: metadata.revenue || 'Unknown',
      page_url: window.location.pathname,
      referrer: document.referrer || 'Direct',
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      value: 1,
    };

    this.trackEvent('content_view', eventData);

    // Track specific content type popularity
    this.trackEvent(`${contentType}_view`, {
      category: `${contentType}_popularity`,
      label: contentTitle,
      ...eventData,
    });

    // Track genre preferences for each genre (with null checks)
    if (metadata.genres && Array.isArray(metadata.genres) && metadata.genres.length > 0) {
      metadata.genres.forEach(genre => {
        if (genre && typeof genre === 'string' && genre.trim() !== '') {
          this.trackGenreInteraction(genre.trim(), contentType, 'view');
        }
      });
    }

    // Track content rating preferences
    if (metadata.rating) {
      this.trackEvent('content_rating_preference', {
        category: 'user_preferences',
        label: metadata.rating,
        content_type: contentType,
        rating: metadata.rating,
        content_id: contentId,
        value: 1,
      });
    }

    // Track year preferences
    if (metadata.year) {
      this.trackEvent('content_year_preference', {
        category: 'user_preferences',
        label: `${contentType}_${metadata.year}`,
        content_type: contentType,
        year: metadata.year,
        decade: Math.floor(metadata.year / 10) * 10,
        content_id: contentId,
        value: 1,
      });
    }
  }

  // Track detailed watch behavior - what users are actually watching
  trackWatchStart(contentType, contentId, contentTitle, metadata = {}, playerInfo = {}) {
    const eventData = {
      category: 'watch_behavior',
      label: `watch_start_${contentType}_${contentId}`,
      event_action: 'watch_start',
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
      content_genre: metadata.genres?.join(', ') || 'Unknown',
      content_year: metadata.year || 'Unknown',
      content_rating: metadata.rating || 'Unknown',
      content_runtime: metadata.runtime || 'Unknown',
      player_type: playerInfo.playerType || 'Unknown',
      player_server: playerInfo.serverName || 'Unknown',
      player_quality: playerInfo.quality || 'Unknown',
      watch_timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      page_url: window.location.pathname,
      value: 1,
    };

    this.trackEvent('watch_start', eventData);

    // Track server preference
    if (playerInfo.serverName) {
      this.trackEvent('server_preference', {
        category: 'player_preferences',
        label: playerInfo.serverName,
        server_name: playerInfo.serverName,
        content_type: contentType,
        content_id: contentId,
        value: 1,
      });
    }

    // Track player type preference
    if (playerInfo.playerType) {
      this.trackEvent('player_type_preference', {
        category: 'player_preferences',
        label: playerInfo.playerType,
        player_type: playerInfo.playerType,
        content_type: contentType,
        content_id: contentId,
        value: 1,
      });
    }
  }

  // Track when users click "Watch Now" button
  trackWatchNowClick(contentType, contentId, contentTitle, metadata = {}) {
    this.trackEvent('watch_now_click', {
      category: 'content_interaction',
      label: `watch_now_${contentType}_${contentId}`,
      event_action: 'watch_now_click',
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
      content_genre: metadata.genres?.join(', ') || 'Unknown',
      content_year: metadata.year || 'Unknown',
      content_rating: metadata.rating || 'Unknown',
      click_timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      page_url: window.location.pathname,
      value: 1,
    });
  }

  // Track search queries with enhanced metadata
  trackSearch(searchTerm, resultCount = null, filters = {}) {
    this.trackEvent('search', {
      category: 'search_behavior',
      label: searchTerm,
      search_term: searchTerm,
      result_count: resultCount,
      search_filters: JSON.stringify(filters),
      search_timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      page_url: window.location.pathname,
      value: 1,
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



  // Track detailed filter usage with comprehensive metadata
  trackFilterUsage(filterType, filterValue, contentType = null, allFilters = {}) {
    this.trackEvent('filter_usage', {
      category: 'filter_behavior',
      label: `${filterType}_${filterValue}`,
      filter_type: filterType,
      filter_value: filterValue,
      content_type: contentType,
      all_filters: JSON.stringify(allFilters),
      filter_timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      page_url: window.location.pathname,
      value: 1,
    });

    // Track filter combination patterns
    const activeFilters = Object.entries(allFilters)
      .filter(([key, value]) => value && value !== 'all')
      .map(([key, value]) => `${key}:${value}`)
      .join('|');

    if (activeFilters) {
      this.trackEvent('filter_combination', {
        category: 'filter_patterns',
        label: activeFilters,
        filter_combination: activeFilters,
        content_type: contentType,
        filter_count: Object.keys(allFilters).length,
        value: 1,
      });
    }
  }

  // Track content card interactions (clicks, hovers, etc.)
  trackContentCardInteraction(action, contentType, contentId, contentTitle, metadata = {}) {
    this.trackEvent('content_card_interaction', {
      category: 'content_discovery',
      label: `${action}_${contentType}_${contentId}`,
      event_action: action,
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
      content_genre: metadata.genres?.join(', ') || 'Unknown',
      content_year: metadata.year || 'Unknown',
      content_rating: metadata.rating || 'Unknown',
      card_position: metadata.position || 'Unknown',
      section_name: metadata.section || 'Unknown',
      interaction_timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      page_url: window.location.pathname,
      value: 1,
    });
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

    if (!this.consentGiven) {
      console.log('[Analytics] User consent not given for analytics');
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

  // Track genre preferences (consolidated function)
  trackGenreInteraction(genre, contentType, action = 'view') {
    // Skip if genre is undefined, null, or empty
    if (!genre || genre === 'undefined' || genre.trim() === '') {
      return;
    }

    this.trackEvent('genre_preference', {
      category: 'content_preferences',
      label: `${genre}_${contentType}`,
      genre: genre,
      content_type: contentType,
      action: action,
      value: 1,
    });

    // Also track genre popularity
    this.trackEvent('genre_popularity', {
      category: 'content_analytics',
      label: genre,
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

  // Generate or get session ID for tracking user sessions
  getSessionId() {
    let sessionId = sessionStorage.getItem('skystream_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('skystream_session_id', sessionId);
    }
    return sessionId;
  }

  // Track watchlist interactions
  trackWatchlistAction(action, contentType, contentId, contentTitle, metadata = {}) {
    this.trackEvent('watchlist_action', {
      category: 'watchlist_behavior',
      label: `${action}_${contentType}_${contentId}`,
      event_action: action,
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
      content_genre: metadata.genres?.join(', ') || 'Unknown',
      content_year: metadata.year || 'Unknown',
      action_timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      page_url: window.location.pathname,
      value: 1,
    });
  }

  // Track detailed page engagement (time spent, scroll depth, etc.)
  trackPageEngagement(pageType, timeSpent = null, scrollDepth = null, interactions = 0) {
    this.trackEvent('page_engagement', {
      category: 'user_engagement',
      label: pageType,
      page_type: pageType,
      time_spent_seconds: timeSpent,
      scroll_depth_percent: scrollDepth,
      interaction_count: interactions,
      engagement_timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      page_url: window.location.pathname,
      value: timeSpent || 1,
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
