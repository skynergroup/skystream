/**
 * Watch History Service
 * Manages user's watch history, progress tracking, and viewing statistics
 */

import { analytics } from '../utils';

class WatchHistoryService {
  constructor() {
    this.STORAGE_KEY = 'skystream_watch_history';
    this.PROGRESS_KEY = 'skystream_watch_progress';
    this.PREFERENCES_KEY = 'skystream_user_preferences';
    this.MAX_HISTORY_ITEMS = 500; // Limit history to prevent storage bloat
  }

  /**
   * Add or update a watch history entry
   */
  addToHistory(content, watchData = {}) {
    try {
      const history = this.getHistory();
      const now = new Date().toISOString();
      
      const historyItem = {
        id: content.id,
        type: content.type,
        title: content.title || content.name,
        poster_path: content.poster_path,
        backdrop_path: content.backdrop_path,
        overview: content.overview,
        vote_average: content.vote_average,
        release_date: content.release_date || content.first_air_date,
        genres: content.genres || [],
        
        // Watch specific data
        watched_at: now,
        last_watched: now,
        watch_count: 1,
        
        // Episode data for TV shows/anime
        season: watchData.season || null,
        episode: watchData.episode || null,
        episode_title: watchData.episode_title || null,
        
        // Progress tracking
        progress: watchData.progress || 0, // Percentage watched (0-100)
        duration: watchData.duration || null, // Total duration in seconds
        current_time: watchData.current_time || 0, // Current playback time in seconds
        
        // Player data
        player_used: watchData.player_used || 'unknown',
        quality: watchData.quality || null,
        
        // Additional metadata
        ...content
      };

      // Check if item already exists
      const existingIndex = history.findIndex(
        item => item.id === content.id && 
                item.type === content.type &&
                item.season === (watchData.season || null) &&
                item.episode === (watchData.episode || null)
      );

      if (existingIndex !== -1) {
        // Update existing entry
        const existing = history[existingIndex];
        historyItem.watch_count = (existing.watch_count || 1) + 1;
        historyItem.first_watched = existing.watched_at || now;
        history[existingIndex] = historyItem;
      } else {
        // Add new entry at the beginning
        historyItem.first_watched = now;
        history.unshift(historyItem);
      }

      // Limit history size
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history.splice(this.MAX_HISTORY_ITEMS);
      }

      this.saveHistory(history);
      
      // Track analytics
      analytics.trackEvent('content_watched', {
        category: 'watch_history',
        label: `${content.type}_${content.id}`,
        content_type: content.type,
        content_id: content.id,
        content_title: content.title || content.name,
        season: watchData.season,
        episode: watchData.episode,
        progress: watchData.progress,
        player_used: watchData.player_used
      });

      return historyItem;
    } catch (error) {
      console.error('Failed to add to watch history:', error);
      return null;
    }
  }

  /**
   * Update watch progress for a specific item
   */
  updateProgress(contentId, contentType, progressData) {
    try {
      const progress = this.getProgress();
      const key = this.getProgressKey(contentId, contentType, progressData.season, progressData.episode);
      
      const progressItem = {
        content_id: contentId,
        content_type: contentType,
        season: progressData.season || null,
        episode: progressData.episode || null,
        progress: progressData.progress || 0,
        current_time: progressData.current_time || 0,
        duration: progressData.duration || null,
        updated_at: new Date().toISOString(),
        player_used: progressData.player_used || 'unknown'
      };

      progress[key] = progressItem;
      this.saveProgress(progress);

      // Also update history if item exists
      this.updateHistoryProgress(contentId, contentType, progressData);

      return progressItem;
    } catch (error) {
      console.error('Failed to update watch progress:', error);
      return null;
    }
  }

  /**
   * Get watch progress for a specific item
   */
  getItemProgress(contentId, contentType, season = null, episode = null) {
    try {
      const progress = this.getProgress();
      const key = this.getProgressKey(contentId, contentType, season, episode);
      return progress[key] || null;
    } catch (error) {
      console.error('Failed to get item progress:', error);
      return null;
    }
  }

  /**
   * Get full watch history
   */
  getHistory() {
    try {
      const history = localStorage.getItem(this.STORAGE_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get watch history:', error);
      return [];
    }
  }

  /**
   * Get recent watch history (last N items)
   */
  getRecentHistory(limit = 20) {
    const history = this.getHistory();
    return history.slice(0, limit);
  }

  /**
   * Get continue watching items (items with progress < 90%)
   */
  getContinueWatching(limit = 10) {
    const history = this.getHistory();
    return history
      .filter(item => item.progress > 5 && item.progress < 90) // 5% to 90% watched
      .slice(0, limit);
  }

  /**
   * Get watch statistics
   */
  getWatchStats() {
    const history = this.getHistory();
    
    const stats = {
      total_items: history.length,
      total_watch_time: 0,
      movies_watched: 0,
      tv_episodes_watched: 0,
      anime_episodes_watched: 0,
      favorite_genres: {},
      most_used_player: {},
      watch_streak: 0
    };

    history.forEach(item => {
      // Count by type
      if (item.type === 'movie') {
        stats.movies_watched++;
      } else if (item.type === 'tv') {
        stats.tv_episodes_watched++;
      } else if (item.type === 'anime') {
        stats.anime_episodes_watched++;
      }

      // Track genres
      if (item.genres) {
        item.genres.forEach(genre => {
          const genreName = genre.name || genre;
          stats.favorite_genres[genreName] = (stats.favorite_genres[genreName] || 0) + 1;
        });
      }

      // Track player usage
      const player = item.player_used || 'unknown';
      stats.most_used_player[player] = (stats.most_used_player[player] || 0) + 1;

      // Estimate watch time (rough calculation)
      if (item.duration && item.progress) {
        stats.total_watch_time += (item.duration * item.progress / 100);
      }
    });

    return stats;
  }

  /**
   * Clear watch history
   */
  clearHistory() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.PROGRESS_KEY);
      
      analytics.trackEvent('history_cleared', {
        category: 'user_action',
        label: 'watch_history_cleared'
      });
      
      return true;
    } catch (error) {
      console.error('Failed to clear watch history:', error);
      return false;
    }
  }

  /**
   * Remove specific item from history
   */
  removeFromHistory(contentId, contentType, season = null, episode = null) {
    try {
      const history = this.getHistory();
      const filteredHistory = history.filter(item => 
        !(item.id === contentId && 
          item.type === contentType &&
          item.season === season &&
          item.episode === episode)
      );
      
      this.saveHistory(filteredHistory);
      
      // Also remove progress
      const progress = this.getProgress();
      const key = this.getProgressKey(contentId, contentType, season, episode);
      delete progress[key];
      this.saveProgress(progress);
      
      return true;
    } catch (error) {
      console.error('Failed to remove from watch history:', error);
      return false;
    }
  }

  // Private helper methods
  getProgress() {
    try {
      const progress = localStorage.getItem(this.PROGRESS_KEY);
      return progress ? JSON.parse(progress) : {};
    } catch (error) {
      console.error('Failed to get progress data:', error);
      return {};
    }
  }

  saveHistory(history) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }

  saveProgress(progress) {
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
  }

  getProgressKey(contentId, contentType, season, episode) {
    return `${contentType}_${contentId}_${season || 'null'}_${episode || 'null'}`;
  }

  updateHistoryProgress(contentId, contentType, progressData) {
    const history = this.getHistory();
    const itemIndex = history.findIndex(item => 
      item.id === contentId && 
      item.type === contentType &&
      item.season === (progressData.season || null) &&
      item.episode === (progressData.episode || null)
    );

    if (itemIndex !== -1) {
      history[itemIndex] = {
        ...history[itemIndex],
        progress: progressData.progress,
        current_time: progressData.current_time,
        duration: progressData.duration,
        last_watched: new Date().toISOString()
      };
      this.saveHistory(history);
    }
  }
}

// Create and export singleton instance
const watchHistoryService = new WatchHistoryService();
export default watchHistoryService;
