import { useState, useEffect } from 'react';
import { HeroBanner, ContentGrid, Loading, ContinueWatching, TrendingSection, BoredFlixHero } from '../components';
import tmdbApi from '../services/tmdbApi';
import { analytics } from '../utils';
import { getRandomFeaturedContent } from '../utils/boredflixHelpers';

const Home = () => {
  const [featuredContent, setFeaturedContent] = useState(null);
  const [trendingContent, setTrendingContent] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
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
      setPopularAnime(homeContent.popularAnime || []);

      // Track home page content load
      analytics.trackEvent('home_content_loaded', {
        category: 'content_discovery',
        label: 'homepage',
        featured_count: homeContent.featured ? 1 : 0,
        trending_count: homeContent.trending?.length || 0,
        popular_movies_count: homeContent.popularMovies?.length || 0,
        popular_tv_count: homeContent.popularTV?.length || 0,
        top_rated_count: homeContent.topRated?.length || 0,
        popular_anime_count: homeContent.popularAnime?.length || 0,
      });
    } catch (err) {
      console.error('Failed to load content:', err);
      setError(err);

      // Track home page load error
      analytics.trackError(`Home page load failed: ${err.message}`, 'home_page_error');
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
      {/* BoredFlix-style Hero Banner */}
      <BoredFlixHero content={featuredContent} />

      {/* Content Sections - BoredFlix Layout */}
      <div style={{ padding: '2rem 0' }}>
        {/* Continue Watching Section */}
        <div style={{ padding: '0 2rem' }}>
          <ContinueWatching limit={8} />
        </div>

        {/* Trending Today - BoredFlix Style */}
        <div style={{ padding: '0 2rem' }}>
          <TrendingSection
            contentType="all"
            timeframe="day"
            limit={20}
            layout="grid"
            showTitle={true}
            showLive={true}
            showContentTypeToggle={true}
          />
        </div>

        {/* Trending This Week - BoredFlix Style */}
        <div style={{ padding: '0 2rem' }}>
          <TrendingSection
            contentType="all"
            timeframe="week"
            limit={20}
            layout="grid"
            showTitle={true}
            showContentTypeToggle={true}
          />
        </div>

        {/* Top Rated */}
        <ContentGrid
          title="Top Rated"
          items={topRated}
          cardSize="medium"
          className="content-grid--horizontal"
        />

        {/* Popular */}
        <ContentGrid
          title="Popular"
          items={popularMovies}
          cardSize="medium"
          className="content-grid--horizontal"
        />

        {/* Popular Anime */}
        <ContentGrid
          title="Popular Anime"
          items={popularAnime}
          cardSize="medium"
          className="content-grid--horizontal"
        />
      </div>
    </div>
  );
};

export default Home;
