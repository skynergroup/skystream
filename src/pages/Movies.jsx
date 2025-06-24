import { useState, useEffect } from 'react';
import { ContentGrid, Loading } from '../components';
import tmdbApi from '../services/tmdbApi';

const Movies = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const [popular, topRated, nowPlaying, upcoming] = await Promise.all([
        tmdbApi.getPopularMovies(),
        tmdbApi.getTopRatedMovies(),
        tmdbApi.getNowPlayingMovies(),
        tmdbApi.getUpcomingMovies()
      ]);

      setPopularMovies(popular.results.map(movie => tmdbApi.transformContent(movie)));
      setTopRatedMovies(topRated.results.map(movie => tmdbApi.transformContent(movie)));
      setNowPlayingMovies(nowPlaying.results.map(movie => tmdbApi.transformContent(movie)));
      setUpcomingMovies(upcoming.results.map(movie => tmdbApi.transformContent(movie)));

    } catch (err) {
      console.error('Failed to load movies:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  return (
    <div className="movies-page" style={{ padding: '2rem 0' }}>
      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: 'var(--netflix-white)',
          margin: '0 0 0.5rem 0'
        }}>
          Movies
        </h1>
        <p style={{ 
          color: 'var(--netflix-text-gray)', 
          fontSize: '1.1rem',
          margin: 0
        }}>
          Discover and stream thousands of movies in HD, Full HD and 4K quality.
        </p>
      </div>

      <ContentGrid
        title="Popular Movies"
        items={popularMovies}
        loading={loading}
        error={error}
        cardSize="medium"
      />

      <ContentGrid
        title="Top Rated Movies"
        items={topRatedMovies}
        loading={loading}
        error={error}
        cardSize="medium"
      />

      <ContentGrid
        title="Now Playing"
        items={nowPlayingMovies}
        loading={loading}
        error={error}
        cardSize="medium"
      />

      <ContentGrid
        title="Upcoming Movies"
        items={upcomingMovies}
        loading={loading}
        error={error}
        cardSize="medium"
      />
    </div>
  );
};

export default Movies;
