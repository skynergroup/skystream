import streamingServices from '../streamingServices';

describe('StreamingServices', () => {
  describe('getVidsrcMovieUrl', () => {
    test('generates basic movie URL', () => {
      const url = streamingServices.getVidsrcMovieUrl(299534);

      expect(url).toBe('https://vidsrc-embed.ru/embed/movie?tmdb=299534&autoplay=1');
    });

    test('includes sub_url when provided', () => {
      const url = streamingServices.getVidsrcMovieUrl(299534, {
        sub_url: 'https://example.com/subs.vtt',
      });

      expect(url).toContain('sub_url=https%3A%2F%2Fexample.com%2Fsubs.vtt');
    });

    test('includes ds_lang when provided', () => {
      const url = streamingServices.getVidsrcMovieUrl(299534, {
        ds_lang: 'en',
      });

      expect(url).toContain('ds_lang=en');
    });

    test('respects custom autoplay setting', () => {
      const url = streamingServices.getVidsrcMovieUrl(299534, {
        autoplay: 0,
      });

      expect(url).toContain('autoplay=0');
    });

    test('includes all options when provided', () => {
      const url = streamingServices.getVidsrcMovieUrl(299534, {
        sub_url: 'https://example.com/subs.vtt',
        ds_lang: 'en',
        autoplay: 0,
      });

      expect(url).toContain('sub_url=');
      expect(url).toContain('ds_lang=en');
      expect(url).toContain('autoplay=0');
    });
  });

  describe('getVidsrcTVUrl', () => {
    test('generates basic TV URL without season/episode', () => {
      const url = streamingServices.getVidsrcTVUrl(1399);

      expect(url).toBe('https://vidsrc-embed.ru/embed/tv?tmdb=1399&autoplay=1');
    });

    test('includes season and episode when provided', () => {
      const url = streamingServices.getVidsrcTVUrl(1399, 1, 1);

      expect(url).toContain('season=1');
      expect(url).toContain('episode=1');
      expect(url).toContain('autonext=0');
    });

    test('includes sub_url when provided', () => {
      const url = streamingServices.getVidsrcTVUrl(1399, 1, 1, {
        sub_url: 'https://example.com/subs.vtt',
      });

      expect(url).toContain('sub_url=https%3A%2F%2Fexample.com%2Fsubs.vtt');
    });

    test('includes ds_lang when provided', () => {
      const url = streamingServices.getVidsrcTVUrl(1399, 1, 1, {
        ds_lang: 'en',
      });

      expect(url).toContain('ds_lang=en');
    });

    test('respects custom autoplay setting', () => {
      const url = streamingServices.getVidsrcTVUrl(1399, 1, 1, {
        autoplay: 0,
      });

      expect(url).toContain('autoplay=0');
    });

    test('respects custom autonext setting', () => {
      const url = streamingServices.getVidsrcTVUrl(1399, 1, 1, {
        autonext: 1,
      });

      expect(url).toContain('autonext=1');
    });

    test('does not include autonext without season/episode', () => {
      const url = streamingServices.getVidsrcTVUrl(1399);

      expect(url).not.toContain('autonext');
    });
  });

  describe('getVideasyMovieUrl', () => {
    test('generates basic movie URL', () => {
      const url = streamingServices.getVideasyMovieUrl(299534);

      expect(url).toContain('https://player.videasy.net/movie/299534');
      expect(url).toContain('color=8B5CF6');
      expect(url).toContain('overlay=true');
      expect(url).toContain('autoplay=1');
    });

    test('includes custom color', () => {
      const url = streamingServices.getVideasyMovieUrl(299534, {
        color: 'FF0000',
      });

      expect(url).toContain('color=FF0000');
    });

    test('includes progress when provided', () => {
      const url = streamingServices.getVideasyMovieUrl(299534, {
        progress: 50,
      });

      expect(url).toContain('progress=50');
    });

    test('respects overlay setting', () => {
      const url = streamingServices.getVideasyMovieUrl(299534, {
        overlay: false,
      });

      expect(url).not.toContain('overlay=true');
    });

    test('respects autoplay setting', () => {
      const url = streamingServices.getVideasyMovieUrl(299534, {
        autoplay: 0,
      });

      expect(url).toContain('autoplay=0');
    });
  });

  describe('getVideasyTVUrl', () => {
    test('generates basic TV URL', () => {
      const url = streamingServices.getVideasyTVUrl(1399, 1, 1);

      expect(url).toContain('https://player.videasy.net/tv/1399/1/1');
      expect(url).toContain('color=8B5CF6');
      expect(url).toContain('nextEpisode=true');
      expect(url).toContain('episodeSelector=true');
      expect(url).toContain('autoplayNextEpisode=true');
      expect(url).toContain('overlay=true');
    });

    test('includes custom color', () => {
      const url = streamingServices.getVideasyTVUrl(1399, 1, 1, {
        color: 'FF0000',
      });

      expect(url).toContain('color=FF0000');
    });

    test('includes progress when provided', () => {
      const url = streamingServices.getVideasyTVUrl(1399, 1, 1, {
        progress: 50,
      });

      expect(url).toContain('progress=50');
    });

    test('respects nextEpisode setting', () => {
      const url = streamingServices.getVideasyTVUrl(1399, 1, 1, {
        nextEpisode: false,
      });

      expect(url).not.toContain('nextEpisode=');
    });

    test('respects episodeSelector setting', () => {
      const url = streamingServices.getVideasyTVUrl(1399, 1, 1, {
        episodeSelector: false,
      });

      expect(url).not.toContain('episodeSelector=');
    });

    test('respects autoplayNextEpisode setting', () => {
      const url = streamingServices.getVideasyTVUrl(1399, 1, 1, {
        autoplayNextEpisode: false,
      });

      expect(url).not.toContain('autoplayNextEpisode=');
    });
  });

  describe('getAllStreamingUrls', () => {
    test('generates URLs for movie content', () => {
      const content = {
        id: 299534,
        type: 'movie',
      };

      const urls = streamingServices.getAllStreamingUrls(content);

      expect(urls.vidsrc).toContain('vidsrc-embed.ru/embed/movie');
      expect(urls.vidsrc).toContain('tmdb=299534');
      expect(urls.videasy).toContain('videasy.net/movie/299534');
    });

    test('generates URLs for TV content', () => {
      const content = {
        id: 1399,
        type: 'tv',
      };

      const urls = streamingServices.getAllStreamingUrls(content);

      expect(urls.vidsrc).toContain('vidsrc-embed.ru/embed/tv');
      expect(urls.vidsrc).toContain('tmdb=1399');
      expect(urls.videasy).toContain('videasy.net/tv/1399');
    });

    test('includes season and episode for TV content', () => {
      const content = {
        id: 1399,
        type: 'tv',
      };

      const urls = streamingServices.getAllStreamingUrls(content, {
        season: 2,
        episode: 5,
      });

      expect(urls.vidsrc).toContain('season=2');
      expect(urls.vidsrc).toContain('episode=5');
      expect(urls.videasy).toContain('/tv/1399/2/5');
    });

    test('returns empty object for unknown content type', () => {
      const content = { id: 1, type: 'unknown' };
      const urls = streamingServices.getAllStreamingUrls(content);

      expect(urls).toEqual({});
    });
  });

  describe('getVideasyAnimeUrl', () => {
    test('generates anime URL with episode', () => {
      const url = streamingServices.getVideasyAnimeUrl(12345, 5);

      expect(url).toContain('/anime/12345/5');
    });

    test('generates anime URL without episode', () => {
      const url = streamingServices.getVideasyAnimeUrl(12345, 0);

      expect(url).toContain('/anime/12345');
      expect(url).not.toContain('/0');
    });

    test('includes dub parameter when specified', () => {
      const url = streamingServices.getVideasyAnimeUrl(12345, 1, { dub: true });

      expect(url).toContain('dub=true');
    });

    test('includes color parameter when specified', () => {
      const url = streamingServices.getVideasyAnimeUrl(12345, 1, { color: 'red' });

      expect(url).toContain('color=red');
    });

    test('includes progress parameter when specified', () => {
      const url = streamingServices.getVideasyAnimeUrl(12345, 1, { progress: 50 });

      expect(url).toContain('progress=50');
    });

    test('includes nextEpisode parameter by default', () => {
      const url = streamingServices.getVideasyAnimeUrl(12345, 1);

      expect(url).toContain('nextEpisode=true');
    });

    test('includes episodeSelector parameter by default', () => {
      const url = streamingServices.getVideasyAnimeUrl(12345, 1);

      expect(url).toContain('episodeSelector=true');
    });

    test('includes autoplayNextEpisode parameter by default', () => {
      const url = streamingServices.getVideasyAnimeUrl(12345, 1);

      expect(url).toContain('autoplayNextEpisode=true');
    });

    test('includes overlay parameter by default', () => {
      const url = streamingServices.getVideasyAnimeUrl(12345, 1);

      expect(url).toContain('overlay=true');
    });

    test('excludes autoplayNextEpisode when set to false', () => {
      const url = streamingServices.getVideasyAnimeUrl(12345, 1, { autoplayNextEpisode: false });

      expect(url).not.toContain('autoplayNextEpisode');
    });

    test('excludes overlay when set to false', () => {
      const url = streamingServices.getVideasyAnimeUrl(12345, 1, { overlay: false });

      expect(url).not.toContain('overlay');
    });
  });

  describe('getVidsrcLatestMovies', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    test('fetches latest movies from Vidsrc API', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await streamingServices.getVidsrcLatestMovies();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/movies/latest/page-1.json'));
    });

    test('includes page parameter', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await streamingServices.getVidsrcLatestMovies(2);

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/movies/latest/page-2.json'));
    });

    test('handles fetch errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(streamingServices.getVidsrcLatestMovies()).rejects.toThrow('Network error');
    });

    test('handles non-ok response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(streamingServices.getVidsrcLatestMovies()).rejects.toThrow(
        'Failed to fetch latest movies'
      );
    });
  });

  describe('getVidsrcLatestTVShows', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    test('fetches latest TV shows from Vidsrc API', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await streamingServices.getVidsrcLatestTVShows();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/tvshows/latest/page-1.json'));
    });

    test('includes page parameter', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await streamingServices.getVidsrcLatestTVShows(3);

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/tvshows/latest/page-3.json'));
    });

    test('handles non-ok response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(streamingServices.getVidsrcLatestTVShows()).rejects.toThrow(
        'Failed to fetch latest TV shows'
      );
    });
  });

  describe('getVidsrcLatestEpisodes', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    test('fetches latest episodes from Vidsrc API', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await streamingServices.getVidsrcLatestEpisodes();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/episodes/latest/page-1.json'));
    });

    test('includes page parameter', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await streamingServices.getVidsrcLatestEpisodes(4);

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/episodes/latest/page-4.json'));
    });

    test('handles non-ok response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(streamingServices.getVidsrcLatestEpisodes()).rejects.toThrow(
        'Failed to fetch latest episodes'
      );
    });
  });
});
