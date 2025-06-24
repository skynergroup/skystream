import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Info } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import './ContentCard.css';

const ContentCard = ({ 
  id, 
  title, 
  poster, 
  backdrop, 
  overview, 
  releaseDate, 
  rating, 
  type = 'movie',
  size = 'medium' 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).getFullYear();
  };

  const formatRating = (rating) => {
    if (!rating) return '';
    return Math.round(rating * 10) / 10;
  };

  const getContentUrl = () => {
    return `/${type}/${id}`;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const sizeClass = `content-card--${size}`;

  return (
    <div className={`content-card ${sizeClass}`}>
      <div className="content-card__image-container">
        <Link to={getContentUrl()} className="content-card__image-link">
          {!imageError ? (
            <img
              src={poster}
              alt={title}
              className={`content-card__image ${imageLoaded ? 'content-card__image--loaded' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="content-card__image-placeholder">
              <span className="content-card__image-placeholder-text">
                {title?.charAt(0) || '?'}
              </span>
            </div>
          )}
          
          {!imageLoaded && !imageError && (
            <div className="content-card__image-skeleton"></div>
          )}
        </Link>

        {/* Hover Overlay */}
        <div className="content-card__overlay">
          <div className="content-card__actions">
            <button
              className="content-card__action content-card__action--play"
              onClick={() => setShowPlayer(true)}
            >
              <Play size={20} fill="currentColor" />
            </button>
            <button className="content-card__action content-card__action--add">
              <Plus size={20} />
            </button>
            <Link to={getContentUrl()} className="content-card__action content-card__action--info">
              <Info size={20} />
            </Link>
          </div>
          
          <div className="content-card__info">
            <h3 className="content-card__title">{title}</h3>
            {overview && (
              <p className="content-card__overview">
                {overview.length > 100 ? `${overview.substring(0, 100)}...` : overview}
              </p>
            )}
            <div className="content-card__meta">
              {releaseDate && (
                <span className="content-card__year">{formatDate(releaseDate)}</span>
              )}
              {rating && (
                <span className="content-card__rating">★ {formatRating(rating)}</span>
              )}
              <span className="content-card__type">{type.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      {showPlayer && (
        <VideoPlayer
          contentId={id}
          contentType={type}
          onClose={() => setShowPlayer(false)}
          autoPlay={true}
        />
      )}
    </div>
  );
};

export default ContentCard;
