import { describe, it, expect } from '@jest/globals';
import {
  APP_CONFIG,
  TMDB_DEFAULTS,
  PLAYER_DEFAULTS,
  getTMDBImageUrl,
  getPosterUrl,
  getBackdropUrl,
  getDownloadUrl,
} from '../config/index.js';

describe('shared config', () => {
  describe('getTMDBImageUrl', () => {
    it('builds a URL with the default poster size', () => {
      expect(getTMDBImageUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
    });

    it('returns null for a missing path', () => {
      expect(getTMDBImageUrl(null)).toBeNull();
      expect(getTMDBImageUrl('')).toBeNull();
      expect(getTMDBImageUrl(undefined)).toBeNull();
    });

    it('honours a custom size', () => {
      expect(getTMDBImageUrl('/abc.jpg', 'original')).toBe(
        'https://image.tmdb.org/t/p/original/abc.jpg'
      );
    });
  });

  describe('getPosterUrl / getBackdropUrl', () => {
    it('getPosterUrl uses the default poster size (w500)', () => {
      expect(getPosterUrl('/p.jpg')).toBe('https://image.tmdb.org/t/p/w500/p.jpg');
    });

    it('getBackdropUrl uses the default backdrop size (w1280)', () => {
      expect(getBackdropUrl('/b.jpg')).toBe('https://image.tmdb.org/t/p/w1280/b.jpg');
    });

    it('both return null when the path is missing', () => {
      expect(getPosterUrl(null)).toBeNull();
      expect(getBackdropUrl(null)).toBeNull();
    });
  });

  describe('getDownloadUrl', () => {
    it('builds a movie download URL by default', () => {
      expect(getDownloadUrl(550)).toBe('https://dl.vidsrc.vip/movie/550');
    });

    it('builds a TV download URL without season/episode', () => {
      expect(getDownloadUrl(1399, 'tv')).toBe('https://dl.vidsrc.vip/tv/1399');
    });

    it('builds a TV download URL with season and episode', () => {
      expect(getDownloadUrl(1399, 'tv', 2, 3)).toBe('https://dl.vidsrc.vip/tv/1399/2/3');
    });
  });

  describe('config constants', () => {
    it('APP_CONFIG exposes name, version, and description', () => {
      expect(APP_CONFIG.name).toBe('SkyStream');
      expect(APP_CONFIG.version).toEqual(expect.any(String));
      expect(APP_CONFIG.description).toEqual(expect.any(String));
    });

    it('TMDB_DEFAULTS exposes base/image URLs and default sizes', () => {
      expect(TMDB_DEFAULTS.baseUrl).toMatch(/themoviedb\.org/);
      expect(TMDB_DEFAULTS.imageBaseUrl).toMatch(/image\.tmdb\.org/);
      expect(TMDB_DEFAULTS.defaultPosterSize).toBe('w500');
      expect(TMDB_DEFAULTS.defaultBackdropSize).toBe('w1280');
    });

    it('PLAYER_DEFAULTS exposes the player and download URLs', () => {
      expect(PLAYER_DEFAULTS.videasyBaseUrl).toMatch(/videasy/);
      expect(PLAYER_DEFAULTS.vidsrcDownloadUrl).toMatch(/dl\.vidsrc/);
      expect(PLAYER_DEFAULTS.defaultPlayer).toBe('videasy');
    });
  });
});
