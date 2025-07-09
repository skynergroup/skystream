import { useState, useEffect } from 'react';
import { TrendingUp, Flame, Eye, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import tmdbApi from '../services/tmdbApi';
import Button from './Button';
import './TrendingSection.css';

const TrendingSection = ({
  timeframe = 'week',
  limit = 20,
  showTitle = true,
  className = ''
}) => {
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  useEffect(() => {
    loadTrending();
  }, [selectedTimeframe, limit]);

  const loadTrending = async () => {
    try {
      setLoading(true);

      // Get trending data from TMDB API
      const response = await tmdbApi.getTrending('all', selectedTimeframe);

      // Transform and limit the results
      const transformedItems = response.results.slice(0, limit).map(item => ({
        ...item,
        type: item.media_type === 'movie' ? 'movie' :
              item.media_type === 'tv' ? 'tv' : 'movie', // Default to movie for unknown types
        title: item.title || item.name,
        name: item.name || item.title
      }));

      setTrendingItems(transformedItems);
    } catch (error) {
      console.error('Failed to load trending content:', error);
      setTrendingItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (newTimeframe) => {
    setSelectedTimeframe(newTimeframe);
  };

  const getContentUrl = (item) => {
    return `/${item.type}/${item.id}`;
  };

  const formatTrendingScore = (popularity) => {
    if (!popularity) return '0';
    if (popularity >= 1000) {
      return `${(popularity / 1000).toFixed(1)}k`;
    }
    return Math.round(popularity).toString();
  };

  const getTrendingIcon = (index) => {
    if (index === 0) return <Flame size={16} className="trending-icon fire" />;
    if (index < 3) return <TrendingUp size={16} className="trending-icon hot" />;
    return <Eye size={16} className="trending-icon popular" />;
  };

  const getTimeframeLabel = (tf) => {
    switch (tf) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'This Week';
    }
  };

  if (loading) {
    return (
      <div className={`trending-section loading ${className}`}>
        {showTitle && <h2 className="trending-title">Trending Now</h2>}
        <div className="trending-grid">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="trending-item loading-placeholder">
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

  if (trendingItems.length === 0) {
    return (
      <div className={`trending-section empty ${className}`}>
        {showTitle && <h2 className="trending-title">Trending Now</h2>}
        <div className="empty-state">
          <TrendingUp size={48} />
          <p>No trending content available</p>
          <p className="empty-subtitle">Check back later for popular content</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`trending-section ${className}`}>
      {showTitle && (
        <div className="trending-header">
          <div className="trending-title-container">
            <h2 className="trending-title">
              <TrendingUp size={24} />
              Trending {getTimeframeLabel(selectedTimeframe)}
            </h2>
          </div>

          <div className="timeframe-selector">
            {['day', 'week'].map((tf) => (
              <button
                key={tf}
                className={`timeframe-btn ${selectedTimeframe === tf ? 'active' : ''}`}
                onClick={() => handleTimeframeChange(tf)}
              >
                {getTimeframeLabel(tf)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="trending-grid">
        {trendingItems.map((item, index) => (
          <div key={`${item.id}_${item.type}`} className="trending-item">
            <div className="trending-rank">
              {getTrendingIcon(index)}
              <span className="rank-number">#{index + 1}</span>
            </div>

            <div className="item-poster-container">
              <Link to={getContentUrl(item)} className="item-poster-link">
                <img
                  src={item.poster_path
                    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                    : '/placeholder-poster.jpg'
                  }
                  alt={item.title || item.name}
                  className="item-poster"
                  loading="lazy"
                />
                <div className="play-overlay">
                  <Play size={32} />
                </div>
              </Link>

              <div className="trending-badge">
                <TrendingUp size={12} />
                <span>{formatTrendingScore(item.popularity)}</span>
              </div>
            </div>

            <div className="item-info">
              <Link to={getContentUrl(item)} className="item-title-link">
                <h3 className="item-title">{item.title || item.name}</h3>
              </Link>

              <div className="item-meta">
                <span className="item-year">
                  {item.release_date
                    ? new Date(item.release_date).getFullYear()
                    : item.first_air_date
                    ? new Date(item.first_air_date).getFullYear()
                    : 'N/A'
                  }
                </span>

                {item.vote_average && (
                  <span className="item-rating">
                    ★ {item.vote_average.toFixed(1)}
                  </span>
                )}

                <span className="item-type">
                  {item.media_type === 'tv' ? 'TV Show' : 'Movie'}
                </span>
              </div>


              
              <div className="item-actions">
                <Button
                  as={Link}
                  to={getContentUrl(item)}
                  variant="primary"
                  size="small"
                  icon={<Play size={16} />}
                  className="watch-button"
                >
                  Watch Now
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trendingItems.length >= limit && (
        <div className="trending-footer">
          <Link to={`/trending?timeframe=${selectedTimeframe}`} className="view-all-link">
            View All Trending Content →
          </Link>
        </div>
      )}
    </div>
  );
};

export default TrendingSection;
