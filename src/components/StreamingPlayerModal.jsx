import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import './StreamingPlayerModal.css';

const StreamingPlayerModal = ({ 
  isOpen, 
  onClose, 
  content, 
  platform, 
  embedUrl 
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Open in new tab
  const handleOpenInNewTab = () => {
    window.open(embedUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="streaming-player-modal"
      onClick={handleBackdropClick}
    >
      <div className="streaming-player-modal__content">
        <div className="streaming-player-modal__header">
          <div className="streaming-player-modal__title">
            <h2>{content?.title}</h2>
            <span className="streaming-player-modal__platform">
              Playing on {platform === 'vidsrc' ? 'Server 1' : 'Server 2'}
            </span>
          </div>
          
          <div className="streaming-player-modal__controls">
            <button
              className="streaming-player-modal__control-btn"
              onClick={handleOpenInNewTab}
              title="Open in new tab"
            >
              <ExternalLink size={18} />
            </button>
            <button
              className="streaming-player-modal__control-btn streaming-player-modal__close"
              onClick={onClose}
              title="Close player"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="streaming-player-modal__player">
          <iframe
            src={embedUrl}
            title={`${content?.title} - ${platform}`}
            className="streaming-player-modal__iframe"
            allowFullScreen
            allow="encrypted-media; autoplay; fullscreen"
            frameBorder="0"
            loading="lazy"
          />
        </div>

        <div className="streaming-player-modal__footer">
          <p className="streaming-player-modal__disclaimer">
            Content is provided by third-party services. We do not host any content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreamingPlayerModal;
