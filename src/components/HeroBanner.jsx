import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import Button from './Button';
import './HeroBanner.css';

const HeroBanner = ({ 
  content = null,
  autoPlay = true,
  showControls = true 
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Default content if none provided
  const defaultContent = {
    id: 299534,
    title: "Avengers: Endgame",
    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
    backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    release_date: "2019-04-24",
    vote_average: 8.3,
    type: "movie"
  };

  const heroContent = content || defaultContent;
  const backdropUrl = heroContent.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${heroContent.backdrop_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

  const formatYear = (date) => {
    if (!date) return '';
    return new Date(date).getFullYear();
  };

  const formatRating = (rating) => {
    if (!rating) return '';
    return Math.round(rating * 10) / 10;
  };

  const getContentUrl = () => {
    return `/${heroContent.type || 'movie'}/${heroContent.id}`;
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = backdropUrl;
  }, [backdropUrl]);

  return (
    <section className="hero-banner">
      {/* Background Image */}
      <div className="hero-banner__background">
        {imageLoaded && (
          <img
            src={backdropUrl}
            alt={heroContent.title || heroContent.name}
            className="hero-banner__background-image"
          />
        )}
        <div className="hero-banner__overlay"></div>
      </div>

      {/* Content */}
      <div className="hero-banner__content">
        <div className="hero-banner__info">
          <h1 className="hero-banner__title">
            {heroContent.title || heroContent.name}
          </h1>
          
          <div className="hero-banner__meta">
            {heroContent.release_date && (
              <span className="hero-banner__year">
                {formatYear(heroContent.release_date || heroContent.first_air_date)}
              </span>
            )}
            {heroContent.vote_average && (
              <span className="hero-banner__rating">
                ★ {formatRating(heroContent.vote_average)}
              </span>
            )}
            <span className="hero-banner__type">
              {(heroContent.type || 'movie').toUpperCase()}
            </span>
          </div>

          {heroContent.overview && (
            <p className="hero-banner__overview">
              {truncateText(heroContent.overview)}
            </p>
          )}

          {/* Action Buttons */}
          <div className="hero-banner__actions">
            <Button
              as={Link}
              to={getContentUrl()}
              variant="primary"
              size="large"
              icon={<Play size={20} fill="currentColor" />}
              className="hero-banner__play-btn"
            >
              Watch Now
            </Button>
            
            <Button
              as={Link}
              to={getContentUrl()}
              variant="secondary"
              size="large"
              icon={<Info size={20} />}
              className="hero-banner__info-btn"
            >
              More Info
            </Button>
          </div>
        </div>

        {/* Audio Control */}
        {showControls && (
          <div className="hero-banner__controls">
            <button
              className="hero-banner__audio-toggle"
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {!imageLoaded && (
        <div className="hero-banner__loading">
          <div className="hero-banner__loading-skeleton"></div>
        </div>
      )}
    </section>
  );
};

export default HeroBanner;
