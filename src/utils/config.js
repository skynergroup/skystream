/**
 * Application Configuration
 * Centralizes all environment variables and provides defaults
 */

// Helper function to get environment variable with fallback
const getEnvVar = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

// Helper function to get boolean environment variable
const getBooleanEnvVar = (key, defaultValue = false) => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

// Application Configuration
export const APP_CONFIG = {
  name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'SkyStream'),
  version: getEnvVar('NEXT_PUBLIC_APP_VERSION', '2.0.0'),
  description: getEnvVar(
    'NEXT_PUBLIC_APP_DESCRIPTION',
    'Your ultimate destination for streaming movies and TV shows'
  ),
  isDev: process.env.NODE_ENV === 'development',
  enableLogs: getBooleanEnvVar(
    'NEXT_PUBLIC_ENABLE_CONSOLE_LOGS',
    process.env.NODE_ENV === 'development'
  ),
};

// API Configuration
export const API_CONFIG = {
  tmdb: {
    apiKey: getEnvVar('NEXT_PUBLIC_TMDB_API_KEY'),
    baseUrl: getEnvVar('NEXT_PUBLIC_TMDB_BASE_URL', 'https://api.themoviedb.org/3'),
    imageBaseUrl: getEnvVar('NEXT_PUBLIC_TMDB_IMAGE_BASE_URL', 'https://image.tmdb.org/t/p'),
    defaultPosterSize: getEnvVar('NEXT_PUBLIC_DEFAULT_POSTER_SIZE', 'w500'),
    defaultBackdropSize: getEnvVar('NEXT_PUBLIC_DEFAULT_BACKDROP_SIZE', 'w1280'),
  },
};

// Video Player Configuration
export const PLAYER_CONFIG = {
  videasy: {
    baseUrl: getEnvVar('NEXT_PUBLIC_VIDEASY_BASE_URL', 'https://player.videasy.net'),
  },
  vidsrc: {
    baseUrl: getEnvVar('NEXT_PUBLIC_VIDSRC_BASE_URL', 'https://vidsrc-embed.ru/embed'),
    mirrors: [
      getEnvVar('NEXT_PUBLIC_VIDSRC_MIRROR_1', 'https://vidsrc-embed.ru/embed'),
      getEnvVar('NEXT_PUBLIC_VIDSRC_MIRROR_2', 'https://vidsrc-embed.su/embed'),
      getEnvVar('NEXT_PUBLIC_VIDSRC_MIRROR_3', 'https://vidsrcme.su/embed'),
      getEnvVar('NEXT_PUBLIC_VIDSRC_MIRROR_4', 'https://vsrc.su/embed'),
    ],
    downloadUrl: getEnvVar('NEXT_PUBLIC_VIDSRC_DOWNLOAD_URL', 'https://dl.vidsrc.vip'),
  },

  defaults: {
    player: getEnvVar('NEXT_PUBLIC_DEFAULT_PLAYER', 'videasy'),
    color: getEnvVar('NEXT_PUBLIC_PLAYER_COLOR', 'e50914'),
    autoPlay: getBooleanEnvVar('NEXT_PUBLIC_AUTO_PLAY', true),
    language: 'en',
  },
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  enabled: getBooleanEnvVar('NEXT_PUBLIC_ENABLE_ANALYTICS', true), // Enable analytics by default for testing
  trackingId: getEnvVar('NEXT_PUBLIC_GA_TRACKING_ID', 'G-CR3ZVV9BE1'),
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
        // Add TV-specific options for better user experience
        playerOptions.nextEpisode = 'true';
        playerOptions.episodeSelector = 'true';
        playerOptions.autoplayNextEpisode = 'true';
      } else if (contentType === 'anime') {
        if (episode) {
          // For anime episodes, use anilist ID format
          url = `${PLAYER_CONFIG.videasy.baseUrl}/anime/${contentId}/${episode}`;
        } else {
          // For anime movies
          url = `${PLAYER_CONFIG.videasy.baseUrl}/anime/${contentId}`;
        }
        // Add dub option for anime - default to sub (false) unless specified
        if (!Object.prototype.hasOwnProperty.call(playerOptions, 'dub')) {
          playerOptions.dub = 'false'; // Default to sub
        }
      }

      // Clean up playerOptions - remove undefined/null values
      const cleanOptions = {};
      Object.keys(playerOptions).forEach(key => {
        if (playerOptions[key] !== undefined && playerOptions[key] !== null) {
          cleanOptions[key] = playerOptions[key];
        }
      });

      const params = new URLSearchParams(cleanOptions);
      return `${url}?${params}`;
    }

    if (player === 'vidsrc') {
      let url = '';

      if (contentType === 'movie') {
        // VidSrc movie format: https://vidsrc.xyz/embed/movie?tmdb=TMDB_ID
        url = `${PLAYER_CONFIG.vidsrc.baseUrl}/movie?tmdb=${contentId}`;
      } else if (contentType === 'tv' || contentType === 'anime') {
        // VidSrc TV format: https://vidsrc.xyz/embed/tv?tmdb=TMDB_ID&season=SEASON&episode=EPISODE
        url = `${PLAYER_CONFIG.vidsrc.baseUrl}/tv?tmdb=${contentId}&season=${season}&episode=${episode}`;

        // Add VidSrc specific options for TV shows
        if (playerOptions.autoplay !== 'false') {
          url += '&autoplay=1';
        }
        url += '&autonext=1'; // Enable auto next episode
      }

      // Add subtitle language if specified
      if (playerOptions.language && playerOptions.language !== 'en') {
        url += `&ds_lang=${playerOptions.language}`;
      }

      return url;
    }

    return '';
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
  getDownloadUrl: (contentId, contentType = 'movie', season = null, episode = null) => {
    const baseUrl = PLAYER_CONFIG.vidsrc.downloadUrl;
    if (contentType === 'movie') {
      return `${baseUrl}/movie/${contentId}`;
    } else if (contentType === 'tv' || contentType === 'anime') {
      // For TV shows and anime, include season and episode in the URL
      if (season && episode) {
        return `${baseUrl}/tv/${contentId}/${season}/${episode}`;
      } else {
        // Fallback to generic TV URL if season/episode not provided
        return `${baseUrl}/tv/${contentId}`;
      }
    }
    return `${baseUrl}/movie/${contentId}`; // Default fallback
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
