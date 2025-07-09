import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Settings } from 'lucide-react';
import ConsentPreferences from './ConsentPreferences.jsx';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showPreferences, setShowPreferences] = useState(false);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handlePrivacySettings = () => {
    setShowPreferences(true);
  };

  const footerLinks = {
    browse: [
      { path: '/browse/movies', label: 'Movies' },
      { path: '/browse/tv', label: 'TV Shows' },
      { path: '/browse/anime', label: 'Anime' },
      { path: '/library', label: 'My Library' },
      { path: '/search', label: 'Search' },
    ],
    information: [
      { path: '/privacy-policy', label: 'Privacy Policy' },
      { path: '/terms', label: 'Terms of Service' },
      { path: '/contact', label: 'Contact Us' },
      { path: '/about', label: 'About' },
    ],
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Logo and Description */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span className="footer__logo-text">SkyStream</span>
          </Link>
          <p className="footer__description">
            Your ultimate destination for streaming movies and TV shows. Stream, explore, and enjoy
            endless entertainment.
          </p>
        </div>

        {/* Trending & Latest Content Section */}
        <div className="footer__trending">
          <h4 className="footer__trending-title">Trending & Latest Content</h4>

          <div className="footer__trending-section">
            <h5 className="footer__trending-subtitle">Trending Movies</h5>
            <div className="footer__trending-links">
              <Link to="/movie/1061474" className="footer__trending-link">Superman (2025)</Link>
              <Link to="/movie/1011477" className="footer__trending-link">Karate Kid: Legends (2025)</Link>
              <Link to="/movie/541671" className="footer__trending-link">Ballerina (2025)</Link>
              <Link to="/movie/986056" className="footer__trending-link">Thunderbolts* (2025)</Link>
              <Link to="/movie/749170" className="footer__trending-link">Heads of State (2025)</Link>
              <Link to="/movie/1234821" className="footer__trending-link">Jurassic World Rebirth (2025)</Link>
            </div>
          </div>

          <div className="footer__trending-section">
            <h5 className="footer__trending-subtitle">Trending TV Shows</h5>
            <div className="footer__trending-links">
              <Link to="/tv/79166" className="footer__trending-link">Grand Blue Dreaming (2018)</Link>
              <Link to="/tv/93405" className="footer__trending-link">Squid Game (2021)</Link>
              <Link to="/tv/123249" className="footer__trending-link">My Dress-Up Darling (2022)</Link>
              <Link to="/tv/256721" className="footer__trending-link">Gachiakuta (2025)</Link>
              <Link to="/tv/82739" className="footer__trending-link">Rascal Does Not Dream of Bunny Girl Senpai (2018)</Link>
              <Link to="/tv/90802" className="footer__trending-link">The Sandman (2022)</Link>
            </div>
          </div>

          <div className="footer__quick-links">
            <Link to="/browse/movies" className="footer__quick-link">All Movies</Link>
            <Link to="/browse/tv" className="footer__quick-link">All TV Shows</Link>
            <Link to="/browse/anime" className="footer__quick-link">Anime</Link>
          </div>
        </div>

        {/* Links Sections */}
        <div className="footer__links">
          {/* Browse Section */}
          <div className="footer__section">
            <h4 className="footer__section-title">Browse</h4>
            <ul className="footer__section-list">
              {footerLinks.browse.map(link => (
                <li key={link.path} className="footer__section-item">
                  <Link to={link.path} className="footer__section-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Section */}
          <div className="footer__section">
            <h4 className="footer__section-title">Information</h4>
            <ul className="footer__section-list">
              {footerLinks.information.map(link => (
                <li key={link.path} className="footer__section-item">
                  <Link to={link.path} className="footer__section-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer__bottom">
        <div className="footer__bottom-container">
          {/* Disclaimer */}
          <div className="footer__disclaimer">
            <h5 className="footer__disclaimer-title">Important Notice</h5>
            <p className="footer__disclaimer-text">
              SkyStream does not host or store any media files. All content is sourced from
              third-party services and platforms. We respect intellectual property rights and comply
              with DMCA regulations. This platform is developed and maintained by Skyner
              Development.
            </p>
          </div>

          {/* Copyright and Version */}
          <div className="footer__copyright">
            <p className="footer__copyright-text">
              © {currentYear} SkyStream. All rights reserved.
            </p>
            <p className="footer__love-text">
              Made with ❤️ for movie lovers
            </p>
            <p className="footer__version">
              Developed by{' '}
              <a
                href="https://skyner.co.za/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--netflix-red)', textDecoration: 'none' }}
              >
                Skyner Development
              </a>{' '}
              •
              <button
                onClick={handleRefresh}
                className="footer__refresh-btn"
                title="Refresh page"
                aria-label="Refresh page"
              >
                Version 2.0 <RotateCcw size={14} />
              </button>
              •
              <button
                onClick={handlePrivacySettings}
                className="footer__privacy-btn"
                title="Privacy Settings"
                aria-label="Privacy Settings"
              >
                <Settings size={14} /> Privacy
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Consent Preferences Modal */}
      <ConsentPreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </footer>
  );
};

export default Footer;
