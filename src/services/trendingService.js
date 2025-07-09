/**
 * Trending Service
 * Tracks and manages trending/popular content based on user interactions
 */

import { analytics } from '../utils';
import tmdbApi from './tmdbApi';

class TrendingService {
  constructor() {
    this.STORAGE_KEY = 'skystream_trending_data';
    this.VIEW_COUNTS_KEY = 'skystream_view_counts';
    this.INTERACTION_WEIGHTS = {
      view: 1,
      play: 3,
      complete: 5,
      bookmark: 2,
      watchlist: 2,
      share: 4,
      comment: 3,
      rating: 2
    };
    this.TRENDING_CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
  }

  /**
   * Track user interaction with content
   */
  trackInteraction(contentId, contentType, interactionType, metadata = {}) {
    try {
      const viewCounts = this.getViewCounts();
      const key = `${contentType}_${contentId}`;
      const now = new Date().toISOString();
      
      if (!viewCounts[key]) {
        viewCounts[key] = {
          content_id: contentId,
          content_type: contentType,
          total_score: 0,
          interactions: {},
          first_interaction: now,
          last_interaction: now,
          unique_views: 0,
          metadata: metadata
        };
      }

      const item = viewCounts[key];
      
      // Update interaction counts
      if (!item.interactions[interactionType]) {
        item.interactions[interactionType] = 0;
      }
      item.interactions[interactionType]++;
      
      // Calculate weighted score
      const weight = this.INTERACTION_WEIGHTS[interactionType] || 1;
      item.total_score += weight;
      
      // Update timestamps
      item.last_interaction = now;
      
      // Track unique views (simplified - could be enhanced with user tracking)
      if (interactionType === 'view') {
        item.unique_views++;
      }
      
      // Update metadata if provided
      if (metadata && Object.keys(metadata).length > 0) {
        item.metadata = { ...item.metadata, ...metadata };
      }

      this.saveViewCounts(viewCounts);
      
      // Track in analytics
      analytics.trackEvent('trending_interaction', {
        category: 'trending',
        label: `${interactionType}_${contentType}_${contentId}`,
        content_type: contentType,
        content_id: contentId,
        interaction_type: interactionType,
        total_score: item.total_score
      });

      return item;
    } catch (error) {
      console.error('Failed to track interaction:', error);
      return null;
    }
  }

