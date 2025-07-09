import { useState, useEffect } from 'react';
import { Play, Clock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import watchHistoryService from '../services/watchHistoryService';
import { Button } from './index';
import './ContinueWatching.css';

const ContinueWatching = ({ limit = 10, showTitle = true, className = '' }) => {
  const [continueWatchingItems, setContinueWatchingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContinueWatching();
  }, [limit]);

  const loadContinueWatching = () => {
    try {
      setLoading(true);
      const items = watchHistoryService.getContinueWatching(limit);
      setContinueWatchingItems(items);
    } catch (error) {
      console.error('Failed to load continue watching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (contentId, contentType, season, episode) => {
    try {
      watchHistoryService.removeFromHistory(contentId, contentType, season, episode);
      loadContinueWatching(); // Refresh the list
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const formatProgress = (progress) => {
    return Math.round(progress);
  };

  const formatWatchTime = (lastWatched) => {
    const now = new Date();
    const watchedDate = new Date(lastWatched);
    const diffInHours = (now - watchedDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return watchedDate.toLocaleDateString();
    }
  };

  const getContentUrl = (item) => {
    return `/${item.type}/${item.id}`;
  };

  const getEpisodeInfo = (item) => {
    if (item.type === 'movie') {
      return null;
    }
    
    if (item.season && item.episode) {
      return `S${item.season}E${item.episode}`;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className={`continue-watching loading ${className}`}>
        {showTitle && <h2 className="continue-watching-title">Continue Watching</h2>}
        <div className="continue-watching-grid">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="continue-watching-item loading-placeholder">
              <div className="item-poster loading-shimmer"></div>
              <div className="item-info">
                <div className="loading-shimmer loading-text"></div>
                <div className="loading-shimmer loading-text-small"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (continueWatchingItems.length === 0) {
    return (
      <div className={`continue-watching empty ${className}`}>
        {showTitle && <h2 className="continue-watching-title">Continue Watching</h2>}
        <div className="empty-state">
          <Clock size={48} />
          <p>No items to continue watching</p>
          <p className="empty-subtitle">Start watching something to see it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`continue-watching ${className}`}>
      {showTitle && (
        <div className="continue-watching-header">
          <h2 className="continue-watching-title">
            <Clock size={24} />
            Continue Watching
          </h2>
          <span className="item-count">{continueWatchingItems.length} items</span>
        </div>
      )}
      
      <div className="continue-watching-grid">
        {continueWatchingItems.map((item) => {
          const episodeInfo = getEpisodeInfo(item);
          const progress = formatProgress(item.progress);
          
          return (
            <div key={`${item.id}_${item.season}_${item.episode}`} className="continue-watching-item">
              <div className="item-poster-container">
                <Link to={getContentUrl(item)} className="item-poster-link">
                  <img
                    src={item.poster_path 
                      ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                      : '/placeholder-poster.jpg'
                    }
                    alt={item.title}
                    className="item-poster"
                    loading="lazy"
                  />
                  <div className="play-overlay">
                    <Play size={32} />
                  </div>
                </Link>
                
                {/* Progress bar */}
                <div className="progress-container">
                  <div 
                    className="progress-bar"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                {/* Remove button */}
                <button
                  className="remove-item"
                  onClick={() => handleRemoveItem(item.id, item.type, item.season, item.episode)}
                  title="Remove from continue watching"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="item-info">
                <Link to={getContentUrl(item)} className="item-title-link">
                  <h3 className="item-title">{item.title}</h3>
                </Link>
                
                <div className="item-details">
                  {episodeInfo && (
                    <span className="episode-info">{episodeInfo}</span>
                  )}
                  {episodeInfo && item.episode_title && (
                    <span className="episode-title">{item.episode_title}</span>
                  )}
                </div>
                
                <div className="item-meta">
                  <span className="progress-text">{progress}% watched</span>
                  <span className="watch-time">{formatWatchTime(item.last_watched)}</span>
                </div>
                
                <div className="item-actions">
                  <Button
                    as={Link}
                    to={getContentUrl(item)}
                    variant="primary"
                    size="small"
                    icon={<Play size={16} />}
                    className="continue-button"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {continueWatchingItems.length >= limit && (
        <div className="continue-watching-footer">
          <Link to="/continue-watching" className="view-all-link">
            View All Continue Watching →
          </Link>
        </div>
      )}
    </div>
  );
};

export default ContinueWatching;
