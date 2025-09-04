import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Home } from './pages';
import { analytics } from './utils';

// Analytics tracking component
function AnalyticsTracker() {
  useEffect(() => {
    // Initialize analytics on first load
    analytics.init();
    // Track initial page view
    analytics.trackPageView('/', 'SkyStream - Search & Stream');
  }, []);

  return null;
}

function App() {
  return (
    <>
      <AnalyticsTracker />
      <Home />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
