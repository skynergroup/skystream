import { useState, useEffect } from 'react';
import { HeroBanner, ContentGrid, Loading } from '../components';
import tmdbApi from '../services/tmdbApi';

const Home = () => {
  const [featuredContent, setFeaturedContent] = useState(null);
  const [trendingContent, setTrendingContent] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load content from TMDB API
  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const homeContent = await tmdbApi.getHomePageContent();

      setFeaturedContent(homeContent.featured);
      setTrendingContent(homeContent.trending);
      setPopularMovies(homeContent.popularMovies);
      setPopularTV(homeContent.popularTV);
      setTopRated(homeContent.topRated);
    } catch (err) {
      console.error('Failed to load content:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Loading size="large" text="Loading amazing content..." />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h2 style={{ color: 'var(--netflix-red)', marginBottom: '1rem' }}>
          Failed to Load Content
        </h2>
        <p style={{ color: 'var(--netflix-text-gray)', marginBottom: '2rem' }}>
          Unable to fetch content from TMDB. Please check your API key and try again.
        </p>
        <button
          onClick={loadContent}
          style={{
            background: 'var(--netflix-red)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <HeroBanner content={featuredContent} />

      {/* Content Sections */}
      <div style={{ padding: '2rem 0' }}>
        <ContentGrid
          title="Trending Now"
          items={trendingContent}
          cardSize="medium"
          className="content-grid--horizontal"
        />

        <ContentGrid
          title="Popular Movies"
          items={popularMovies}
          cardSize="medium"
          className="content-grid--horizontal"
        />

        <ContentGrid
          title="Popular TV Shows"
          items={popularTV}
          cardSize="medium"
          className="content-grid--horizontal"
        />

        <ContentGrid
          title="Top Rated"
          items={topRated}
          cardSize="medium"
          className="content-grid--horizontal"
        />
      </div>
    </div>
  );
};

export default Home;
