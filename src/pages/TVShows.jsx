import { useState, useEffect } from 'react';
import { ContentGrid, Loading, FilterBar, Pagination } from '../components';
import tmdbApi from '../services/tmdbApi';
import { analytics } from '../utils';

const TVShows = () => {
  const [tvShows, setTvShows] = useState([]);
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

  const loadTVShows = async (page = 1, appliedFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      // Track filter usage
      analytics.trackEvent('tv_shows_filter_applied', {
        category: 'browse',
        label: 'tv_shows',
        filters: appliedFilters,
        page
      });

      let response;

      // Check if any filters are applied (not default values)
      const hasFilters = appliedFilters.genre !== 'All Genres' ||
                        appliedFilters.language !== 'Language' ||
                        appliedFilters.year !== 'All Years' ||
                        appliedFilters.rating !== 'Any Rating' ||
                        appliedFilters.sort !== 'Smart Filter (Recommended)';

      if (hasFilters) {
        // Use discover endpoint with filters
        const params = { page };

        // Apply genre filter
        if (appliedFilters.genre !== 'All Genres') {
          const tvGenres = await tmdbApi.getTVGenres();
          const genre = tvGenres.genres.find(g => g.name === appliedFilters.genre);
          if (genre) {
            params.with_genres = genre.id;
          }
        }

        // Apply year filter
        if (appliedFilters.year !== 'All Years') {
          if (appliedFilters.year.includes('s')) {
            // Handle decade filters like "2010s", "2000s"
            const decade = appliedFilters.year.replace('s', '');
            const startYear = parseInt(decade);
            const endYear = startYear + 9;
            params['first_air_date.gte'] = `${startYear}-01-01`;
            params['first_air_date.lte'] = `${endYear}-12-31`;
          } else {
            params.first_air_date_year = appliedFilters.year;
          }
        }

        // Apply rating filter
        if (appliedFilters.rating !== 'Any Rating') {
          const minRating = parseFloat(appliedFilters.rating.replace('+', ''));
          params['vote_average.gte'] = minRating;
        }

        // Apply language filter
        if (appliedFilters.language !== 'Language') {
          const languageMap = {
            'English': 'en',
            'Spanish': 'es',
            'French': 'fr',
            'German': 'de',
            'Italian': 'it',
            'Portuguese': 'pt',
            'Russian': 'ru',
            'Japanese': 'ja',
            'Korean': 'ko',
            'Chinese': 'zh',
            'Hindi': 'hi',
            'Arabic': 'ar'
          };
          if (languageMap[appliedFilters.language]) {
            params.with_original_language = languageMap[appliedFilters.language];
          }
        }

        // Apply sort filter
        if (appliedFilters.sort !== 'Smart Filter (Recommended)') {
          const sortMap = {
            'Popularity (High to Low)': 'popularity.desc',
            'Popularity (Low to High)': 'popularity.asc',
            'Rating (High to Low)': 'vote_average.desc',
            'Rating (Low to High)': 'vote_average.asc',
            'Release Date (Newest)': 'first_air_date.desc',
            'Release Date (Oldest)': 'first_air_date.asc',
            'Title (A-Z)': 'name.asc',
            'Title (Z-A)': 'name.desc'
          };
          params.sort_by = sortMap[appliedFilters.sort] || 'popularity.desc';
        } else {
          params.sort_by = 'popularity.desc';
        }

        response = await tmdbApi.discoverTVShows(params);
      } else {
        // Use popular TV shows as default
        response = await tmdbApi.getPopularTVShows(page);
      }

      setTvShows(response.results.map(show => tmdbApi.transformContent(show)));
      setTotalPages(Math.min(response.total_pages, 1000)); // TMDB limits to 1000 pages
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load TV shows:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTVShows(1, filters);
  }, []);

  // Filter handlers
  const handleGenreChange = (genre) => {
    const newFilters = { ...filters, genre };
    setFilters(newFilters);
    loadTVShows(1, newFilters);
  };

  const handleLanguageChange = (language) => {
    const newFilters = { ...filters, language };
    setFilters(newFilters);
    loadTVShows(1, newFilters);
  };

  const handleYearChange = (year) => {
    const newFilters = { ...filters, year };
    setFilters(newFilters);
    loadTVShows(1, newFilters);
  };

  const handleRatingChange = (rating) => {
    const newFilters = { ...filters, rating };
    setFilters(newFilters);
    loadTVShows(1, newFilters);
  };

  const handleSortChange = (sort) => {
    const newFilters = { ...filters, sort };
    setFilters(newFilters);
    loadTVShows(1, newFilters);
  };

  const handlePageChange = (page) => {
    loadTVShows(page, filters);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && tvShows.length === 0) {
    return <Loading />;
  }

  return (
    <div className="tv-shows-page">
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
          Browse TV Shows
        </h1>
      </div>

      {/* Filter Bar */}
      <FilterBar
        contentType="tv"
        onGenreChange={handleGenreChange}
        onLanguageChange={handleLanguageChange}
        onYearChange={handleYearChange}
        onRatingChange={handleRatingChange}
        onSortChange={handleSortChange}
      />

      {/* TV Shows Grid */}
      <div style={{ padding: '0 2rem' }}>
        {error ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--netflix-text-gray)'
          }}>
            <p>Failed to load TV shows. Please try again.</p>
          </div>
        ) : (
          <ContentGrid
            items={tvShows}
            loading={loading}
            cardSize="medium"
            showTitle={false}
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && tvShows.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default TVShows;
