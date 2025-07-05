import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { analytics } from '../utils';
import WatchlistButton from './WatchlistButton';
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
  size = 'medium',
  content = null, // Full content object for watchlist
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = date => {
    if (!date) return '';
    return new Date(date).getFullYear();
  };

  const formatRating = rating => {
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

  const handleCardClick = () => {
    // Track content card click
    analytics.trackEvent('content_card_click', {
      category: 'content_discovery',
      label: `${type}_${id}`,
      content_type: type,
      content_id: id,
      content_title: title,
      content_rating: rating,
      content_year: formatDate(releaseDate),
      card_size: size,
    });

    // Track specific content type clicks for popularity
    const metadata = {
      genres: [], // Could be enhanced if genre data is available
      year: formatDate(releaseDate),
      rating: rating,
    };

    if (type === 'movie') {
      analytics.trackMovieView(id, title, metadata);
    } else if (type === 'tv') {
      analytics.trackSeriesView(id, title, metadata);
    } else if (type === 'anime') {
      analytics.trackAnimeView(id, title, metadata);
    }
  };

  const sizeClass = `content-card--${size}`;

  return (
    <div className={`content-card ${sizeClass}`}>
      <div className="content-card__image-container">
        <Link to={getContentUrl()} className="content-card__image-link" onClick={handleCardClick}>
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

          {!imageLoaded && !imageError && <div className="content-card__image-skeleton"></div>}
        </Link>

        {/* Hover Overlay */}
        <div className="content-card__overlay">
          <div className="content-card__actions">
            <Link to={getContentUrl()} className="content-card__action content-card__action--play">
              <Play size={20} fill="currentColor" />
            </Link>
            <WatchlistButton
              content={content || {
                id,
                type,
                title,
                poster_path: poster?.split('/').pop()?.replace(/^w\d+/, ''), // Extract original path
                overview,
                vote_average: rating,
                release_date: releaseDate
              }}
              variant="compact"
              showText={false}
              className="content-card__action content-card__action--watchlist"
            />
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
              {releaseDate && <span className="content-card__year">{formatDate(releaseDate)}</span>}
              {rating && <span className="content-card__rating">★ {formatRating(rating)}</span>}
              <span className="content-card__type">{type.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
