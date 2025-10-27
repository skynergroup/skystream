import { useEffect, useState, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import LiveTVPlayer from '../components/LiveTVPlayer';
import ChannelSelector from '../components/ChannelSelector';
import ErrorBoundary from '../components/ErrorBoundary';
import { analytics } from '../utils';
import './LiveTV.css';

const LiveTV = () => {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Track page view
    analytics.trackPageView('Live TV');
  }, []);

  // Load last watched channel from localStorage
  useEffect(() => {
    const lastChannel = localStorage.getItem('lastWatchedChannel');
    if (lastChannel) {
      try {
        const channel = JSON.parse(lastChannel);
        setSelectedChannel(channel);
        setCurrentlyPlayingId(channel.nanoid);
      } catch (err) {
        console.error('Failed to load last watched channel:', err);
      }
    }
  }, []);

  const handleChannelSelect = useCallback(channel => {
    setSelectedChannel(channel);
    setCurrentlyPlayingId(channel.nanoid);

    // Save to localStorage
    localStorage.setItem('lastWatchedChannel', JSON.stringify(channel));

    // Track channel change
    analytics.trackEvent('Live TV', 'Channel Changed', channel.name);

    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleStreamError = useCallback(error => {
    console.error('Stream error:', error);
    // Could implement auto-switching to next compatible channel here
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Get stream URL from selected channel
  const getStreamUrl = () => {
    if (!selectedChannel) {
      return null;
    }

    // Priority 1: IPTV URLs (HLS streams)
    if (selectedChannel.iptv_urls && selectedChannel.iptv_urls.length > 0) {
      return {
        url: selectedChannel.iptv_urls[0],
        type: 'hls',
      };
    }

    // Priority 2: YouTube URLs
    if (selectedChannel.youtube_urls && selectedChannel.youtube_urls.length > 0) {
      return {
        url: selectedChannel.youtube_urls[0],
        type: 'youtube',
      };
    }

    // No valid stream URL available
    return null;
  };

  const getChannelName = () => {
    return selectedChannel?.name || 'SABC1 Live Stream';
  };

  return (
    <ErrorBoundary>
      <div className="live-tv-page">
        {/* Mobile Menu Toggle */}
        <button
          className={`mobile-menu-toggle ${isSidebarOpen ? 'open' : ''}`}
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <div className={`live-tv-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <ChannelSelector
            selectedChannel={selectedChannel}
            onChannelSelect={handleChannelSelect}
            currentlyPlayingId={currentlyPlayingId}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Main Content */}
        <div className="live-tv-content">
          <LiveTVPlayer
            streamData={getStreamUrl()}
            channelName={getChannelName()}
            onStreamError={handleStreamError}
          />
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default LiveTV;
