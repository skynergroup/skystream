import { useState, useEffect } from 'react';
import { Search, Filter, Download, Trash2, Heart } from 'lucide-react';
import { getWatchlist, searchWatchlist, clearWatchlist, getWatchlistStats } from '../utils/watchlist';
import { analytics } from '../utils';
import ContentCard from '../components/ContentCard';
import WatchlistButton from '../components/WatchlistButton';
import './Watchlist.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [filteredWatchlist, setFilteredWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('added_at');
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load watchlist on component mount
  useEffect(() => {
    loadWatchlist();
    analytics.trackPageView('/watchlist', 'My Watchlist');
  }, []);

  // Filter and search watchlist when dependencies change
  useEffect(() => {
    filterAndSearchWatchlist();
  }, [watchlist, searchQuery, filterType, sortBy]);

  const loadWatchlist = () => {
    setIsLoading(true);
    try {
      const watchlistData = getWatchlist();
      const watchlistStats = getWatchlistStats();
      
      setWatchlist(watchlistData);
      setStats(watchlistStats);
      
      console.log('Loaded watchlist:', watchlistData.length, 'items');
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSearchWatchlist = () => {
    let filtered = [...watchlist];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchWatchlist(searchQuery);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'added_at':
          return new Date(b.added_at) - new Date(a.added_at);
        case 'title':
          return (a.title || a.name).localeCompare(b.title || b.name);
        case 'rating':
          return (b.vote_average || 0) - (a.vote_average || 0);
        case 'release_date':
          return new Date(b.release_date || b.first_air_date || 0) - new Date(a.release_date || a.first_air_date || 0);
        default:
          return 0;
      }
    });

    setFilteredWatchlist(filtered);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearWatchlist = () => {
    if (window.confirm('Are you sure you want to clear your entire watchlist? This action cannot be undone.')) {
      clearWatchlist();
      loadWatchlist();
      
      analytics.trackEvent('watchlist_clear', {
        category: 'user_engagement',
        label: 'clear_all',
        items_count: watchlist.length
      });
    }
  };

  const handleExportWatchlist = () => {
    try {
      const watchlistData = getWatchlist();
      const dataStr = JSON.stringify(watchlistData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skystream-watchlist-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      analytics.trackEvent('watchlist_export', {
        category: 'user_engagement',
        label: 'export_json',
        items_count: watchlistData.length
      });
    } catch (error) {
      console.error('Error exporting watchlist:', error);
    }
  };

  const handleWatchlistToggle = (newStatus, content) => {
    // Reload watchlist when item is removed
    if (!newStatus) {
      loadWatchlist();
    }
  };

  if (isLoading) {
    return (
      <div className="watchlist-page">
        <div className="watchlist-loading">
          <div className="loading-spinner"></div>
          <p>Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <div className="watchlist-title-section">
          <h1 className="watchlist-title">
            <Heart className="watchlist-title-icon" />
            My Watchlist
          </h1>
          <div className="watchlist-stats">
            <span className="stat-item">{stats.total} items</span>
            {stats.movies > 0 && <span className="stat-item">{stats.movies} movies</span>}
            {stats.tvShows > 0 && <span className="stat-item">{stats.tvShows} TV shows</span>}
            {stats.anime > 0 && <span className="stat-item">{stats.anime} anime</span>}
          </div>
        </div>

        <div className="watchlist-actions">
          <button 
            className="action-button export-button"
            onClick={handleExportWatchlist}
            disabled={watchlist.length === 0}
          >
            <Download size={16} />
            Export
          </button>
          <button 
            className="action-button clear-button"
            onClick={handleClearWatchlist}
            disabled={watchlist.length === 0}
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="watchlist-empty">
          <Heart className="empty-icon" size={64} />
          <h2>Your watchlist is empty</h2>
          <p>Start adding movies, TV shows, and anime to keep track of what you want to watch!</p>
        </div>
      ) : (
        <>
          <div className="watchlist-controls">
            <div className="search-container">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search your watchlist..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
            </div>

            <div className="filter-controls">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
                <option value="anime">Anime</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="added_at">Recently Added</option>
                <option value="title">Title A-Z</option>
                <option value="rating">Highest Rated</option>
                <option value="release_date">Release Date</option>
              </select>
            </div>
          </div>

          <div className="watchlist-content">
            {filteredWatchlist.length === 0 ? (
              <div className="no-results">
                <p>No items match your current filters.</p>
              </div>
            ) : (
              <div className="watchlist-grid">
                {filteredWatchlist.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="watchlist-item">
                    <ContentCard
                      content={item}
                      contentType={item.type}
                    />
                    <div className="watchlist-item-overlay">
                      <WatchlistButton
                        content={item}
                        variant="compact"
                        showText={false}
                        onToggle={handleWatchlistToggle}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Watchlist;
