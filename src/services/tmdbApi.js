import { API_CONFIG, utils } from '../utils/config';

/**
 * TMDB API Service
 * Handles all interactions with The Movie Database API
 */

class TMDBApi {
  constructor() {
    this.baseUrl = API_CONFIG.tmdb.baseUrl;
    this.apiKey = API_CONFIG.tmdb.apiKey;
    this.imageBaseUrl = API_CONFIG.tmdb.imageBaseUrl;
  }

  /**
   * Make API request to TMDB
   */
  async makeRequest(endpoint, params = {}) {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      url.searchParams.append('api_key', this.apiKey);
      
      // Add additional parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      utils.log('TMDB API Request:', url.toString());

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      utils.error('TMDB API Request failed:', error);
      throw error;
    }
  }

  /**
   * Get trending content (movies, TV shows, people)
   */
  async getTrending(mediaType = 'all', timeWindow = 'week') {
    return this.makeRequest(`/trending/${mediaType}/${timeWindow}`);
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(page = 1) {
    return this.makeRequest('/movie/popular', { page });
  }

  /**
   * Get popular TV shows
   */
  async getPopularTVShows(page = 1) {
    return this.makeRequest('/tv/popular', { page });
  }

  /**
   * Get top rated movies
   */
  async getTopRatedMovies(page = 1) {
    return this.makeRequest('/movie/top_rated', { page });
  }

  /**
   * Get top rated TV shows
   */
  async getTopRatedTVShows(page = 1) {
    return this.makeRequest('/tv/top_rated', { page });
  }

  /**
   * Get now playing movies
   */
  async getNowPlayingMovies(page = 1) {
    return this.makeRequest('/movie/now_playing', { page });
  }

  /**
   * Get upcoming movies
   */
  async getUpcomingMovies(page = 1) {
    return this.makeRequest('/movie/upcoming', { page });
  }

  /**
   * Get airing today TV shows
   */
  async getAiringTodayTVShows(page = 1) {
    return this.makeRequest('/tv/airing_today', { page });
  }

  /**
   * Get on the air TV shows
   */
  async getOnTheAirTVShows(page = 1) {
    return this.makeRequest('/tv/on_the_air', { page });
  }

  /**
   * Search for movies, TV shows, or people
   */
  async search(query, page = 1) {
    return this.makeRequest('/search/multi', { query, page });
  }

  /**
   * Search specifically for movies
   */
  async searchMovies(query, page = 1) {
    return this.makeRequest('/search/movie', { query, page });
  }

  /**
   * Search specifically for TV shows
   */
  async searchTVShows(query, page = 1) {
    return this.makeRequest('/search/tv', { query, page });
  }

  /**
   * Get movie details
   */
  async getMovieDetails(movieId) {
    return this.makeRequest(`/movie/${movieId}`, {
      append_to_response: 'videos,credits,similar,recommendations'
    });
  }

  /**
   * Get TV show details
   */
  async getTVShowDetails(tvId) {
    return this.makeRequest(`/tv/${tvId}`, {
      append_to_response: 'videos,credits,similar,recommendations'
    });
  }

  /**
   * Get TV show season details
   */
  async getTVSeasonDetails(tvId, seasonNumber) {
    return this.makeRequest(`/tv/${tvId}/season/${seasonNumber}`);
  }

  /**
   * Get movie genres
   */
  async getMovieGenres() {
    return this.makeRequest('/genre/movie/list');
  }

  /**
   * Get TV genres
   */
  async getTVGenres() {
    return this.makeRequest('/genre/tv/list');
  }

  /**
   * Discover movies with filters
   */
  async discoverMovies(params = {}) {
    return this.makeRequest('/discover/movie', params);
  }

  /**
   * Discover TV shows with filters
   */
  async discoverTVShows(params = {}) {
    return this.makeRequest('/discover/tv', params);
  }

  /**
   * Get anime content (using genre filtering)
   * TMDB doesn't have a specific anime endpoint, so we filter by animation genre
   */
  async getAnimeContent(page = 1) {
    // Get animation genre ID first
    const genres = await this.getTVGenres();
    const animationGenre = genres.genres.find(g => g.name === 'Animation');
    
    if (!animationGenre) {
      return { results: [], total_pages: 0, total_results: 0 };
    }

    // Discover animated TV shows with Japanese origin
    return this.makeRequest('/discover/tv', {
      with_genres: animationGenre.id,
      with_origin_country: 'JP',
      sort_by: 'popularity.desc',
      page
    });
  }

  /**
   * Transform TMDB data to our app format
   */
  transformContent(item) {
    const isMovie = item.media_type === 'movie' || item.title;
    const isTVShow = item.media_type === 'tv' || item.name;
    
    return {
      id: item.id,
      title: item.title || item.name,
      name: item.name || item.title,
      overview: item.overview,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      release_date: item.release_date || item.first_air_date,
      first_air_date: item.first_air_date || item.release_date,
      vote_average: item.vote_average,
      vote_count: item.vote_count,
      popularity: item.popularity,
      genre_ids: item.genre_ids,
      adult: item.adult,
      original_language: item.original_language,
      original_title: item.original_title || item.original_name,
      original_name: item.original_name || item.original_title,
      type: isMovie ? 'movie' : isTVShow ? 'tv' : 'unknown',
      media_type: item.media_type || (isMovie ? 'movie' : 'tv')
    };
  }

  /**
   * Get content for homepage
   */
  async getHomePageContent() {
    try {
      const [trending, popularMovies, popularTV, topRatedMovies] = await Promise.all([
        this.getTrending('all', 'week'),
        this.getPopularMovies(),
        this.getPopularTVShows(),
        this.getTopRatedMovies()
      ]);

      return {
        featured: trending.results[0] ? this.transformContent(trending.results[0]) : null,
        trending: trending.results.slice(0, 20).map(item => this.transformContent(item)),
        popularMovies: popularMovies.results.slice(0, 20).map(item => this.transformContent(item)),
        popularTV: popularTV.results.slice(0, 20).map(item => this.transformContent(item)),
        topRated: topRatedMovies.results.slice(0, 20).map(item => this.transformContent(item))
      };
    } catch (error) {
      utils.error('Failed to fetch homepage content:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const tmdbApi = new TMDBApi();
export default tmdbApi;
