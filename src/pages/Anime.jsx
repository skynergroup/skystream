import { useState, useEffect } from 'react';
import { ContentGrid, Loading, FilterBar, Pagination } from '../components';
import tmdbApi from '../services/tmdbApi';
import { analytics } from '../utils';

const Anime = () => {
  const [anime, setAnime] = useState([]);
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

  const loadAnime = async (page = 1, appliedFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      // Track filter usage
      analytics.trackEvent('anime_filter_applied', {
        category: 'browse',
        label: 'anime',
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
        // Use discover endpoint with filters for anime
        const params = {
          page,
          with_origin_country: 'JP', // Keep anime filter
          with_genres: '16' // Animation genre ID
        };

        // Apply additional genre filter (combine with animation)
        if (appliedFilters.genre !== 'All Genres') {
          const tvGenres = await tmdbApi.getTVGenres();
          const genre = tvGenres.genres.find(g => g.name === appliedFilters.genre);
          if (genre && genre.id !== 16) { // Don't duplicate animation genre
            params.with_genres = `16,${genre.id}`; // Combine animation with selected genre
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

        // Apply language filter (for anime, this might be less relevant but still supported)
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
        // Use default anime content
        response = await tmdbApi.getAnimeContent(page);
      }

      setAnime(
        response.results.map(show => ({
          ...tmdbApi.transformContent(show),
          type: 'anime',
        }))
      );
      setTotalPages(Math.min(response.total_pages || 50, 1000)); // Default to 50 pages for anime
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load anime:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnime(1, filters);
  }, []);

  // Filter handlers
  const handleGenreChange = (genre) => {
    const newFilters = { ...filters, genre };
    setFilters(newFilters);
    loadAnime(1, newFilters);
  };

  const handleLanguageChange = (language) => {
    const newFilters = { ...filters, language };
    setFilters(newFilters);
    loadAnime(1, newFilters);
  };

  const handleYearChange = (year) => {
    const newFilters = { ...filters, year };
    setFilters(newFilters);
    loadAnime(1, newFilters);
  };

  const handleRatingChange = (rating) => {
    const newFilters = { ...filters, rating };
    setFilters(newFilters);
    loadAnime(1, newFilters);
  };

  const handleSortChange = (sort) => {
    const newFilters = { ...filters, sort };
    setFilters(newFilters);
    loadAnime(1, newFilters);
  };

  const handlePageChange = (page) => {
    loadAnime(page, filters);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && anime.length === 0) {
    return <Loading />;
  }

  return (
    <div className="anime-page">
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
          Browse Anime
        </h1>
      </div>

      {/* Filter Bar */}
      <FilterBar
        contentType="anime"
        onGenreChange={handleGenreChange}
        onLanguageChange={handleLanguageChange}
        onYearChange={handleYearChange}
        onRatingChange={handleRatingChange}
        onSortChange={handleSortChange}
      />

      {/* Anime Grid */}
      <div style={{ padding: '0 2rem' }}>
        {error ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--netflix-text-gray)'
          }}>
            <p>Failed to load anime. Please try again.</p>
          </div>
        ) : (
          <ContentGrid
            items={anime}
            loading={loading}
            cardSize="medium"
            showTitle={false}
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && anime.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Anime;
