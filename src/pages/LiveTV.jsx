import { useEffect } from 'react';
import LiveTVPlayer from '../components/LiveTVPlayer';
import ErrorBoundary from '../components/ErrorBoundary';
import { analytics } from '../utils';
import './LiveTV.css';

const LiveTV = () => {
  useEffect(() => {
    // Track page view
    analytics.trackPageView('Live TV');
  }, []);

  return (
    <ErrorBoundary>
      <div className="live-tv-page">
        <div className="live-tv-content">
          <LiveTVPlayer streamUrl="https://sabconeta.cdn.mangomolo.com/sabc1/smil:sabc1.stream.smil/master.m3u8" />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LiveTV;

