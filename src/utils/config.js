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
  name: getEnvVar('VITE_APP_NAME', 'SkyStream'),
  version: getEnvVar('VITE_APP_VERSION', '2.0.0'),
  description: getEnvVar(
    'VITE_APP_DESCRIPTION',
    'Your ultimate destination for streaming movies and TV shows'
  ),
  isDev: getBooleanEnvVar('VITE_DEV_MODE', import.meta.env.DEV),
  enableLogs: getBooleanEnvVar('VITE_ENABLE_CONSOLE_LOGS', import.meta.env.DEV),
};

// API Configuration
export const API_CONFIG = {
  tmdb: {
    apiKey: getEnvVar('VITE_TMDB_API_KEY'),
    baseUrl: getEnvVar('VITE_TMDB_BASE_URL', 'https://api.themoviedb.org/3'),
    imageBaseUrl: getEnvVar('VITE_TMDB_IMAGE_BASE_URL', 'https://image.tmdb.org/t/p'),
    defaultPosterSize: getEnvVar('VITE_DEFAULT_POSTER_SIZE', 'w500'),
    defaultBackdropSize: getEnvVar('VITE_DEFAULT_BACKDROP_SIZE', 'w1280'),
  },
};

// Video Player Configuration
export const PLAYER_CONFIG = {
  videasy: {
    baseUrl: getEnvVar('VITE_VIDEASY_BASE_URL', 'https://player.videasy.net'),
  },
  vidsrc: {
    baseUrl: getEnvVar('VITE_VIDSRC_BASE_URL', 'https://v2.vidsrc.me/embed'),
    downloadUrl: getEnvVar('VITE_VIDSRC_DOWNLOAD_URL', 'https://dl.vidsrc.me'),
  },
  godrive: {
    baseUrl: 'https://godriveplayer.com/player.php',
  },
  defaults: {
    player: getEnvVar('VITE_DEFAULT_PLAYER', 'godrive'),
    color: getEnvVar('VITE_PLAYER_COLOR', 'e50914'),
    autoPlay: getBooleanEnvVar('VITE_AUTO_PLAY', true),
    language: 'en',
  },
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  enabled: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
  trackingId: getEnvVar('VITE_GA_TRACKING_ID'),
};

// Utility Functions
export const utils = {
  // Generate TMDB image URL
  getTMDBImageUrl: (path, size = API_CONFIG.tmdb.defaultPosterSize) => {
    if (!path) return null;
    return `${API_CONFIG.tmdb.imageBaseUrl}/${size}${path}`;
  },

  // Generate poster URL
  getPosterUrl: path => {
    return utils.getTMDBImageUrl(path, API_CONFIG.tmdb.defaultPosterSize);
  },

  // Generate backdrop URL
  getBackdropUrl: path => {
    return utils.getTMDBImageUrl(path, API_CONFIG.tmdb.defaultBackdropSize);
  },

  // Generate video player URL (synchronous version)
  generatePlayerUrl: (
    player,
    contentId,
    contentType,
    season = null,
    episode = null,
    options = {}
  ) => {
    const playerOptions = {
      color: PLAYER_CONFIG.defaults.color,
      autoplay: PLAYER_CONFIG.defaults.autoPlay ? 'true' : 'false',
      language: PLAYER_CONFIG.defaults.language,
      ...options,
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
        // Default to subtitled for English
        if (!Object.prototype.hasOwnProperty.call(playerOptions, 'dub')) {
          playerOptions.dub = playerOptions.language === 'en' ? 'false' : 'true';
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

    if (player === 'godrive') {
      if (contentType === 'movie') {
        // For movies, use TMDB ID directly for now
        // We'll fetch IMDB ID asynchronously in the component
        return `${PLAYER_CONFIG.godrive.baseUrl}?tmdb=${contentId}`;
      } else if (contentType === 'tv' || contentType === 'anime') {
        // For TV shows, use TMDB ID directly
        return `${PLAYER_CONFIG.godrive.baseUrl}?type=series&tmdb=${contentId}&season=${season}&episode=${episode}`;
      }
    }

    return '';
  },

  // Generate video player URL with IMDB support (async version)
  generatePlayerUrlAsync: async (
    player,
    contentId,
    contentType,
    season = null,
    episode = null,
    options = {}
  ) => {
    if (player === 'godrive' && contentType === 'movie') {
      // For GoDrive movies, try to get IMDB ID
      try {
        const imdbId = await utils.getIMDBId(contentId, 'movie');
        if (imdbId) {
          return `${PLAYER_CONFIG.godrive.baseUrl}?imdb=${imdbId}`;
        }
      } catch (error) {
        console.warn('Failed to get IMDB ID for movie:', contentId, error);
      }
      // Fallback to TMDB ID
      return `${PLAYER_CONFIG.godrive.baseUrl}?tmdb=${contentId}`;
    }

    // For all other cases, use the synchronous version
    return utils.generatePlayerUrl(player, contentId, contentType, season, episode, options);
  },

  // Get IMDB ID from TMDB
  getIMDBId: async (tmdbId, type = 'movie') => {
    try {
      const apiKey = API_CONFIG.tmdb.apiKey;
      const baseUrl = API_CONFIG.tmdb.baseUrl;

      if (!apiKey) {
        throw new Error('TMDB API key not configured');
      }

      const url = `${baseUrl}/${type}/${tmdbId}/external_ids?api_key=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch external IDs: ${response.status}`);
      }

      const data = await response.json();
      return data.imdb_id;
    } catch (error) {
      console.error('Failed to get IMDB ID:', error);
      return null;
    }
  },

  // Generate download URL
  getDownloadUrl: contentId => {
    return `${PLAYER_CONFIG.vidsrc.downloadUrl}/${contentId}`;
  },

  // Log function that respects environment settings
  log: (...args) => {
    if (APP_CONFIG.enableLogs) {
      console.log('[SkyStream]', ...args);
    }
  },

  // Error log function
  error: (...args) => {
    if (APP_CONFIG.enableLogs) {
      console.error('[SkyStream Error]', ...args);
    }
  },

  // Warn log function
  warn: (...args) => {
    if (APP_CONFIG.enableLogs) {
      console.warn('[SkyStream Warning]', ...args);
    }
  },
};

// Export all configurations as default
export default {
  APP_CONFIG,
  API_CONFIG,
  PLAYER_CONFIG,
  ANALYTICS_CONFIG,
  utils,
};
