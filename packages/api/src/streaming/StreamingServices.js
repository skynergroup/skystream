/**
 * Streaming Services API
 * Handles embed URL generation for Vidsrc and Videasy platforms
 */

class StreamingServices {
  // Vidsrc mirror domains — official list from https://vidsrc.domains (updated 2026-05-27)
  vidsrcDomain = 'https://vidsrcme.ru';

  vidsrcMirrors = [
    'https://vidsrcme.ru',
    'https://vidsrcme.su',
    'https://vidsrc-me.ru',
    'https://vidsrc-me.su',
    'https://vidsrc-embed.ru',
    'https://vidsrc-embed.su',
    'https://vsrc.su',
  ];

  currentVidsrcMirrorIndex = 0;

  // Videasy domain
  videasyDomain = 'https://player.videasy.net';

  constructor() {
    // Constructor is now empty but kept for future initialization if needed
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
    const { color = '8B5CF6', progress, overlay = true, autoplay = 1 } = options;

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
      overlay = true,
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
      overlay = true,
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
   * Get Vidsrc URL for a specific mirror (0-6)
   * Server 1 = vidsrcme.ru (index 0) — primary
   * Server 2 = vidsrcme.su (index 1)
   * Server 3 = vidsrc-me.ru (index 2)
   * Server 4 = vidsrc-me.su (index 3)
   * Server 5 = vidsrc-embed.ru (index 4)
   * Server 6 = vidsrc-embed.su (index 5)
   * Server 7 = vsrc.su (index 6)
   */
  getVidsrcMirrorUrl(
    mirrorIndex,
    tmdbId,
    contentType = 'movie',
    season = null,
    episode = null,
    options = {}
  ) {
    if (mirrorIndex < 0 || mirrorIndex >= this.vidsrcMirrors.length) {
      console.warn(`Invalid mirror index: ${mirrorIndex}, using default`);
      mirrorIndex = 0;
    }

    const domain = this.vidsrcMirrors[mirrorIndex];
    const { sub_url, ds_lang, autoplay = 1, autonext = 0 } = options;

    let url = `${domain}/embed/${contentType}?tmdb=${tmdbId}`;

    if (contentType === 'tv' && season && episode) {
      url += `&season=${season}&episode=${episode}`;
    }

    if (sub_url) {
      url += `&sub_url=${encodeURIComponent(sub_url)}`;
    }

    if (ds_lang) {
      url += `&ds_lang=${ds_lang}`;
    }

    url += `&autoplay=${autoplay}`;

    if (contentType === 'tv' && season && episode) {
      url += `&autonext=${autonext}`;
    }

    return url;
  }

  /**
   * Get all available streaming URLs for a content item (8 servers)
   * Servers 1-7: Vidsrc mirrors (official domains from vidsrc.domains)
   * Server 8: Videasy
   */
  getAllStreamingUrls(content, options = {}) {
    const { season, episode } = options;
    const urls = {};

    if (content.type === 'movie') {
      // Servers 1-7: Vidsrc mirrors
      urls.server1 = this.getVidsrcMirrorUrl(0, content.id, 'movie', null, null, options);
      urls.server2 = this.getVidsrcMirrorUrl(1, content.id, 'movie', null, null, options);
      urls.server3 = this.getVidsrcMirrorUrl(2, content.id, 'movie', null, null, options);
      urls.server4 = this.getVidsrcMirrorUrl(3, content.id, 'movie', null, null, options);
      urls.server5 = this.getVidsrcMirrorUrl(4, content.id, 'movie', null, null, options);
      urls.server6 = this.getVidsrcMirrorUrl(5, content.id, 'movie', null, null, options);
      urls.server7 = this.getVidsrcMirrorUrl(6, content.id, 'movie', null, null, options);
      // Server 8: Videasy
      urls.server8 = this.getVideasyMovieUrl(content.id, options);

      // Keep backward compatibility
      urls.vidsrc = urls.server1;
      urls.videasy = urls.server8;
    } else if (content.type === 'tv') {
      // Servers 1-7: Vidsrc mirrors
      urls.server1 = this.getVidsrcMirrorUrl(0, content.id, 'tv', season, episode, options);
      urls.server2 = this.getVidsrcMirrorUrl(1, content.id, 'tv', season, episode, options);
      urls.server3 = this.getVidsrcMirrorUrl(2, content.id, 'tv', season, episode, options);
      urls.server4 = this.getVidsrcMirrorUrl(3, content.id, 'tv', season, episode, options);
      urls.server5 = this.getVidsrcMirrorUrl(4, content.id, 'tv', season, episode, options);
      urls.server6 = this.getVidsrcMirrorUrl(5, content.id, 'tv', season, episode, options);
      urls.server7 = this.getVidsrcMirrorUrl(6, content.id, 'tv', season, episode, options);
      // Server 8: Videasy
      urls.server8 = this.getVideasyTVUrl(content.id, season, episode, options);

      // Keep backward compatibility
      urls.vidsrc = urls.server1;
      urls.videasy = urls.server8;
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
