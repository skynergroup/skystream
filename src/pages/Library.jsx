import { useState, useEffect } from 'react';
import { Bookmark, Clock, Eye } from 'lucide-react';
import { ContentGrid, Loading } from '../components';

const Library = () => {
  const [wantToWatch, setWantToWatch] = useState([]);
  const [currentlyWatching, setCurrentlyWatching] = useState([]);
  const [watchedHistory, setWatchedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('want-to-watch');

  // Mock library data - empty to match BoredFlix
  const mockWantToWatch = [];
  const mockCurrentlyWatching = [];
  const mockWatchedHistory = [];

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        setWantToWatch(mockWantToWatch);
        setCurrentlyWatching(mockCurrentlyWatching);
        setWatchedHistory(mockWatchedHistory);
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, []);

  const tabs = [
    { id: 'want-to-watch', label: 'Want to Watch', icon: Bookmark, data: wantToWatch, count: wantToWatch.length },
    { id: 'currently-watching', label: 'Currently Watching', icon: Clock, data: currentlyWatching, count: currentlyWatching.length },
    { id: 'watched-history', label: 'Watched History', icon: Eye, data: watchedHistory, count: watchedHistory.length },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Loading size="large" text="Loading your library..." />
      </div>
    );
  }

  return (
    <div className="library-page" style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'var(--netflix-white)',
            margin: '0 0 0.5rem 0',
          }}
        >
          My Library
        </h1>
        <p
          style={{
            color: 'var(--netflix-text-gray)',
            fontSize: '1.1rem',
            margin: 0,
          }}
        >
          Keep track of what you want to watch and continue where you left off.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          padding: '0 2rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
          }}
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  color: isActive ? 'var(--netflix-red)' : 'var(--netflix-text-gray)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.target.style.color = 'var(--netflix-white)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.target.style.color = 'var(--netflix-text-gray)';
                    e.target.style.background = 'none';
                  }
                }}
              >
                <Icon size={20} />
                {tab.label}
                <span
                  style={{
                    color: 'inherit',
                    fontSize: '0.9rem',
                    fontWeight: '400',
                    marginLeft: '0.25rem',
                  }}
                >
                  ({tab.count})
                </span>
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-1rem',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--netflix-red)',
                      borderRadius: '1px',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 2rem' }}>
        {activeTabData?.data.length > 0 ? (
          <ContentGrid items={activeTabData.data} cardSize="medium" showTitle={false} />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            {activeTabData && (
              <>
                <activeTabData.icon
                  size={64}
                  style={{ color: 'var(--netflix-text-gray)', marginBottom: '1rem' }}
                />
                <h3
                  style={{
                    color: 'var(--netflix-white)',
                    fontSize: '1.5rem',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  Your watchlist is empty
                </h3>
                <p
                  style={{
                    color: 'var(--netflix-text-gray)',
                    fontSize: '1rem',
                    maxWidth: '400px',
                    margin: 0,
                  }}
                >
                  Add movies and TV shows to your watchlist by clicking the "Save to Watchlist" button while watching.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
