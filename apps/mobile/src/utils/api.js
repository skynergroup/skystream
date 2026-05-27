import { TMDBApi } from '@skystream/api';

let Config = {};
try {
  Config = require('react-native-config').default || {};
} catch {
  // react-native-config may not be available in all environments
}

// Dev default only. TMDB API keys are free, read-only, and non-secret, so a
// hardcoded fallback is acceptable for local development. In production the key
// must come from react-native-config (Config.TMDB_API_KEY) via the build env.
const DEFAULTS = {
  apiKey: '20aed25855723af6f6a4dcdad0f17b86',
  baseUrl: 'https://api.themoviedb.org/3',
  imageBaseUrl: 'https://image.tmdb.org/t/p',
};

const tmdbApi = new TMDBApi({
  apiKey: Config.TMDB_API_KEY || DEFAULTS.apiKey,
  baseUrl: Config.TMDB_BASE_URL || DEFAULTS.baseUrl,
  imageBaseUrl: Config.TMDB_IMAGE_BASE_URL || DEFAULTS.imageBaseUrl,
});

export default tmdbApi;
