import { TMDBApi } from '@skystream/api';

let Config = {};
try {
  Config = require('react-native-config').default || {};
} catch (e) {
  // react-native-config may not be available in all environments
}

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
