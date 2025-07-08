import { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import './FilterBar.css';

const FilterBar = ({ 
  onGenreChange, 
  onLanguageChange, 
  onYearChange, 
  onRatingChange, 
  onSortChange,
  contentType = 'movie' // 'movie', 'tv', 'anime'
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filters, setFilters] = useState({
    genre: 'All Genres',
    language: 'Language',
    year: 'All Years',
    rating: 'Any Rating',
    sort: 'Smart Filter (Recommended)'
  });

  // Genre options based on content type
  const genreOptions = {
    movie: [
      'All Genres', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
      'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 
      'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
    ],
    tv: [
      'All Genres', 'Action & Adventure', 'Animation', 'Comedy', 'Crime', 
      'Documentary', 'Drama', 'Family', 'Kids', 'Mystery', 'News', 'Reality', 
      'Sci-Fi & Fantasy', 'Soap', 'Talk', 'War & Politics', 'Western'
    ],
    anime: [
      'All Genres', 'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 
      'Fantasy', 'Horror', 'Mecha', 'Music', 'Mystery', 'Romance', 
      'School', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
    ]
  };

  const languageOptions = [
    'Language', 'English', 'Spanish', 'French', 'German', 'Italian', 
    'Portuguese', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Hindi', 'Arabic'
  ];

  const yearOptions = [
    'All Years', '2025', '2024', '2023', '2022', '2021', '2020', 
    '2019', '2018', '2017', '2016', '2015', '2010s', '2000s', '1990s', '1980s'
  ];

  const ratingOptions = [
    'Any Rating', '9.0+', '8.0+', '7.0+', '6.0+', '5.0+', '4.0+', '3.0+'
  ];

  const sortOptions = [
    'Smart Filter (Recommended)',
    'Popularity (High to Low)',
    'Popularity (Low to High)',
    'Rating (High to Low)',
    'Rating (Low to High)',
    'Release Date (Newest)',
    'Release Date (Oldest)',
    'Title (A-Z)',
    'Title (Z-A)'
  ];

  const handleDropdownToggle = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setActiveDropdown(null);

    // Call the appropriate callback
    switch (filterType) {
      case 'genre':
        onGenreChange?.(value);
        break;
      case 'language':
        onLanguageChange?.(value);
        break;
      case 'year':
        onYearChange?.(value);
        break;
      case 'rating':
        onRatingChange?.(value);
        break;
      case 'sort':
        onSortChange?.(value);
        break;
    }
  };

  const DropdownButton = ({ type, options, label }) => (
    <div className="filter-dropdown">
      <button
        className={`filter-dropdown-btn ${activeDropdown === type ? 'active' : ''}`}
        onClick={() => handleDropdownToggle(type)}
      >
        <span>{filters[type] || label}</span>
        <ChevronDown size={16} className={`dropdown-icon ${activeDropdown === type ? 'rotated' : ''}`} />
      </button>
      
      {activeDropdown === type && (
        <div className="filter-dropdown-menu">
          {options.map(option => (
            <button
              key={option}
              className={`filter-dropdown-item ${filters[type] === option ? 'selected' : ''}`}
              onClick={() => handleFilterChange(type, option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="filter-bar">
      <div className="filter-bar-container">
        <div className="filter-bar-title">
          <Filter size={20} />
          <span>Filters</span>
        </div>
        
        <div className="filter-bar-controls">
          <DropdownButton 
            type="genre" 
            options={genreOptions[contentType]} 
            label="All Genres" 
          />
          
          <DropdownButton 
            type="language" 
            options={languageOptions} 
            label="Language" 
          />
          
          <DropdownButton 
            type="year" 
            options={yearOptions} 
            label="All Years" 
          />
          
          <DropdownButton 
            type="rating" 
            options={ratingOptions} 
            label="Any Rating" 
          />
          
          <DropdownButton 
            type="sort" 
            options={sortOptions} 
            label="Smart Filter (Recommended)" 
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
