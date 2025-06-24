import { useState, useEffect } from 'react';
import { ContentGrid, Loading } from '../components';
import tmdbApi from '../services/tmdbApi';

const TVShows = () => {
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState([]);
  const [airingTodayTVShows, setAiringTodayTVShows] = useState([]);
  const [onTheAirTVShows, setOnTheAirTVShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTVShows = async () => {
    try {
      setLoading(true);
      setError(null);

      const [popular, topRated, airingToday, onTheAir] = await Promise.all([
        tmdbApi.getPopularTVShows(),
        tmdbApi.getTopRatedTVShows(),
        tmdbApi.getAiringTodayTVShows(),
        tmdbApi.getOnTheAirTVShows(),
      ]);

      setPopularTVShows(popular.results.map(show => tmdbApi.transformContent(show)));
      setTopRatedTVShows(topRated.results.map(show => tmdbApi.transformContent(show)));
      setAiringTodayTVShows(airingToday.results.map(show => tmdbApi.transformContent(show)));
      setOnTheAirTVShows(onTheAir.results.map(show => tmdbApi.transformContent(show)));
    } catch (err) {
      console.error('Failed to load TV shows:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTVShows();
  }, []);

  return (
    <div className="tv-shows-page" style={{ padding: '2rem 0' }}>
      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'var(--netflix-white)',
            margin: '0 0 0.5rem 0',
          }}
        >
          TV Shows
        </h1>
        <p
          style={{
            color: 'var(--netflix-text-gray)',
            fontSize: '1.1rem',
            margin: 0,
          }}
        >
          Binge-watch the best TV series and shows from around the world.
        </p>
      </div>

      <ContentGrid
        title="Popular TV Shows"
        items={popularTVShows}
        loading={loading}
        error={error}
        cardSize="medium"
      />

      <ContentGrid
        title="Top Rated TV Shows"
        items={topRatedTVShows}
        loading={loading}
        error={error}
        cardSize="medium"
      />

      <ContentGrid
        title="Airing Today"
        items={airingTodayTVShows}
        loading={loading}
        error={error}
        cardSize="medium"
      />

      <ContentGrid
        title="On The Air"
        items={onTheAirTVShows}
        loading={loading}
        error={error}
        cardSize="medium"
      />
    </div>
  );
};

export default TVShows;
