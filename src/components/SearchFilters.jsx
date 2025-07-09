import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import Button from './Button';
import './SearchFilters.css';

const SearchFilters = ({ 
  onFiltersChange, 
  initialFilters = {},
  availableGenres = [],
  isLoading = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', // all, movie, tv, anime
    genre: '',
    year: '',
    rating: '',
    sortBy: 'popularity.desc',
    ...initialFilters
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const ratingRanges = [
    { value: '', label: 'Any Rating' },
    { value: '9-10', label: '9.0+ Excellent' },
    { value: '8-9', label: '8.0-8.9 Very Good' },
    { value: '7-8', label: '7.0-7.9 Good' },
    { value: '6-7', label: '6.0-6.9 Average' },
    { value: '0-6', label: 'Below 6.0' }
  ];

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' },
    { value: 'title.asc', label: 'A-Z' },
    { value: 'title.desc', label: 'Z-A' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Content' },
    { value: 'movie', label: 'Movies' },
    { value: 'tv', label: 'TV Shows' },
    { value: 'anime', label: 'Anime' }
  ];

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    const defaultFilters = {
      type: 'all',
      genre: '',
      year: '',
      rating: '',
      sortBy: 'popularity.desc'
    };
    setFilters(defaultFilters);
  };

  const hasActiveFilters = () => {
    return filters.type !== 'all' || 
           filters.genre !== '' || 
           filters.year !== '' || 
           filters.rating !== '' ||
           filters.sortBy !== 'popularity.desc';
  };

  return (
    <div className="search-filters">
      <div className="search-filters__header">
        <Button
          variant="ghost"
          size="small"
          icon={<Filter size={16} />}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`search-filters__toggle ${isExpanded ? 'active' : ''}`}
        >
          Filters {hasActiveFilters() && <span className="filter-count">•</span>}
        </Button>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="small"
            icon={<X size={16} />}
            onClick={clearFilters}
            className="search-filters__clear"
          >
            Clear All
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="search-filters__panel">
          <div className="search-filters__grid">
            {/* Content Type Filter */}
            <div className="filter-group">
              <label className="filter-label">Content Type</label>
              <div className="filter-select">
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  disabled={isLoading}
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>

            {/* Genre Filter */}
            <div className="filter-group">
              <label className="filter-label">Genre</label>
              <div className="filter-select">
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  disabled={isLoading || availableGenres.length === 0}
                >
                  <option value="">All Genres</option>
                  {availableGenres.map(genre => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>

            {/* Year Filter */}
            <div className="filter-group">
              <label className="filter-label">Release Year</label>
              <div className="filter-select">
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Any Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <label className="filter-label">Rating</label>
              <div className="filter-select">
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  disabled={isLoading}
                >
                  {ratingRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>

            {/* Sort By Filter */}
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <div className="filter-select">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  disabled={isLoading}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="search-filters__summary">
              <span className="summary-label">Active filters:</span>
              <div className="summary-tags">
                {filters.type !== 'all' && (
                  <span className="filter-tag">
                    {typeOptions.find(t => t.value === filters.type)?.label}
                  </span>
                )}
                {filters.genre && (
                  <span className="filter-tag">
                    {availableGenres.find(g => g.id.toString() === filters.genre)?.name}
                  </span>
                )}
                {filters.year && (
                  <span className="filter-tag">{filters.year}</span>
                )}
                {filters.rating && (
                  <span className="filter-tag">
                    {ratingRanges.find(r => r.value === filters.rating)?.label}
                  </span>
                )}
                {filters.sortBy !== 'popularity.desc' && (
                  <span className="filter-tag">
                    {sortOptions.find(s => s.value === filters.sortBy)?.label}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
