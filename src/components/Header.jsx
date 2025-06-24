import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/browse/movies', label: 'Movies' },
    { path: '/browse/tv', label: 'TV Shows' },
    { path: '/browse/anime', label: 'Anime' },
    { path: '/library', label: 'My Library' }
  ];

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <img src="/LOGO.png" alt="SkyStream" className="header__logo-img" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="header__nav">
          <ul className="header__nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="header__nav-item">
                <Link
                  to={item.path}
                  className={`header__nav-link ${
                    location.pathname === item.path ? 'header__nav-link--active' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Search and Mobile Menu */}
        <div className="header__actions">
          {/* Search */}
          <div className={`header__search ${isSearchOpen ? 'header__search--open' : ''}`}>
            <form onSubmit={handleSearchSubmit} className="header__search-form">
              <input
                type="text"
                placeholder="Search movies, TV shows, anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="header__search-input"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="header__search-toggle"
                aria-label="Toggle search"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="header__mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className={`header__mobile-nav ${isMobileMenuOpen ? 'header__mobile-nav--open' : ''}`}>
        <ul className="header__mobile-nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="header__mobile-nav-item">
              <Link
                to={item.path}
                className={`header__mobile-nav-link ${
                  location.pathname === item.path ? 'header__mobile-nav-link--active' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Mobile Search */}
        <div className="header__mobile-search">
          <form onSubmit={handleSearchSubmit} className="header__mobile-search-form">
            <input
              type="text"
              placeholder="Search movies, TV shows, anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header__mobile-search-input"
            />
            <button type="submit" className="header__mobile-search-btn">
              <Search size={20} />
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
};

export default Header;
