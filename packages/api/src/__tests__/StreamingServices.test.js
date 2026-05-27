import { describe, it, expect } from '@jest/globals';
import streamingServices from '../streaming/StreamingServices.js';

describe('StreamingServices', () => {
  describe('Vidsrc URL generation', () => {
    it('builds a movie embed URL on the primary domain', () => {
      expect(streamingServices.getVidsrcMovieUrl(550)).toBe(
        'https://vidsrc-embed.ru/embed/movie?tmdb=550&autoplay=1'
      );
    });

    it('builds a TV embed URL with season and episode', () => {
      expect(streamingServices.getVidsrcTVUrl(1399, 2, 5)).toBe(
        'https://vidsrc-embed.ru/embed/tv?tmdb=1399&season=2&episode=5&autoplay=1&autonext=0'
      );
    });

    it('omits season/episode when they are not supplied', () => {
      expect(streamingServices.getVidsrcTVUrl(1399)).toBe(
        'https://vidsrc-embed.ru/embed/tv?tmdb=1399&autoplay=1'
      );
    });

    it('encodes the sub_url option', () => {
      const url = streamingServices.getVidsrcMovieUrl(550, {
        sub_url: 'https://x.com/s.vtt',
      });
      expect(url).toContain('sub_url=https%3A%2F%2Fx.com%2Fs.vtt');
    });
  });

  describe('Videasy URL generation', () => {
    it('builds a movie URL with default overlay/color/autoplay params', () => {
      const url = streamingServices.getVideasyMovieUrl(550);
      expect(url.startsWith('https://player.videasy.net/movie/550?')).toBe(true);
      expect(url).toContain('color=8B5CF6');
      expect(url).toContain('overlay=true');
      expect(url).toContain('autoplay=1');
    });

    it('builds a TV URL with the season/episode path segment', () => {
      const url = streamingServices.getVideasyTVUrl(1399, 3, 4);
      expect(url.startsWith('https://player.videasy.net/tv/1399/3/4?')).toBe(true);
      expect(url).toContain('nextEpisode=true');
      expect(url).toContain('episodeSelector=true');
    });

    it('builds an anime URL with episode segment and dub flag', () => {
      const url = streamingServices.getVideasyAnimeUrl(21, 12, { dub: true });
      expect(url.startsWith('https://player.videasy.net/anime/21/12?')).toBe(true);
      expect(url).toContain('dub=true');
    });

    it('omits the episode segment for anime when episode is 0', () => {
      const url = streamingServices.getVideasyAnimeUrl(21, 0);
      expect(url.startsWith('https://player.videasy.net/anime/21?')).toBe(true);
      expect(url).not.toMatch(/anime\/21\/0/);
    });
  });

  describe('mirror URL generation', () => {
    it('selects the mirror domain for the given index', () => {
      expect(streamingServices.getVidsrcMirrorUrl(1, 550, 'movie')).toBe(
        'https://vidsrc-embed.su/embed/movie?tmdb=550&autoplay=1'
      );
    });

    it('includes season/episode/autonext for tv content', () => {
      expect(streamingServices.getVidsrcMirrorUrl(2, 1399, 'tv', 1, 2)).toBe(
        'https://vidsrcme.su/embed/tv?tmdb=1399&season=1&episode=2&autoplay=1&autonext=0'
      );
    });

    it('falls back to the primary mirror for an out-of-range index', () => {
      const url = streamingServices.getVidsrcMirrorUrl(99, 550, 'movie');
      expect(url.startsWith('https://vidsrc-embed.ru/embed/movie')).toBe(true);
    });
  });

  describe('getAllStreamingUrls', () => {
    it('returns 4 vidsrc mirrors + videasy for a movie with legacy aliases', () => {
      const urls = streamingServices.getAllStreamingUrls({ id: 550, type: 'movie' });

      expect(Object.keys(urls)).toEqual(
        expect.arrayContaining([
          'server1',
          'server2',
          'server3',
          'server4',
          'server5',
          'vidsrc',
          'videasy',
        ])
      );
      expect(urls.vidsrc).toBe(urls.server1);
      expect(urls.videasy).toBe(urls.server5);
      expect(urls.server5).toContain('player.videasy.net/movie/550');
    });

    it('threads season/episode through every tv server', () => {
      const urls = streamingServices.getAllStreamingUrls(
        { id: 1399, type: 'tv' },
        { season: 1, episode: 1 }
      );

      expect(urls.server1).toContain('season=1&episode=1');
      expect(urls.server5).toContain('/tv/1399/1/1');
    });
  });
});
