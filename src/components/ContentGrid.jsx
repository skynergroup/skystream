import ContentCard from './ContentCard';
import Loading from './Loading';
import { utils } from '../utils/config';
import './ContentGrid.css';

const ContentGrid = ({
  title,
  items = [],
  loading = false,
  error = null,
  cardSize = 'medium',
  showTitle = true,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`content-grid ${className}`}>
        {showTitle && title && <h2 className="content-grid__title">{title}</h2>}
        <div className="content-grid__loading">
          <Loading text="Loading content..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`content-grid ${className}`}>
        {showTitle && title && <h2 className="content-grid__title">{title}</h2>}
        <div className="content-grid__error">
          <p className="content-grid__error-text">
            {error.message || 'Failed to load content. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={`content-grid ${className}`}>
        {showTitle && title && <h2 className="content-grid__title">{title}</h2>}
        <div className="content-grid__empty">
          <p className="content-grid__empty-text">No content available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`content-grid ${className}`}>
      {showTitle && title && <h2 className="content-grid__title">{title}</h2>}
      <div className={`content-grid__container content-grid__container--${cardSize}`}>
        {items.map(item => (
          <ContentCard
            key={`${item.type || 'movie'}-${item.id}`}
            id={item.id}
            title={item.title || item.name}
            poster={utils.getPosterUrl(item.poster_path)}
            backdrop={utils.getBackdropUrl(item.backdrop_path)}
            overview={item.overview}
            releaseDate={item.release_date || item.first_air_date}
            rating={item.vote_average}
            type={item.media_type || item.type || (item.first_air_date ? 'tv' : 'movie')}
            size={cardSize}
            content={{
              ...item,
              type: item.media_type || item.type || (item.first_air_date ? 'tv' : 'movie'),
              title: item.title || item.name
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentGrid;
