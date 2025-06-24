/**
 * Application Configuration
 * Centralizes all environment variables and provides defaults
 */

// Helper function to get environment variable with fallback
const getEnvVar = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

// Helper function to get boolean environment variable
const getBooleanEnvVar = (key, defaultValue = false) => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

// Application Configuration
export const APP_CONFIG = {
  name: getEnvVar('VITE_APP_NAME', 'Boredflix'),
  version: getEnvVar('VITE_APP_VERSION', '2.0.0'),
  description: getEnvVar('VITE_APP_DESCRIPTION', 'Your ultimate destination for discovering movies and TV shows'),
  isDev: getBooleanEnvVar('VITE_DEV_MODE', import.meta.env.DEV),
  enableLogs: getBooleanEnvVar('VITE_ENABLE_CONSOLE_LOGS', import.meta.env.DEV)
};

// API Configuration
export const API_CONFIG = {
  tmdb: {
    apiKey: getEnvVar('VITE_TMDB_API_KEY'),
    baseUrl: getEnvVar('VITE_TMDB_BASE_URL', 'https://api.themoviedb.org/3'),
    imageBaseUrl: getEnvVar('VITE_TMDB_IMAGE_BASE_URL', 'https://image.tmdb.org/t/p'),
    defaultPosterSize: getEnvVar('VITE_DEFAULT_POSTER_SIZE', 'w500'),
    defaultBackdropSize: getEnvVar('VITE_DEFAULT_BACKDROP_SIZE', 'w1280')
  }
};

// Video Player Configuration
export const PLAYER_CONFIG = {
  videasy: {
    baseUrl: getEnvVar('VITE_VIDEASY_BASE_URL', 'https://player.videasy.net')
  },
  vidsrc: {
    baseUrl: getEnvVar('VITE_VIDSRC_BASE_URL', 'https://v2.vidsrc.me/embed'),
    downloadUrl: getEnvVar('VITE_VIDSRC_DOWNLOAD_URL', 'https://dl.vidsrc.me')
  },
  defaults: {
    player: getEnvVar('VITE_DEFAULT_PLAYER', 'videasy'),
    color: getEnvVar('VITE_PLAYER_COLOR', 'e50914'),
    autoPlay: getBooleanEnvVar('VITE_AUTO_PLAY', true)
  }
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  enabled: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
  trackingId: getEnvVar('VITE_GA_TRACKING_ID')
};

// Utility Functions
export const utils = {
  // Generate TMDB image URL
  getTMDBImageUrl: (path, size = API_CONFIG.tmdb.defaultPosterSize) => {
    if (!path) return null;
    return `${API_CONFIG.tmdb.imageBaseUrl}/${size}${path}`;
  },

  // Generate poster URL
  getPosterUrl: (path) => {
    return utils.getTMDBImageUrl(path, API_CONFIG.tmdb.defaultPosterSize);
  },

  // Generate backdrop URL
  getBackdropUrl: (path) => {
    return utils.getTMDBImageUrl(path, API_CONFIG.tmdb.defaultBackdropSize);
  },

  // Generate video player URL
  generatePlayerUrl: (player, contentId, contentType, season = null, episode = null, options = {}) => {
    const playerOptions = {
      color: PLAYER_CONFIG.defaults.color,
      autoplay: PLAYER_CONFIG.defaults.autoPlay ? 'true' : 'false',
      ...options
    };

    if (player === 'videasy') {
      let url = '';
      
      if (contentType === 'movie') {
        url = `${PLAYER_CONFIG.videasy.baseUrl}/movie/${contentId}`;
      } else if (contentType === 'tv') {
        url = `${PLAYER_CONFIG.videasy.baseUrl}/tv/${contentId}/${season}/${episode}`;
        // Add TV-specific options
        playerOptions.nextEpisode = 'true';
        playerOptions.episodeSelector = 'true';
        playerOptions.autoplayNextEpisode = 'true';
      } else if (contentType === 'anime') {
        if (episode) {
          url = `${PLAYER_CONFIG.videasy.baseUrl}/anime/${contentId}/${episode}`;
        } else {
          url = `${PLAYER_CONFIG.videasy.baseUrl}/anime/${contentId}`;
        }
        // Default to subtitled
        if (!playerOptions.hasOwnProperty('dub')) {
          playerOptions.dub = 'false';
        }
      }
      
      const params = new URLSearchParams(playerOptions);
      return `${url}?${params}`;
    } 
    
    if (player === 'vidsrc') {
      let url = `${PLAYER_CONFIG.vidsrc.baseUrl}/${contentId}`;
      
      if (contentType === 'tv' && season && episode) {
        url += `/${season}-${episode}`;
      }
      
      // Add color customization
      url += `/color-${playerOptions.color}`;
      
      return url;
    }
    
    return '';
  },

  // Generate download URL
  getDownloadUrl: (contentId) => {
    return `${PLAYER_CONFIG.vidsrc.downloadUrl}/${contentId}`;
  },

  // Log function that respects environment settings
  log: (...args) => {
    if (APP_CONFIG.enableLogs) {
      console.log('[Boredflix]', ...args);
    }
  },

  // Error log function
  error: (...args) => {
    if (APP_CONFIG.enableLogs) {
      console.error('[Boredflix Error]', ...args);
    }
  },

  // Warn log function
  warn: (...args) => {
    if (APP_CONFIG.enableLogs) {
      console.warn('[Boredflix Warning]', ...args);
    }
  }
};

// Export all configurations as default
export default {
  APP_CONFIG,
  API_CONFIG,
  PLAYER_CONFIG,
  ANALYTICS_CONFIG,
  utils
};
