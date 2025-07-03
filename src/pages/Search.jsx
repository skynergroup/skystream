import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { ContentGrid, Loading } from '../components';
import tmdbApi from '../services/tmdbApi';
import { analytics } from '../utils';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async searchQuery => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      // Update URL
      setSearchParams({ q: searchQuery });

      // Search using TMDB API
      const searchResults = await tmdbApi.search(searchQuery);

      // Transform and filter results
      const transformedResults = searchResults.results
        .filter(item => item.media_type !== 'person') // Filter out people
        .map(item => tmdbApi.transformContent(item));

      setResults(transformedResults);

      // Track search analytics
      analytics.trackSearch(searchQuery, transformedResults.length);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err);

      // Track search error
      analytics.trackError(`Search failed: ${err.message}`, 'search_error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    performSearch(query);
  };

  const handleInputChange = e => {
    setQuery(e.target.value);
  };

  // Search on initial load if query exists
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, []);

  return (
    <div className="search-page" style={{ padding: '2rem 0' }}>
      {/* Search Header */}
      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'var(--netflix-white)',
            margin: '0 0 1rem 0',
          }}
        >
          Search
        </h1>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '1rem',
            maxWidth: '600px',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search for movies, TV shows, anime..."
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                fontSize: '1rem',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--netflix-white)',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--netflix-red)';
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            />
            <SearchIcon
              size={20}
              style={{
                position: 'absolute',
                left: '1rem',
                color: 'var(--netflix-text-gray)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              background: 'var(--netflix-red)',
              color: 'var(--netflix-white)',
              cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
              opacity: query.trim() && !loading ? 1 : 0.5,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              if (query.trim() && !loading) {
                e.target.style.background = 'var(--netflix-red-dark)';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              e.target.style.background = 'var(--netflix-red)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {hasSearched && !loading && (
          <p
            style={{
              color: 'var(--netflix-text-gray)',
              fontSize: '1rem',
              margin: 0,
            }}
          >
            {results.length > 0
              ? `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${searchParams.get('q')}"`
              : `No results found for "${searchParams.get('q')}"`}
          </p>
        )}
      </div>

      {/* Search Results */}
      {loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
          }}
        >
          <Loading text="Searching..." />
        </div>
      )}

      {!loading && hasSearched && (
        <ContentGrid
          items={results}
          loading={false}
          error={error}
          cardSize="medium"
          showTitle={false}
        />
      )}

      {/* Initial State */}
      {!hasSearched && !loading && (
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
          <SearchIcon
            size={64}
            style={{ color: 'var(--netflix-text-gray)', marginBottom: '1rem' }}
          />
          <h3
            style={{
              color: 'var(--netflix-white)',
              fontSize: '1.5rem',
              margin: '0 0 0.5rem 0',
            }}
          >
            Start Your Search
          </h3>
          <p
            style={{
              color: 'var(--netflix-text-gray)',
              fontSize: '1rem',
              maxWidth: '400px',
              margin: 0,
            }}
          >
            Enter a movie title, TV show, or anime name to discover amazing content.
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;
