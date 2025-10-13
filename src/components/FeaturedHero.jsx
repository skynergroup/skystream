import { useState, useEffect } from 'react';
import { Play, Info } from 'lucide-react';
import streamingServices from '../services/streamingServices';
import './FeaturedHero.css';

const FeaturedHero = ({ content, onPlay, onInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!content || content.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % content.length);
        setIsTransitioning(false);
      }, 300);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [content]);

  if (!content || content.length === 0) {
    return null;
  }

  const currentContent = content[currentIndex];
  const backdropUrl = currentContent.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentContent.backdrop_path}`
    : null;

  const handlePlayVidsrc = () => {
    const urls = streamingServices.getAllStreamingUrls(currentContent);
    onPlay?.(currentContent, 'vidsrc', urls.vidsrc);
  };

  const handlePlayVideasy = () => {
    const urls = streamingServices.getAllStreamingUrls(currentContent);
    onPlay?.(currentContent, 'videasy', urls.videasy);
  };

  const releaseYear = currentContent.release_date
    ? new Date(currentContent.release_date).getFullYear()
    : null;

  const rating = currentContent.vote_average
    ? Math.round(currentContent.vote_average * 10) / 10
    : null;

  return (
    <div className="featured-hero">
      <div
        className={`featured-hero__background ${isTransitioning ? 'featured-hero__background--transitioning' : ''}`}
        style={{
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none',
        }}
      >
        <div className="featured-hero__gradient" />
      </div>

      <div className="featured-hero__content">
        <h1 className="featured-hero__title">{currentContent.title}</h1>

        <div className="featured-hero__meta">
          {releaseYear && <span className="featured-hero__year">{releaseYear}</span>}
          {rating && (
            <span className="featured-hero__rating">
              ⭐ {rating}
            </span>
          )}
          <span className="featured-hero__type">
            {currentContent.type === 'movie' ? 'Movie' : 'TV Show'}
          </span>
        </div>

        {currentContent.overview && (
          <p className="featured-hero__overview">
            {currentContent.overview.length > 200
              ? `${currentContent.overview.substring(0, 200)}...`
              : currentContent.overview}
          </p>
        )}

        <div className="featured-hero__actions">
          <button className="featured-hero__btn featured-hero__btn--primary" onClick={handlePlayVidsrc}>
            <Play size={20} fill="currentColor" />
            Play on Server 1
          </button>
          <button className="featured-hero__btn featured-hero__btn--secondary" onClick={handlePlayVideasy}>
            <Play size={20} fill="currentColor" />
            Play on Server 2
          </button>
          {onInfo && (
            <button className="featured-hero__btn featured-hero__btn--info" onClick={() => onInfo(currentContent)}>
              <Info size={20} />
              More Info
            </button>
          )}
        </div>

        {content.length > 1 && (
          <div className="featured-hero__indicators">
            {content.map((_, index) => (
              <button
                key={index}
                className={`featured-hero__indicator ${index === currentIndex ? 'featured-hero__indicator--active' : ''}`}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsTransitioning(false);
                  }, 300);
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedHero;

