import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { analytics } from '../utils';
import {
  convertRatingToPercentage,
  formatYear,
  isNewContent,
  getPosterUrl,
  getContentTypeDisplay
} from '../utils/boredflixHelpers';
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

  // BoredFlix-style data processing
  const percentageRating = convertRatingToPercentage(rating);
  const year = formatYear(releaseDate);
  const isNew = isNewContent(releaseDate);
  const contentTypeDisplay = getContentTypeDisplay(type);
  const imageUrl = getPosterUrl(poster);

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
    // Enhanced content card click tracking
    const metadata = {
      genres: genres || [],
      year: year,
      rating: rating,
      position: position || 'Unknown',
      section: section || 'Unknown',
    };

    // Track content card interaction with comprehensive data
    analytics.trackContentCardInteraction('click', type, id, title, metadata);

    // Track content discovery pattern
    analytics.trackEvent('content_discovery', {
      category: 'content_discovery',
      label: `${type}_${id}`,
      event_action: 'card_click',
      content_type: type,
      content_id: id,
      content_title: title,
      content_rating: rating,
      content_year: formatDate(releaseDate),
      content_genre: (genres || []).join(', ') || 'Unknown',
      card_size: size,
      card_position: position || 'Unknown',
      section_name: section || 'Unknown',
      discovery_method: 'browse',
      session_id: analytics.getSessionId(),
      timestamp: new Date().toISOString(),
      page_url: window.location.pathname,
      value: 1,
    });

    // Track specific content type clicks for popularity
    if (type === 'movie') {
      analytics.trackMovieView(id, title, metadata);
    } else if (type === 'tv') {
      analytics.trackSeriesView(id, title, metadata);
    } else if (type === 'anime') {
      analytics.trackAnimeView(id, title, metadata);
    }

    // Track genre preferences from card interactions
    if (genres && genres.length > 0) {
      genres.forEach(genre => {
        analytics.trackGenreInteraction(genre, type, 'card_click');
      });
    }
  };

  const sizeClass = `content-card--${size}`;

  return (
    <div className={`content-card ${sizeClass}`}>
      <div className="content-card__image-container">
        <Link to={getContentUrl()} className="content-card__image-link" onClick={handleCardClick}>
          {!imageError ? (
            <img
              src={imageUrl}
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

          {/* NEW Badge */}
          {isNew && <div className="content-card__new-badge">NEW</div>}

          {/* Rating Badge */}
          {percentageRating && (
            <div className="content-card__rating-badge">
              {percentageRating}%
            </div>
          )}
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
              {year && <span className="content-card__year">{year}</span>}
              <span className="content-card__type">{contentTypeDisplay}</span>
              {percentageRating && <span className="content-card__rating">{percentageRating / 10}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