  /**
   * Get trending content by type
   */
  async getTrending(contentType = 'all', limit = 20, timeframe = 'week') {
    try {
      const cached = this.getCachedTrending(contentType, timeframe);
      if (cached) {
        return cached;
      }

      const viewCounts = this.getViewCounts();
      const cutoffDate = this.getCutoffDate(timeframe);
      
      // Filter and sort by score
      let trendingItems = Object.values(viewCounts)
        .filter(item => {
          const isInTimeframe = new Date(item.last_interaction) >= cutoffDate;
          const isCorrectType = contentType === 'all' || item.content_type === contentType;
          return isInTimeframe && isCorrectType && item.total_score > 0;
        })
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, limit);

      // Enrich with TMDB data
      const enrichedItems = await this.enrichWithTMDBData(trendingItems);
      
      // Cache the results
      this.cacheTrending(contentType, timeframe, enrichedItems);
      
      return enrichedItems;
    } catch (error) {
      console.error('Failed to get trending content:', error);
      return [];
    }
  }

  /**
   * Get trending by specific criteria
   */
  async getTrendingByGenre(genre, limit = 10) {
    try {
      const allTrending = await this.getTrending('all', 100);
      return allTrending
        .filter(item => 
          item.genres && 
          item.genres.some(g => 
            (g.name || g).toLowerCase().includes(genre.toLowerCase())
          )
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get trending by genre:', error);
      return [];
    }
  }

  /**
   * Get most watched content today
   */
  async getMostWatchedToday(limit = 10) {
    return this.getTrending('all', limit, 'day');
  }

  /**
   * Get trending movies
   */
  async getTrendingMovies(limit = 20) {
    return this.getTrending('movie', limit);
  }

  /**
   * Get trending TV shows
   */
  async getTrendingTVShows(limit = 20) {
    return this.getTrending('tv', limit);
  }

  /**
   * Get trending anime
   */
  async getTrendingAnime(limit = 20) {
    return this.getTrending('anime', limit);
  }

  /**
   * Get content statistics
   */
  getContentStats(contentId, contentType) {
    const viewCounts = this.getViewCounts();
    const key = `${contentType}_${contentId}`;
    return viewCounts[key] || null;
  }

  /**
   * Get global trending statistics
   */
  getTrendingStats() {
    const viewCounts = this.getViewCounts();
    const items = Object.values(viewCounts);
    
    const stats = {
      total_content: items.length,
      total_interactions: 0,
      total_score: 0,
      content_by_type: {},
      top_interaction_types: {},
      trending_timeframe: {
        day: 0,
        week: 0,
        month: 0
      }
    };

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    items.forEach(item => {
      // Count by type
      stats.content_by_type[item.content_type] = 
        (stats.content_by_type[item.content_type] || 0) + 1;
      
      // Total score
      stats.total_score += item.total_score;
      
      // Count interactions
      Object.entries(item.interactions).forEach(([type, count]) => {
        stats.total_interactions += count;
        stats.top_interaction_types[type] = 
          (stats.top_interaction_types[type] || 0) + count;
      });
      
      // Timeframe stats
      const lastInteraction = new Date(item.last_interaction);
      if (lastInteraction >= dayAgo) stats.trending_timeframe.day++;
      if (lastInteraction >= weekAgo) stats.trending_timeframe.week++;
      if (lastInteraction >= monthAgo) stats.trending_timeframe.month++;
    });

    return stats;
  }

  /**
   * Clear old trending data
   */
  clearOldData(daysToKeep = 30) {
    try {
      const viewCounts = this.getViewCounts();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const filteredCounts = {};
      Object.entries(viewCounts).forEach(([key, item]) => {
        if (new Date(item.last_interaction) >= cutoffDate) {
          filteredCounts[key] = item;
        }
      });
      
      this.saveViewCounts(filteredCounts);
      this.clearTrendingCache();
      
      analytics.trackEvent('trending_data_cleaned', {
        category: 'maintenance',
        label: 'old_data_cleared',
        days_kept: daysToKeep
      });
      
      return true;
    } catch (error) {
      console.error('Failed to clear old trending data:', error);
      return false;
    }
  }

  // Private helper methods
  getViewCounts() {
    try {
      const counts = localStorage.getItem(this.VIEW_COUNTS_KEY);
      return counts ? JSON.parse(counts) : {};
    } catch (error) {
      console.error('Failed to get view counts:', error);
      return {};
    }
  }

  saveViewCounts(counts) {
    localStorage.setItem(this.VIEW_COUNTS_KEY, JSON.stringify(counts));
  }

  getCutoffDate(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Default to week
    }
  }

  async enrichWithTMDBData(trendingItems) {
    const enriched = [];
    
    for (const item of trendingItems) {
      try {
        let tmdbData = null;
        
        if (item.content_type === 'movie') {
          tmdbData = await tmdbApi.getMovieDetails(item.content_id);
        } else if (item.content_type === 'tv' || item.content_type === 'anime') {
          tmdbData = await tmdbApi.getTVShowDetails(item.content_id);
        }
        
        if (tmdbData) {
          enriched.push({
            ...tmdbData,
            trending_score: item.total_score,
            trending_interactions: item.interactions,
            trending_metadata: item.metadata,
            unique_views: item.unique_views,
            last_interaction: item.last_interaction
          });
        }
      } catch (error) {
        console.error(`Failed to enrich item ${item.content_id}:`, error);
        // Include item without TMDB data
        enriched.push({
          id: item.content_id,
          type: item.content_type,
          trending_score: item.total_score,
          trending_interactions: item.interactions,
          trending_metadata: item.metadata,
          unique_views: item.unique_views,
          last_interaction: item.last_interaction
        });
      }
    }
    
    return enriched;
  }

  getCachedTrending(contentType, timeframe) {
    try {
      const cache = localStorage.getItem(`${this.STORAGE_KEY}_${contentType}_${timeframe}`);
      if (cache) {
        const parsed = JSON.parse(cache);
        const now = Date.now();
        if (now - parsed.timestamp < this.TRENDING_CACHE_DURATION) {
          return parsed.data;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  cacheTrending(contentType, timeframe, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(
        `${this.STORAGE_KEY}_${contentType}_${timeframe}`, 
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache trending data:', error);
    }
  }

  clearTrendingCache() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_KEY)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear trending cache:', error);
    }
  }
}

// Create and export singleton instance
const trendingService = new TrendingService();
export default trendingService;
