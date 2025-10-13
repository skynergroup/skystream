import streamingTest from '../streamingTest';
import tmdbApi from '../../services/tmdbApi';
import streamingServices from '../../services/streamingServices';

// Mock the services
jest.mock('../../services/tmdbApi');
jest.mock('../../services/streamingServices');

describe('StreamingTest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear console mocks
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('testSearch', () => {
    test('successfully searches for content', async () => {
      const mockResults = {
        results: [
          {
            id: 1,
            title: 'Avengers',
            media_type: 'movie',
            release_date: '2012-04-25',
          },
        ],
      };

      const mockTransformed = {
        id: 1,
        title: 'Avengers',
        type: 'movie',
        release_date: '2012-04-25',
      };

      tmdbApi.search.mockResolvedValue(mockResults);
      tmdbApi.transformContent.mockReturnValue(mockTransformed);

      const result = await streamingTest.testSearch('avengers');

      expect(tmdbApi.search).toHaveBeenCalledWith('avengers');
      expect(tmdbApi.transformContent).toHaveBeenCalledWith(mockResults.results[0]);
      expect(result).toEqual(mockTransformed);
      expect(console.log).toHaveBeenCalledWith('[SEARCH] Testing search for: "avengers"');
      expect(console.log).toHaveBeenCalledWith('[SUCCESS] Search successful: 1 results found');
    });

    test('handles search with no results', async () => {
      const mockResults = {
        results: [],
      };

      tmdbApi.search.mockResolvedValue(mockResults);

      const result = await streamingTest.testSearch('nonexistent');

      expect(result).toBeUndefined();
      expect(console.log).toHaveBeenCalledWith('[SUCCESS] Search successful: 0 results found');
    });

    test('handles search error', async () => {
      const error = new Error('API Error');
      tmdbApi.search.mockRejectedValue(error);

      await expect(streamingTest.testSearch('test')).rejects.toThrow('API Error');
      expect(console.error).toHaveBeenCalledWith('[ERROR] Search failed:', error);
    });
  });

  describe('testStreamingUrls', () => {
    test('generates streaming URLs for content', () => {
      const mockContent = {
        id: 1,
        title: 'Test Movie',
        type: 'movie',
      };

      const mockUrls = {
        vidsrc: 'https://vidsrc.to/embed/movie/1',
        videasy: 'https://videasy.to/embed/movie/1',
      };

      streamingServices.getAllStreamingUrls.mockReturnValue(mockUrls);

      const result = streamingTest.testStreamingUrls(mockContent);

      expect(streamingServices.getAllStreamingUrls).toHaveBeenCalledWith(mockContent);
      expect(result).toEqual(mockUrls);
      expect(console.log).toHaveBeenCalledWith('[STREAMING] Testing streaming URLs for: "Test Movie"');
      expect(console.log).toHaveBeenCalledWith('[SUCCESS] Streaming URLs generated:');
    });

    test('handles URL generation error', () => {
      const mockContent = {
        id: 1,
        title: 'Test Movie',
        type: 'movie',
      };

      const error = new Error('URL Generation Error');
      streamingServices.getAllStreamingUrls.mockImplementation(() => {
        throw error;
      });

      expect(() => streamingTest.testStreamingUrls(mockContent)).toThrow('URL Generation Error');
      expect(console.error).toHaveBeenCalledWith('[ERROR] URL generation failed:', error);
    });
  });

  describe('testMovieUrls', () => {
    test('generates movie URLs', () => {
      const vidsrcUrl = 'https://vidsrc.to/embed/movie/299534';
      const videasyUrl = 'https://videasy.to/embed/movie/299534';

      streamingServices.getVidsrcMovieUrl.mockReturnValue(vidsrcUrl);
      streamingServices.getVideasyMovieUrl.mockReturnValue(videasyUrl);

      const result = streamingTest.testMovieUrls();

      expect(streamingServices.getVidsrcMovieUrl).toHaveBeenCalledWith(299534);
      expect(streamingServices.getVideasyMovieUrl).toHaveBeenCalledWith(299534);
      expect(result).toEqual({ vidsrc: vidsrcUrl, videasy: videasyUrl });
      expect(console.log).toHaveBeenCalledWith('[MOVIE] Testing movie URL generation...');
      expect(console.log).toHaveBeenCalledWith('[SUCCESS] Movie URLs:');
    });
  });

  describe('testTVUrls', () => {
    test('generates TV show URLs', () => {
      const vidsrcUrl = 'https://vidsrc.to/embed/tv/1399/1/1';
      const videasyUrl = 'https://videasy.to/embed/tv/1399/1/1';

      streamingServices.getVidsrcTVUrl.mockReturnValue(vidsrcUrl);
      streamingServices.getVideasyTVUrl.mockReturnValue(videasyUrl);

      const result = streamingTest.testTVUrls();

      expect(streamingServices.getVidsrcTVUrl).toHaveBeenCalledWith(1399, 1, 1);
      expect(streamingServices.getVideasyTVUrl).toHaveBeenCalledWith(1399, 1, 1);
      expect(result).toEqual({ vidsrc: vidsrcUrl, videasy: videasyUrl });
      expect(console.log).toHaveBeenCalledWith('[TV] Testing TV show URL generation...');
      expect(console.log).toHaveBeenCalledWith('[SUCCESS] TV Show URLs (S01E01):');
    });
  });

  describe('runFullTest', () => {
    test('runs full test suite successfully', async () => {
      const mockSearchResult = {
        id: 1,
        title: 'Avengers',
        type: 'movie',
      };

      const mockUrls = {
        vidsrc: 'https://vidsrc.to/embed/movie/1',
        videasy: 'https://videasy.to/embed/movie/1',
      };

      tmdbApi.search.mockResolvedValue({
        results: [{ id: 1, title: 'Avengers' }],
      });
      tmdbApi.transformContent.mockReturnValue(mockSearchResult);
      streamingServices.getAllStreamingUrls.mockReturnValue(mockUrls);
      streamingServices.getVidsrcMovieUrl.mockReturnValue(mockUrls.vidsrc);
      streamingServices.getVideasyMovieUrl.mockReturnValue(mockUrls.videasy);
      streamingServices.getVidsrcTVUrl.mockReturnValue('https://vidsrc.to/embed/tv/1399/1/1');
      streamingServices.getVideasyTVUrl.mockReturnValue('https://videasy.to/embed/tv/1399/1/1');

      const result = await streamingTest.runFullTest();

      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('[TEST SUITE] Starting SkyStream streaming test suite...\n');
      expect(console.log).toHaveBeenCalledWith('[SUCCESS] All tests completed successfully!');
    });

    test('handles test suite failure', async () => {
      const error = new Error('Test failed');
      tmdbApi.search.mockRejectedValue(error);

      const result = await streamingTest.runFullTest();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('[ERROR] Test suite failed:', error);
    });
  });

  describe('testVidsrcLatest', () => {
    test('fetches latest content from Vidsrc API', async () => {
      const mockMovies = [{ id: 1, title: 'Movie 1' }];
      const mockTVShows = [{ id: 2, title: 'Show 1' }];
      const mockEpisodes = [{ id: 3, title: 'Episode 1' }];

      streamingServices.getVidsrcLatestMovies = jest.fn().mockResolvedValue(mockMovies);
      streamingServices.getVidsrcLatestTVShows = jest.fn().mockResolvedValue(mockTVShows);
      streamingServices.getVidsrcLatestEpisodes = jest.fn().mockResolvedValue(mockEpisodes);

      const result = await streamingTest.testVidsrcLatest();

      expect(streamingServices.getVidsrcLatestMovies).toHaveBeenCalledWith(1);
      expect(streamingServices.getVidsrcLatestTVShows).toHaveBeenCalledWith(1);
      expect(streamingServices.getVidsrcLatestEpisodes).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        movies: mockMovies,
        tvShows: mockTVShows,
        episodes: mockEpisodes,
      });
      expect(console.log).toHaveBeenCalledWith('[API] Testing Vidsrc latest content API...');
    });

    test('handles Vidsrc API error', async () => {
      const error = new Error('API Error');
      streamingServices.getVidsrcLatestMovies = jest.fn().mockRejectedValue(error);

      await expect(streamingTest.testVidsrcLatest()).rejects.toThrow('API Error');
      expect(console.error).toHaveBeenCalledWith('[ERROR] Vidsrc API test failed:', error);
    });

    test('handles null responses from Vidsrc API', async () => {
      streamingServices.getVidsrcLatestMovies = jest.fn().mockResolvedValue(null);
      streamingServices.getVidsrcLatestTVShows = jest.fn().mockResolvedValue(null);
      streamingServices.getVidsrcLatestEpisodes = jest.fn().mockResolvedValue(null);

      const result = await streamingTest.testVidsrcLatest();

      expect(console.log).toHaveBeenCalledWith('[SUCCESS] Latest movies: 0 items');
      expect(console.log).toHaveBeenCalledWith('[SUCCESS] Latest TV shows: 0 items');
      expect(console.log).toHaveBeenCalledWith('[SUCCESS] Latest episodes: 0 items');
      expect(result).toEqual({
        movies: null,
        tvShows: null,
        episodes: null,
      });
    });
  });
});

