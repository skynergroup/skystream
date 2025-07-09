import { useState, useEffect } from 'react';
import { Play, Plus, Star, Share, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './index';
import { 
  convertRatingToPercentage, 
  formatContentMeta, 
  truncateText,
  getBackdropUrl,
  getPosterUrl,
  isNewContent,
  formatGenres
} from '../utils/boredflixHelpers';
import './BoredFlixHero.css';

const BoredFlixHero = ({ content, onAddToWatchlist, onShare }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [content]);

  if (!content) {
    return (
      <div className="boredflix-hero loading">
        <div className="hero-backdrop loading-shimmer"></div>
        <div className="hero-content">
          <div className="hero-poster loading-shimmer"></div>
          <div className="hero-info">
            <div className="loading-shimmer loading-title"></div>
            <div className="loading-shimmer loading-meta"></div>
            <div className="loading-shimmer loading-description"></div>
          </div>
        </div>
      </div>
    );
  }

  const rating = convertRatingToPercentage(content.vote_average);
  const year = new Date(content.release_date || content.first_air_date).getFullYear();
  const meta = formatContentMeta(content);
  const isNew = isNewContent(content.release_date || content.first_air_date);
  const genres = formatGenres(content.genres, 3);
  const description = content.overview || '';
  const displayDescription = showFullDescription ? description : truncateText(description, 200);

  const handleWatchNow = () => {
    // Navigate to content page
    window.location.href = `/${content.type}/${content.id}`;
  };

  const handleAddToWatchlist = () => {
    if (onAddToWatchlist) {
      onAddToWatchlist(content);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(content);
    }
  };

  return (
    <div className="boredflix-hero">
      {/* Backdrop Image */}
      <div className="hero-backdrop">
        <img
          src={getBackdropUrl(content.backdrop_path)}
          alt={content.title || content.name}
          onLoad={() => setImageLoaded(true)}
          className={`backdrop-image ${imageLoaded ? 'loaded' : ''}`}
        />
        <div className="backdrop-overlay"></div>
      </div>

      {/* Content */}
      <div className="hero-content">
        {/* Poster */}
        <div className="hero-poster-container">
          <img
            src={getPosterUrl(content.poster_path)}
            alt={content.title || content.name}
            className="hero-poster"
          />
          {isNew && <div className="new-badge">NEW</div>}
        </div>

        {/* Info */}
        <div className="hero-info">
          <h1 className="hero-title">{content.title || content.name}</h1>
          
          <div className="hero-meta">
            <span className="meta-text">{meta}</span>
            {rating && (
              <div className="rating-container">
                <Star size={16} className="star-icon" />
                <span className="rating-text">{rating / 10}</span>
                <span className="rating-percentage">({rating}%)</span>
              </div>
            )}
          </div>

          {genres && (
            <div className="hero-genres">
              {genres.split(', ').map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))}
            </div>
          )}

          <div className="hero-description">
            <p>{displayDescription}</p>
            {description.length > 200 && (
              <button 
                className="read-more-btn"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>

          <div className="hero-actions">
            <Button
              variant="primary"
              size="large"
              icon={<Play size={20} />}
              onClick={handleWatchNow}
              className="watch-now-btn"
            >
              Watch Now
            </Button>

            <Button
              variant="secondary"
              size="large"
              icon={<Plus size={20} />}
              onClick={handleAddToWatchlist}
              className="watchlist-btn"
            >
              Add to Watchlist
            </Button>

            <div className="secondary-actions">
              <button 
                className="action-btn"
                onClick={handleShare}
                title="Share"
              >
                <Share size={20} />
              </button>

              <button 
                className="action-btn"
                title="Download"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoredFlixHero;
