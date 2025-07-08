import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BoredFlixHero from './BoredFlixHero';
import './HeroCarousel.css';

const HeroCarousel = ({ content = [], autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || content.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === content.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlaying, content.length, interval]);

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(autoPlay);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? content.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === content.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (!content || content.length === 0) {
    return (
      <div className="hero-carousel loading">
        <div className="hero-carousel-item">
          <BoredFlixHero content={null} />
        </div>
      </div>
    );
  }

  // If only one item, show it without carousel controls
  if (content.length === 1) {
    return (
      <div className="hero-carousel single-item">
        <div className="hero-carousel-item active">
          <BoredFlixHero content={content[0]} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="hero-carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Items */}
      <div className="hero-carousel-container">
        {content.map((item, index) => (
          <div
            key={item.id || index}
            className={`hero-carousel-item ${index === currentIndex ? 'active' : ''}`}
            style={{
              transform: `translateX(${(index - currentIndex) * 100}%)`,
              opacity: index === currentIndex ? 1 : 0,
            }}
          >
            <BoredFlixHero content={item} />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        className="hero-carousel-nav hero-carousel-nav--prev"
        onClick={goToPrevious}
        aria-label="Previous hero item"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        className="hero-carousel-nav hero-carousel-nav--next"
        onClick={goToNext}
        aria-label="Next hero item"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="hero-carousel-dots">
        {content.map((_, index) => (
          <button
            key={index}
            className={`hero-carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className="hero-carousel-progress">
          <div 
            className="hero-carousel-progress-bar"
            style={{
              animationDuration: `${interval}ms`,
              animationPlayState: isAutoPlaying ? 'running' : 'paused'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
