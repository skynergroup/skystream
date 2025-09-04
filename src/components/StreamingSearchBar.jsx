import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import './StreamingSearchBar.css';

const StreamingSearchBar = ({ 
  onSearch, 
  onClear,
  placeholder = "Search for movies, TV shows, anime...",
  autoFocus = true,
  debounceMs = 300 
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchQuery) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (searchQuery.trim()) {
            setIsLoading(true);
            onSearch(searchQuery.trim()).finally(() => {
              setIsLoading(false);
            });
          } else {
            onClear?.();
          }
        }, debounceMs);
      };
    })(),
    [onSearch, onClear, debounceMs]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setIsLoading(false);
    onClear?.();
  };

  // Handle form submit (for Enter key)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      onSearch(query.trim()).finally(() => {
        setIsLoading(false);
      });
    }
  };

  return (
    <div className="streaming-search-bar">
      <form onSubmit={handleSubmit} className="streaming-search-bar__form">
        <div className="streaming-search-bar__input-container">
          <div className="streaming-search-bar__icon">
            <Search size={20} />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="streaming-search-bar__input"
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck="false"
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="streaming-search-bar__clear"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
          
          {isLoading && (
            <div className="streaming-search-bar__loading">
              <div className="streaming-search-bar__spinner"></div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default StreamingSearchBar;
