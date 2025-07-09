// Watchlist utility functions for managing user's saved content

const WATCHLIST_KEY = 'skystream_watchlist';

/**
 * Get the current watchlist from localStorage
 * @returns {Array} Array of watchlist items
 */
export const getWatchlist = () => {
  try {
    const watchlist = localStorage.getItem(WATCHLIST_KEY);
    return watchlist ? JSON.parse(watchlist) : [];
  } catch (error) {
    console.error('Error reading watchlist:', error);
    return [];
  }
};

/**
 * Add an item to the watchlist
 * @param {Object} item - Content item to add
 * @param {string} item.id - Content ID
 * @param {string} item.type - Content type (movie, tv, anime)
 * @param {string} item.title - Content title
 * @param {string} item.poster_path - Poster image path
 * @param {string} item.overview - Content description
 * @param {number} item.vote_average - Rating
 * @param {string} item.release_date - Release date
 * @returns {boolean} Success status
 */
export const addToWatchlist = (item) => {
  try {
    const watchlist = getWatchlist();
    
    // Check if item already exists
    const exists = watchlist.some(watchlistItem => 
      watchlistItem.id === item.id && watchlistItem.type === item.type
    );
    
    if (exists) {
      console.log('Item already in watchlist:', item.title);
      return false;
    }
    
    // Add timestamp and ensure required fields
    const watchlistItem = {
      id: item.id,
      type: item.type,
      title: item.title || item.name,
      poster_path: item.poster_path,
      overview: item.overview,
      vote_average: item.vote_average,
      release_date: item.release_date || item.first_air_date,
      added_at: new Date().toISOString(),
      ...item // Include any additional fields
    };
    
    watchlist.unshift(watchlistItem); // Add to beginning
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    
    console.log('Added to watchlist:', watchlistItem.title);
    return true;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return false;
  }
};

/**
 * Remove an item from the watchlist
 * @param {string} id - Content ID
 * @param {string} type - Content type
 * @returns {boolean} Success status
 */
export const removeFromWatchlist = (id, type) => {
  try {
    const watchlist = getWatchlist();
    const filteredWatchlist = watchlist.filter(item => 
      !(item.id === id && item.type === type)
    );
    
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filteredWatchlist));
    console.log('Removed from watchlist:', id, type);
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return false;
  }
};

/**
 * Check if an item is in the watchlist
 * @param {string} id - Content ID
 * @param {string} type - Content type
 * @returns {boolean} Whether item is in watchlist
 */
export const isInWatchlist = (id, type) => {
  try {
    const watchlist = getWatchlist();
    return watchlist.some(item => item.id === id && item.type === type);
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
};

/**
 * Toggle an item in the watchlist
 * @param {Object} item - Content item
 * @returns {boolean} New watchlist status (true if added, false if removed)
 */
export const toggleWatchlist = (item) => {
  const inWatchlist = isInWatchlist(item.id, item.type);
  
  if (inWatchlist) {
    removeFromWatchlist(item.id, item.type);
    return false;
  } else {
    addToWatchlist(item);
    return true;
  }
};

/**
 * Clear the entire watchlist
 * @returns {boolean} Success status
 */
export const clearWatchlist = () => {
  try {
    localStorage.removeItem(WATCHLIST_KEY);
    console.log('Watchlist cleared');
    return true;
  } catch (error) {
    console.error('Error clearing watchlist:', error);
    return false;
  }
};

/**
 * Get watchlist statistics
 * @returns {Object} Watchlist stats
 */
export const getWatchlistStats = () => {
  const watchlist = getWatchlist();
  
  const stats = {
    total: watchlist.length,
    movies: watchlist.filter(item => item.type === 'movie').length,
    tvShows: watchlist.filter(item => item.type === 'tv').length,
    anime: watchlist.filter(item => item.type === 'anime').length,
    recentlyAdded: watchlist.slice(0, 5) // Last 5 added items
  };
  
  return stats;
};

/**
 * Search within watchlist
 * @param {string} query - Search query
 * @returns {Array} Filtered watchlist items
 */
export const searchWatchlist = (query) => {
  if (!query.trim()) return getWatchlist();
  
  const watchlist = getWatchlist();
  const lowercaseQuery = query.toLowerCase();
  
  return watchlist.filter(item => 
    item.title.toLowerCase().includes(lowercaseQuery) ||
    (item.overview && item.overview.toLowerCase().includes(lowercaseQuery))
  );
};

/**
 * Export watchlist as JSON
 * @returns {string} JSON string of watchlist
 */
export const exportWatchlist = () => {
  const watchlist = getWatchlist();
  return JSON.stringify(watchlist, null, 2);
};

/**
 * Import watchlist from JSON
 * @param {string} jsonData - JSON string of watchlist data
 * @returns {boolean} Success status
 */
export const importWatchlist = (jsonData) => {
  try {
    const importedWatchlist = JSON.parse(jsonData);

    if (!Array.isArray(importedWatchlist)) {
      throw new Error('Invalid watchlist format');
    }

    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(importedWatchlist));
    console.log('Watchlist imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing watchlist:', error);
    return false;
  }
};

/**
 * Get progress statistics from localStorage
 * @returns {Object} Progress stats
 */
export const getProgressStats = () => {
  try {
    const progressKeys = Object.keys(localStorage).filter(key => key.startsWith('progress_'));
    const progressItems = progressKeys.map(key => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return null;
      }
    }).filter(Boolean);

    const stats = {
      total: progressItems.length,
      completed: progressItems.filter(item => item.percentage >= 90).length,
      inProgress: progressItems.filter(item => item.percentage < 90 && item.percentage > 5).length,
      recentlyWatched: progressItems
        .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
        .slice(0, 5)
    };

    return stats;
  } catch (error) {
    console.error('Error getting progress stats:', error);
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      recentlyWatched: []
    };
  }
};
