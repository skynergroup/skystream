import { useState, useEffect } from 'react';
import { ContentGrid, Loading } from '../components';
import tmdbApi from '../services/tmdbApi';

const Anime = () => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnime = async () => {
    try {
      setLoading(true);
      setError(null);

      const animeContent = await tmdbApi.getAnimeContent();
      setAnime(animeContent.results.map(show => ({
        ...tmdbApi.transformContent(show),
        type: 'anime'
      })));

    } catch (err) {
      console.error('Failed to load anime:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnime();
  }, []);

  return (
    <div className="anime-page" style={{ padding: '2rem 0' }}>
      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: 'var(--netflix-white)',
          margin: '0 0 0.5rem 0'
        }}>
          Anime
        </h1>
        <p style={{ 
          color: 'var(--netflix-text-gray)', 
          fontSize: '1.1rem',
          margin: 0
        }}>
          Explore the best anime series and movies with both subtitled and dubbed versions.
        </p>
      </div>

      <ContentGrid
        title="Popular Anime"
        items={anime}
        loading={loading}
        error={error}
        cardSize="medium"
        showTitle={false}
      />
    </div>
  );
};

export default Anime;
