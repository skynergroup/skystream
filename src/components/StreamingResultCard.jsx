import { useState } from 'react';
import PropTypes from 'prop-types';
import { Play, Star, Calendar, Info } from 'lucide-react';
import streamingServices from '../services/streamingServices';
import './StreamingResultCard.css';

const StreamingResultCard = ({ content, onPlay }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const posterUrl = content.poster_path
    ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
    : null;

  const releaseYear = content.release_date ? new Date(content.release_date).getFullYear() : null;

  const rating = content.vote_average ? Math.round(content.vote_average * 10) / 10 : null;

  const handlePlayServer = serverNum => {
    const urls = streamingServices.getAllStreamingUrls(content);
    const serverKey = `server${serverNum}`;
    onPlay?.(content, serverKey, urls[serverKey]);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className="streaming-result-card">
      <div className="streaming-result-card__poster">
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={content.title}
            className={`streaming-result-card__image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="streaming-result-card__placeholder">
            <Info size={32} />
          </div>
        )}

        <div className="streaming-result-card__overlay">
          <div className="streaming-result-card__play-buttons">
            <button
              className="streaming-result-card__play-btn streaming-result-card__play-btn--server1"
              onClick={() => handlePlayServer(1)}
              title="Play on Server 1 (Vidsrc)"
            >
              <Play size={16} />
              S1
            </button>
            <button
              className="streaming-result-card__play-btn streaming-result-card__play-btn--server2"
              onClick={() => handlePlayServer(2)}
              title="Play on Server 2 (Vidsrc)"
            >
              <Play size={16} />
              S2
            </button>
            <button
              className="streaming-result-card__play-btn streaming-result-card__play-btn--server3"
              onClick={() => handlePlayServer(3)}
              title="Play on Server 3 (Vidsrc)"
            >
              <Play size={16} />
              S3
            </button>
            <button
              className="streaming-result-card__play-btn streaming-result-card__play-btn--server4"
              onClick={() => handlePlayServer(4)}
              title="Play on Server 4 (Vidsrc)"
            >
              <Play size={16} />
              S4
            </button>
            <button
              className="streaming-result-card__play-btn streaming-result-card__play-btn--server5"
              onClick={() => handlePlayServer(5)}
              title="Play on Server 5 (Videasy)"
            >
              <Play size={16} />
              S5
            </button>
          </div>
        </div>
      </div>

      <div className="streaming-result-card__info">
        <h3 className="streaming-result-card__title" title={content.title}>
          {content.title}
        </h3>

        <div className="streaming-result-card__meta">
          {Boolean(releaseYear) && (
            <span className="streaming-result-card__year">
              <Calendar size={12} />
              {releaseYear}
            </span>
          )}

          {Boolean(rating) && (
            <span className="streaming-result-card__rating">
              <Star size={12} />
              {rating}
            </span>
          )}

          <span className="streaming-result-card__type">
            {content.type === 'movie' ? 'Movie' : 'TV'}
          </span>
        </div>

        {content.overview && (
          <p className="streaming-result-card__overview">
            {content.overview.length > 120
              ? `${content.overview.substring(0, 120)}...`
              : content.overview}
          </p>
        )}
      </div>
    </div>
  );
};

StreamingResultCard.propTypes = {
  content: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    poster_path: PropTypes.string,
    release_date: PropTypes.string,
    vote_average: PropTypes.number,
    overview: PropTypes.string,
  }).isRequired,
  onPlay: PropTypes.func.isRequired,
};

export default StreamingResultCard;
