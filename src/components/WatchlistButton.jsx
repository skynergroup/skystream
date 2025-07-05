import { useState, useEffect } from 'react';
import { Heart, Plus, Check } from 'lucide-react';
import { isInWatchlist, toggleWatchlist } from '../utils/watchlist';
import { analytics } from '../utils';
import './WatchlistButton.css';

const WatchlistButton = ({ 
  content, 
  variant = 'default', // 'default', 'compact', 'large'
  showText = true,
  className = '',
  onToggle = null // Callback for when watchlist status changes
}) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check initial watchlist status
  useEffect(() => {
    if (content?.id && content?.type) {
      setInWatchlist(isInWatchlist(content.id, content.type));
    }
  }, [content?.id, content?.type]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!content?.id || !content?.type) {
      console.error('Invalid content for watchlist:', content);
      return;
    }

    setIsAnimating(true);
    
    try {
      const newStatus = toggleWatchlist(content);
      setInWatchlist(newStatus);

      // Track analytics
      analytics.trackEvent(newStatus ? 'watchlist_add' : 'watchlist_remove', {
        category: 'user_engagement',
        label: `${content.type}_${content.id}`,
        content_type: content.type,
        content_id: content.id,
        content_title: content.title || content.name,
        action: newStatus ? 'add' : 'remove'
      });

      // Call callback if provided
      if (onToggle) {
        onToggle(newStatus, content);
      }

      console.log(newStatus ? 'Added to watchlist:' : 'Removed from watchlist:', content.title || content.name);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }

    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getButtonContent = () => {
    if (variant === 'compact') {
      return (
        <>
          {inWatchlist ? (
            <Check className="watchlist-icon" size={16} />
          ) : (
            <Plus className="watchlist-icon" size={16} />
          )}
        </>
      );
    }

    return (
      <>
        {inWatchlist ? (
          <Check className="watchlist-icon" size={variant === 'large' ? 20 : 16} />
        ) : (
          <Plus className="watchlist-icon" size={variant === 'large' ? 20 : 16} />
        )}
        {showText && (
          <span className="watchlist-text">
            {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </span>
        )}
      </>
    );
  };

  const buttonClasses = [
    'watchlist-button',
    `watchlist-button--${variant}`,
    inWatchlist ? 'watchlist-button--active' : '',
    isAnimating ? 'watchlist-button--animating' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={handleToggle}
      title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
      aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
    >
      {getButtonContent()}
    </button>
  );
};

export default WatchlistButton;
