import { useState, useEffect } from 'react';
import { ContentGrid, Loading, FilterBar, Pagination } from '../components';
import tmdbApi from '../services/tmdbApi';
import { analytics } from '../utils';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    genre: 'All Genres',
    language: 'Language',
    year: 'All Years',
    rating: 'Any Rating',
    sort: 'Smart Filter (Recommended)'
  });

  const loadMovies = async (page = 1, appliedFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      // Track filter usage
      analytics.trackEvent('movies_filter_applied', {
        category: 'browse',
        label: 'movies',
        filters: appliedFilters,
        page
      });

      // For now, use popular movies as the base
      // In a real app, you'd apply the filters to the API call
      const response = await tmdbApi.getPopularMovies(page);

      setMovies(response.results.map(movie => tmdbApi.transformContent(movie)));
      setTotalPages(Math.min(response.total_pages, 1000)); // TMDB limits to 1000 pages
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load movies:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies(1, filters);
  }, []);

  // Filter handlers
  const handleGenreChange = (genre) => {
    const newFilters = { ...filters, genre };
    setFilters(newFilters);
    loadMovies(1, newFilters);
  };

  const handleLanguageChange = (language) => {
    const newFilters = { ...filters, language };
    setFilters(newFilters);
    loadMovies(1, newFilters);
  };

  const handleYearChange = (year) => {
    const newFilters = { ...filters, year };
    setFilters(newFilters);
    loadMovies(1, newFilters);
  };

  const handleRatingChange = (rating) => {
    const newFilters = { ...filters, rating };
    setFilters(newFilters);
    loadMovies(1, newFilters);
  };

  const handleSortChange = (sort) => {
    const newFilters = { ...filters, sort };
    setFilters(newFilters);
    loadMovies(1, newFilters);
  };

  const handlePageChange = (page) => {
    loadMovies(page, filters);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && movies.length === 0) {
    return <Loading />;
  }

  return (
    <div className="movies-page">
      {/* Header */}
      <div style={{ padding: '2rem 2rem 0 2rem' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'var(--netflix-white)',
            margin: '0 0 0.5rem 0',
          }}
        >
          Browse Movies
        </h1>
      </div>

      {/* Filter Bar */}
      <FilterBar
        contentType="movie"
        onGenreChange={handleGenreChange}
        onLanguageChange={handleLanguageChange}
        onYearChange={handleYearChange}
        onRatingChange={handleRatingChange}
        onSortChange={handleSortChange}
      />

      {/* Movies Grid */}
      <div style={{ padding: '0 2rem' }}>
        {error ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--netflix-text-gray)'
          }}>
            <p>Failed to load movies. Please try again.</p>
          </div>
        ) : (
          <ContentGrid
            items={movies}
            loading={loading}
            cardSize="medium"
            showTitle={false}
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && movies.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Movies;
