import { useState, useEffect } from 'react';
import { Bookmark, Clock, Heart } from 'lucide-react';
import { ContentGrid, Loading } from '../components';

const Library = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('watchlist');

  // Mock library data
  const mockWatchlist = [
    {
      id: 299534,
      title: 'Avengers: Endgame',
      poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
      overview: 'After the devastating events of Avengers: Infinity War...',
      release_date: '2019-04-24',
      vote_average: 8.3,
      type: 'movie',
    },
    {
      id: 1399,
      name: 'Game of Thrones',
      poster_path: '/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg',
      backdrop_path: '/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
      overview: 'Seven noble families fight for control of the mythical land of Westeros...',
      first_air_date: '2011-04-17',
      vote_average: 8.3,
      type: 'tv',
    },
  ];

  const mockFavorites = [
    {
      id: 155,
      title: 'The Dark Knight',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      backdrop_path: '/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
      overview: 'Batman raises the stakes in his war on crime...',
      release_date: '2008-07-16',
      vote_average: 9.0,
      type: 'movie',
    },
  ];

  const mockContinueWatching = [
    {
      id: 94605,
      name: 'Arcane',
      poster_path: '/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
      backdrop_path: '/rkB4LyZHo1NHXFEDHl9vSD9r1lI.jpg',
      overview: 'Amid the stark discord of twin cities Piltover and Zaun...',
      first_air_date: '2021-11-06',
      vote_average: 8.7,
      type: 'tv',
      progress: 65, // Progress percentage
    },
  ];

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        setWatchlist(mockWatchlist);
        setFavorites(mockFavorites);
        setContinueWatching(mockContinueWatching);
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, []);

  const tabs = [
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark, data: watchlist },
    { id: 'favorites', label: 'Favorites', icon: Heart, data: favorites },
    { id: 'continue', label: 'Continue Watching', icon: Clock, data: continueWatching },
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
                {tab.data.length > 0 && (
                  <span
                    style={{
                      background: 'var(--netflix-red)',
                      color: 'var(--netflix-white)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      minWidth: '20px',
                      textAlign: 'center',
                    }}
                  >
                    {tab.data.length}
                  </span>
                )}
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
                  Your {activeTabData.label} is Empty
                </h3>
                <p
                  style={{
                    color: 'var(--netflix-text-gray)',
                    fontSize: '1rem',
                    maxWidth: '400px',
                    margin: 0,
                  }}
                >
                  {activeTab === 'watchlist' && 'Add movies and shows you want to watch later.'}
                  {activeTab === 'favorites' && 'Mark content as favorite to find it easily.'}
                  {activeTab === 'continue' && 'Your viewing progress will appear here.'}
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
