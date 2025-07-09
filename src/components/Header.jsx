import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './UserProfile';
import AuthModal from './AuthModal';
import Button from './Button';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleAuthModalOpen = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/browse/movies', label: 'Movies' },
    { path: '/browse/tv', label: 'TV Shows' },
    { path: '/browse/anime', label: 'Anime' },
    { path: '/parties', label: 'Parties' },
    { path: '/library', label: 'My Library' },
  ];

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <span className="header__logo-text">SkyStream</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header__nav">
          <ul className="header__nav-list">
            {navItems.map(item => (
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

        {/* Search, Auth, and Mobile Menu */}
        <div className="header__actions">
          {/* Search */}
          <div className={`header__search ${isSearchOpen ? 'header__search--open' : ''}`}>
            <form onSubmit={handleSearchSubmit} className="header__search-form">
              <input
                type="text"
                placeholder="Search movies, TV shows, anime..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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



          {/* Authentication */}
          <div className="header__auth">
            {isAuthenticated ? (
              <UserProfile />
            ) : (
              <div className="header__auth-buttons">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleAuthModalOpen('signin')}
                  className="header__auth-btn"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => handleAuthModalOpen('signup')}
                  className="header__auth-btn"
                >
                  Sign Up
                </Button>
              </div>
            )}
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
          {navItems.map(item => (
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
              onChange={e => setSearchQuery(e.target.value)}
              className="header__mobile-search-input"
            />
            <button type="submit" className="header__mobile-search-btn">
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* Mobile Authentication */}
        {!isAuthenticated && (
          <div className="header__mobile-auth">
            <Button
              variant="ghost"
              size="medium"
              onClick={() => {
                handleAuthModalOpen('signin');
                setIsMobileMenuOpen(false);
              }}
              className="header__mobile-auth-btn"
            >
              <User size={18} />
              Sign In
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={() => {
                handleAuthModalOpen('signup');
                setIsMobileMenuOpen(false);
              }}
              className="header__mobile-auth-btn"
            >
              Sign Up
            </Button>
          </div>
        )}
      </nav>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        initialMode={authModalMode}
      />
    </header>
  );
};

export default Header;
