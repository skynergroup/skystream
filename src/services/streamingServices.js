/**
 * Streaming Services API
 * Handles embed URL generation for Vidsrc and Videasy platforms
 */

class StreamingServices {
  constructor() {
    // Vidsrc domains (use vidsrc.xyz as primary)
    this.vidsrcDomain = 'https://vidsrc.xyz';
    
    // Videasy domain
    this.videasyDomain = 'https://player.videasy.net';
  }

  /**
   * Generate Vidsrc embed URL for movies
   */
  getVidsrcMovieUrl(tmdbId, options = {}) {
    const { sub_url, ds_lang, autoplay = 1 } = options;
    
    let url = `${this.vidsrcDomain}/embed/movie?tmdb=${tmdbId}`;
    
    if (sub_url) {
      url += `&sub_url=${encodeURIComponent(sub_url)}`;
    }
    
    if (ds_lang) {
      url += `&ds_lang=${ds_lang}`;
    }
    
    url += `&autoplay=${autoplay}`;
    
    return url;
  }

  /**
   * Generate Vidsrc embed URL for TV shows
   */
  getVidsrcTVUrl(tmdbId, season = null, episode = null, options = {}) {
    const { sub_url, ds_lang, autoplay = 1, autonext = 0 } = options;
    
    let url = `${this.vidsrcDomain}/embed/tv?tmdb=${tmdbId}`;
    
    if (season && episode) {
      url += `&season=${season}&episode=${episode}`;
    }
    
    if (sub_url) {
      url += `&sub_url=${encodeURIComponent(sub_url)}`;
    }
    
    if (ds_lang) {
      url += `&ds_lang=${ds_lang}`;
    }
    
    url += `&autoplay=${autoplay}`;
    
    if (season && episode) {
      url += `&autonext=${autonext}`;
    }
    
    return url;
  }

  /**
   * Generate Videasy embed URL for movies
   */
  getVideasyMovieUrl(tmdbId, options = {}) {
    const { 
      color = '8B5CF6', 
      progress, 
      overlay = true,
      autoplay = 1 
    } = options;
    
    let url = `${this.videasyDomain}/movie/${tmdbId}`;
    
    const params = new URLSearchParams();
    
    if (color) params.append('color', color);
    if (progress) params.append('progress', progress);
    if (overlay) params.append('overlay', 'true');
    if (autoplay !== undefined) params.append('autoplay', autoplay);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Generate Videasy embed URL for TV shows
   */
  getVideasyTVUrl(tmdbId, season = 1, episode = 1, options = {}) {
    const { 
      color = '8B5CF6', 
      progress, 
      nextEpisode = true,
      episodeSelector = true,
      autoplayNextEpisode = true,
      overlay = true 
    } = options;
    
    let url = `${this.videasyDomain}/tv/${tmdbId}/${season}/${episode}`;
    
    const params = new URLSearchParams();
    
    if (color) params.append('color', color);
    if (progress) params.append('progress', progress);
    if (nextEpisode) params.append('nextEpisode', 'true');
    if (episodeSelector) params.append('episodeSelector', 'true');
    if (autoplayNextEpisode) params.append('autoplayNextEpisode', 'true');
    if (overlay) params.append('overlay', 'true');
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Generate Videasy embed URL for anime
   */
  getVideasyAnimeUrl(anilistId, episode = 1, options = {}) {
    const { 
      dub = false, 
      color = '8B5CF6', 
      progress, 
      nextEpisode = true,
      episodeSelector = true,
      autoplayNextEpisode = true,
      overlay = true 
    } = options;
    
    let url = `${this.videasyDomain}/anime/${anilistId}`;
    
    // For anime shows, add episode number
    if (episode > 0) {
      url += `/${episode}`;
    }
    
    const params = new URLSearchParams();
    
    if (dub) params.append('dub', 'true');
    if (color) params.append('color', color);
    if (progress) params.append('progress', progress);
    if (nextEpisode) params.append('nextEpisode', 'true');
    if (episodeSelector) params.append('episodeSelector', 'true');
    if (autoplayNextEpisode) params.append('autoplayNextEpisode', 'true');
    if (overlay) params.append('overlay', 'true');
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Get all available streaming URLs for a content item
   */
  getAllStreamingUrls(content, options = {}) {
    const { season, episode } = options;
    const urls = {};

    if (content.type === 'movie') {
      urls.vidsrc = this.getVidsrcMovieUrl(content.id, options);
      urls.videasy = this.getVideasyMovieUrl(content.id, options);
    } else if (content.type === 'tv') {
      urls.vidsrc = this.getVidsrcTVUrl(content.id, season, episode, options);
      urls.videasy = this.getVideasyTVUrl(content.id, season, episode, options);
    }

    return urls;
  }

  /**
   * Get latest content from Vidsrc API
   */
  async getVidsrcLatestMovies(page = 1) {
    try {
      const response = await fetch(`${this.vidsrcDomain}/movies/latest/page-${page}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch latest movies: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch Vidsrc latest movies:', error);
      throw error;
    }
  }

  /**
   * Get latest TV shows from Vidsrc API
   */
  async getVidsrcLatestTVShows(page = 1) {
    try {
      const response = await fetch(`${this.vidsrcDomain}/tvshows/latest/page-${page}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch latest TV shows: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch Vidsrc latest TV shows:', error);
      throw error;
    }
  }

  /**
   * Get latest episodes from Vidsrc API
   */
  async getVidsrcLatestEpisodes(page = 1) {
    try {
      const response = await fetch(`${this.vidsrcDomain}/episodes/latest/page-${page}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch latest episodes: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch Vidsrc latest episodes:', error);
      throw error;
    }
  }
}

// Export singleton instance
const streamingServices = new StreamingServices();
export default streamingServices;
