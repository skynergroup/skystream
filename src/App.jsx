import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components';
import { Home, Movies, TVShows, Anime, Search, Library, ContentDetail, PrivacyPolicy, NotFound } from './pages';
import { analytics } from './utils';
import ConsentBanner from './components/ConsentBanner.jsx';

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
    <Router>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="browse/movies" element={<Movies />} />
          <Route path="browse/tv" element={<TVShows />} />
          <Route path="browse/anime" element={<Anime />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="movie/:id" element={<ContentDetail />} />
          <Route path="tv/:id" element={<ContentDetail />} />
          <Route path="anime/:id" element={<ContentDetail />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ConsentBanner />
    </Router>
  );
}

export default App;
