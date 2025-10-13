import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Search, Discover } from './pages';
import { Layout } from './components';
import { analytics } from './utils';

// Analytics tracking component
function AnalyticsTracker() {
  useEffect(() => {
    // Initialize analytics on first load
    analytics.init();
  }, []);

  return null;
}

function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <Layout>
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/home" element={<Discover />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Analytics />
      <SpeedInsights />
    </Router>
  );
}

export default App;
