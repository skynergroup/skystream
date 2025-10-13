import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Tv } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="layout">
      {/* Header */}
      <header className="layout__header">
        <div className="layout__header-container">
          <Link to="/home" className="layout__logo">
            <h1 className="layout__logo-text">SkyStream</h1>
          </Link>

          <nav className="layout__nav">
            <Link
              to="/home"
              className={`layout__nav-link ${location.pathname === '/home' ? 'layout__nav-link--active' : ''}`}
            >
              <Home size={20} />
              <span>Discover</span>
            </Link>
            <Link
              to="/"
              className={`layout__nav-link ${location.pathname === '/' ? 'layout__nav-link--active' : ''}`}
            >
              <Search size={20} />
              <span>Search</span>
            </Link>
            <span className="layout__nav-link layout__nav-link--disabled" title="Coming Soon">
              <Tv size={20} />
              <span>Live TV</span>
            </span>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="layout__main">{children}</main>

      {/* Footer */}
      <footer className="layout__footer">
        <div className="layout__footer-container">
          <p className="layout__footer-text">
            SkyStream - Search and stream your favorite content instantly
          </p>
          <p className="layout__footer-disclaimer">
            Content provided by third-party services. We do not host any content.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
