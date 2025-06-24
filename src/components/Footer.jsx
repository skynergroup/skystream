import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    browse: [
      { path: '/browse/movies', label: 'Movies' },
      { path: '/browse/tv', label: 'TV Shows' },
      { path: '/browse/anime', label: 'Anime' },
      { path: '/library', label: 'My Library' },
      { path: '/search', label: 'Search' },
    ],
    information: [
      { path: '/privacy', label: 'Privacy Policy' },
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
              Boredflix does not host or store any media files. All content is sourced from
              third-party services and platforms. We respect intellectual property rights and comply
              with DMCA regulations.
            </p>
          </div>

          {/* Copyright and Version */}
          <div className="footer__copyright">
            <p className="footer__copyright-text">
              © {currentYear} Boredflix. All rights reserved.
            </p>
            <p className="footer__version">Made with ❤️ for movie lovers • Version 2.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
