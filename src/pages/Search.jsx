import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import StreamingSearchBar from '../components/StreamingSearchBar';
import StreamingResultCard from '../components/StreamingResultCard';
import StreamingPlayerModal from '../components/StreamingPlayerModal';
import { Loading } from '../components';
import tmdbApi from '../services/tmdbApi';
import streamingServices from '../services/streamingServices';
import { analytics } from '../utils';
import { parseStreamingUrl } from '../utils/urlRouting';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [playerModal, setPlayerModal] = useState({
    isOpen: false,
    content: null,
    platform: null,
    embedUrl: null,
    contentType: 'movie',
    season: null,
    episode: null,
  });

  // Track page view on mount
  useEffect(() => {
    analytics.trackPageView('/', 'SkyStream - Search');
  }, []);

  // Handle deep linking - when user navigates directly to a streaming URL
  useEffect(() => {
    const parsedUrl = parseStreamingUrl(location.pathname);
    if (parsedUrl) {
      // Fetch content from TMDB using the ID from the URL
      const fetchContentForDeepLink = async () => {
        try {
          let content;
          if (parsedUrl.type === 'movie') {
            const movieData = await tmdbApi.getMovieDetails(parsedUrl.id);
            content = tmdbApi.transformContent(movieData);
          } else {
            const tvData = await tmdbApi.getTVDetails(parsedUrl.id);
            content = tmdbApi.transformContent(tvData);
          }

          // Open modal with fetched content
          const urls = streamingServices.getAllStreamingUrls(content, {
            season: parsedUrl.season || 1,
            episode: parsedUrl.episode || 1,
          });

          setPlayerModal({
            isOpen: true,
            content,
            platform: 'server1',
            embedUrl: urls.server1,
            contentType: parsedUrl.type,
            season: parsedUrl.season || 1,
            episode: parsedUrl.episode || 1,
          });
        } catch (err) {
          console.error('Failed to fetch content for deep link:', err);
        }
      };

      fetchContentForDeepLink();
    }
  }, [location.pathname]);

  // Handle search
  const handleSearch = useCallback(async query => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      // Search using TMDB API
      const searchResults = await tmdbApi.search(query);

      // Transform results
      const transformedResults = searchResults.results
        .filter(item => item.media_type !== 'person') // Filter out people
        .map(item => tmdbApi.transformContent(item))
        .slice(0, 20); // Limit to 20 results

      setSearchResults(transformedResults);

      // Track search analytics
      analytics.trackSearch(query, transformedResults.length);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err);
      setSearchResults([]);

      // Track search error
      analytics.trackError(`Search failed: ${err.message}`, 'search_error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  }, []);

  // Handle play content
  const handlePlay = useCallback((content, platform, embedUrl, options = {}) => {
    const { season = null, episode = null } = options;

    setPlayerModal({
      isOpen: true,
      content,
      platform,
      embedUrl,
      contentType: content.type || 'movie',
      season,
      episode,
    });

    // Track play event
    analytics.trackEvent('content_play', {
      category: 'streaming',
      label: platform,
      content_id: content.id,
      content_type: content.type,
      content_title: content.title,
      season,
      episode,
    });
  }, []);

  // Handle close player modal
  const handleClosePlayer = useCallback(() => {
    setPlayerModal({
      isOpen: false,
      content: null,
      platform: null,
      embedUrl: null,
      contentType: 'movie',
      season: null,
      episode: null,
    });

    // Navigate back if we're on a streaming URL
    if (parseStreamingUrl(location.pathname)) {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="streaming-app">
      {/* Hero Section */}
      <div
        style={{
          padding:
            'clamp(2rem, 8vw, 4rem) clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 2rem)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
          transition: 'background 0.3s ease',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 8vw, 3rem)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: '0 0 1rem 0',
              background:
                'linear-gradient(135deg, var(--text-primary) 0%, var(--netflix-red) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SkyStream
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: 'var(--text-secondary)',
              margin: '0 0 clamp(2rem, 6vw, 3rem) 0',
              lineHeight: '1.6',
            }}
          >
            Search and stream your favorite movies, TV shows, and anime instantly
          </p>

          {/* Search Bar */}
          <StreamingSearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder="Search for movies, TV shows, anime..."
            autoFocus={true}
          />
        </div>
      </div>

      {/* Search Results */}
      {loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            padding: '2rem',
          }}
        >
          <Loading text="Searching..." />
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <h3 style={{ color: 'var(--netflix-red)', marginBottom: '1rem' }}>Search Failed</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Unable to search content. Please try again.
          </p>
        </div>
      )}

      {!loading && hasSearched && searchResults.length > 0 && (
        <div style={{ padding: '2rem' }}>
          <h2
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '0 0 2rem 0',
              textAlign: 'center',
            }}
          >
            Search Results ({searchResults.length})
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.5rem',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {searchResults.map(content => (
              <StreamingResultCard
                key={`${content.type}-${content.id}`}
                content={content}
                onPlay={handlePlay}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && hasSearched && searchResults.length === 0 && !error && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <SearchIcon size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
          <h3
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              margin: '0 0 0.5rem 0',
            }}
          >
            No Results Found
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              maxWidth: '400px',
              margin: 0,
            }}
          >
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      )}

      {/* Streaming Player Modal */}
      <StreamingPlayerModal
        isOpen={playerModal.isOpen}
        onClose={handleClosePlayer}
        content={playerModal.content}
        platform={playerModal.platform}
        embedUrl={playerModal.embedUrl}
        contentType={playerModal.contentType}
        season={playerModal.season}
        episode={playerModal.episode}
      />
    </div>
  );
};

export default Search;
