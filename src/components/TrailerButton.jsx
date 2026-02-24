import { useState } from 'react';
import PropTypes from 'prop-types';
import { Film } from 'lucide-react';
import { TrailerModal } from './TrailerModal';

export const TrailerButton = ({ content, onWatch }) => {
  const [isOpen, setIsOpen] = useState(false);

  const trailer = content.videos?.find(v => v.site === 'YouTube' && v.type === 'Trailer');

  if (!trailer) return null;

  return (
    <>
      <button
        className="trailer-button"
        onClick={e => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        title="Watch Trailer"
      >
        <Film size={14} />
      </button>

      <TrailerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onWatch={onWatch}
        trailerKey={trailer.key}
        title={content.title}
      />
    </>
  );
};

TrailerButton.propTypes = {
  content: PropTypes.shape({
    title: PropTypes.string,
    videos: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        site: PropTypes.string,
        type: PropTypes.string,
      })
    ),
  }).isRequired,
  onWatch: PropTypes.func,
};
