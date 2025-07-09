import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components';
import { Home, Movies, TVShows, Anime, Search, Library, Watchlist, Parties, ContentDetail, PrivacyPolicy, Terms, Contact, About, NotFound } from './pages';
import { analytics } from './utils';
import ConsentBanner from './components/ConsentBanner.jsx';
import { AuthProvider } from './contexts/AuthContext';

// SPA redirect handler for static hosting
function SPARedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a redirect stored in sessionStorage
    const redirect = sessionStorage.redirect;
    if (redirect) {
      // Clear the redirect
      delete sessionStorage.redirect;
      // Navigate to the intended path
      navigate(redirect, { replace: true });
    }
  }, [navigate]);

  return null;
}

// Analytics tracking component
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Initialize analytics on first load
    analytics.init();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    analytics.trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <SPARedirectHandler />
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="browse/movies" element={<Movies />} />
            <Route path="browse/tv" element={<TVShows />} />
            <Route path="browse/anime" element={<Anime />} />
            <Route path="search" element={<Search />} />
            <Route path="library" element={<Library />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="parties" element={<Parties />} />
            <Route path="movie/:id" element={<ContentDetail />} />
            <Route path="tv/:id" element={<ContentDetail />} />
            <Route path="anime/:id" element={<ContentDetail />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="contact" element={<Contact />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <ConsentBanner />
      </Router>
    </AuthProvider>
  );
}

export default App;
