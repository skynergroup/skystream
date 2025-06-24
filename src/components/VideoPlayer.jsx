import { useState, useEffect, useRef } from 'react';
import { X, Settings, Download, Maximize } from 'lucide-react';
import Button from './Button';
import { PLAYER_CONFIG, utils } from '../utils/config';
import './VideoPlayer.css';

const VideoPlayer = ({ 
  contentId, 
  contentType = 'movie', 
  season = null, 
  episode = null,
  onClose,
  autoPlay = true,
  preferredPlayer = PLAYER_CONFIG.defaults.player // 'videasy' or 'vidsrc'
}) => {
  const [currentPlayer, setCurrentPlayer] = useState(preferredPlayer);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const iframeRef = useRef(null);

  // Generate player URL with error handling
  const [playerUrl, setPlayerUrl] = useState('');

  useEffect(() => {
    const generatePlayerUrl = async () => {
      try {
        let url;
        if (currentPlayer === 'godrive') {
          // Use async version for GoDrive to get IMDB IDs
          url = await utils.generatePlayerUrlAsync(
            currentPlayer,
            contentId,
            contentType,
            season,
            episode,
            { autoplay: autoPlay ? 'true' : 'false' }
          );
        } else {
          // Use synchronous version for other players
          url = utils.generatePlayerUrl(
            currentPlayer,
            contentId,
            contentType,
            season,
            episode,
            { autoplay: autoPlay ? 'true' : 'false' }
          );
        }
        setPlayerUrl(url);
        console.log('Generated player URL:', url);
      } catch (error) {
        console.error('Failed to generate player URL:', error);
        setPlayerUrl('');
        setError(`Failed to generate ${currentPlayer} player URL: ${error.message}`);
      }
    };

    generatePlayerUrl();
  }, [currentPlayer, contentId, contentType, season, episode, autoPlay]);

  const handleIframeLoad = () => {
    console.log('Video player loaded successfully:', playerUrl);
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    console.error('Video player failed to load:', playerUrl);
    setIsLoading(false);
    const errorMessage = `Failed to load ${currentPlayer} player. The content might not be available on this service.`;
    setError(errorMessage);

    // Auto-fallback to next player if current one fails
    if (currentPlayer === 'godrive') {
      console.log('GoDrive failed, will suggest trying Videasy...');
    } else if (currentPlayer === 'videasy') {
      console.log('Videasy failed, will suggest trying VidSrc...');
    }
  };

  const switchPlayer = async (newPlayer) => {
    setCurrentPlayer(newPlayer);
    setIsLoading(true);
    setError(null);
    setShowSettings(false);

    // Regenerate URL for new player
    try {
      let url;
      if (newPlayer === 'godrive') {
        // Use async version for GoDrive to get IMDB IDs
        url = await utils.generatePlayerUrlAsync(
          newPlayer,
          contentId,
          contentType,
          season,
          episode,
          { autoplay: autoPlay ? 'true' : 'false' }
        );
      } else {
        // Use synchronous version for other players
        url = utils.generatePlayerUrl(
          newPlayer,
          contentId,
          contentType,
          season,
          episode,
          { autoplay: autoPlay ? 'true' : 'false' }
        );
      }
      setPlayerUrl(url);
      console.log('Switched to player:', newPlayer, 'URL:', url);
    } catch (error) {
      console.error('Failed to generate player URL:', error);
      setPlayerUrl('');
      setError(`Failed to switch to ${newPlayer} player: ${error.message}`);
    }
  };

  const handleDownload = () => {
    // Open VidSrc download service
    const downloadUrl = utils.getDownloadUrl(contentId);
    window.open(downloadUrl, '_blank');
  };

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  // Set up progress tracking for Videasy
  useEffect(() => {
    if (currentPlayer === 'videasy') {
      const handleMessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const progressData = JSON.parse(event.data);
            // Save progress to localStorage
            const key = `progress_${contentType}_${contentId}${season && episode ? `_s${season}e${episode}` : ''}`;
            localStorage.setItem(key, JSON.stringify(progressData));
          } catch (e) {
            // Ignore non-JSON messages
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [currentPlayer, contentId, contentType, season, episode]);

  return (
    <div className="video-player-overlay">
      <div className="video-player-container">
        {/* Header */}
        <div className="video-player-header">
          <div className="video-player-title">
            {contentType === 'tv' && season && episode 
              ? `S${season}E${episode}` 
              : contentType.toUpperCase()
            }
          </div>
          
          <div className="video-player-controls">
            <Button
              variant="ghost"
              size="small"
              icon={<Download size={16} />}
              onClick={handleDownload}
              title="Download"
            />
            
            <Button
              variant="ghost"
              size="small"
              icon={<Settings size={16} />}
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            />
            
            <Button
              variant="ghost"
              size="small"
              icon={<Maximize size={16} />}
              onClick={toggleFullscreen}
              title="Fullscreen"
            />
            
            <Button
              variant="ghost"
              size="small"
              icon={<X size={16} />}
              onClick={onClose}
              title="Close"
            />
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="video-player-settings">
            <h4>Player Settings</h4>
            
            <div className="setting-group">
              <label>Video Player:</label>
              <div className="player-options">
                <button
                  className={`player-option ${currentPlayer === 'godrive' ? 'active' : ''}`}
                  onClick={() => switchPlayer('godrive')}
                >
                  GoDrive (Recommended)
                </button>
                <button
                  className={`player-option ${currentPlayer === 'videasy' ? 'active' : ''}`}
                  onClick={() => switchPlayer('videasy')}
                >
                  Videasy
                </button>
                <button
                  className={`player-option ${currentPlayer === 'vidsrc' ? 'active' : ''}`}
                  onClick={() => switchPlayer('vidsrc')}
                >
                  VidSrc
                </button>
              </div>
            </div>
            
            <div className="setting-group">
              <label>Language Preference:</label>
              <div className="player-options">
                <button
                  className="player-option active"
                  onClick={() => {
                    // Regenerate URL with English preference
                    switchPlayer(currentPlayer);
                  }}
                >
                  English
                </button>
                <button
                  className="player-option"
                  onClick={() => {
                    // Switch to original language
                    switchPlayer(currentPlayer);
                  }}
                >
                  Original Language
                </button>
              </div>
            </div>

            {contentType === 'anime' && currentPlayer === 'videasy' && (
              <div className="setting-group">
                <label>Audio:</label>
                <div className="player-options">
                  <button className="player-option active">
                    Subtitled (English)
                  </button>
                  <button
                    className="player-option"
                    onClick={() => {
                      // Switch to dubbed version
                      const newUrl = playerUrl.replace('dub=false', 'dub=true');
                      if (iframeRef.current) {
                        iframeRef.current.src = newUrl;
                      }
                    }}
                  >
                    Dubbed (English)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Player */}
        <div className="video-player-content">
          {isLoading && (
            <div className="video-player-loading">
              <div className="loading-spinner"></div>
              <p>Loading {currentPlayer} player...</p>
            </div>
          )}
          
          {(error || !playerUrl) && (
            <div className="video-player-error">
              <h3>Player Error</h3>
              <p>{error?.message || 'Unable to generate player URL. This content might not be available for streaming.'}</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {currentPlayer !== 'godrive' && (
                  <Button
                    variant="primary"
                    onClick={() => switchPlayer('godrive')}
                  >
                    Try GoDrive Player
                  </Button>
                )}
                {currentPlayer !== 'videasy' && (
                  <Button
                    variant="primary"
                    onClick={() => switchPlayer('videasy')}
                  >
                    Try Videasy Player
                  </Button>
                )}
                {currentPlayer !== 'vidsrc' && (
                  <Button
                    variant="primary"
                    onClick={() => switchPlayer('vidsrc')}
                  >
                    Try VidSrc Player
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={onClose}
                >
                  Close Player
                </Button>
              </div>
              {playerUrl && (
                <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--netflix-text-gray)' }}>
                  Player URL: {playerUrl}
                </p>
              )}
            </div>
          )}
          
          {currentPlayer === 'godrive' && playerUrl && !error ? (
            // GoDrive player opens in new tab due to iframe restrictions
            <div className="godrive-player-notice">
              <div className="notice-content">
                <h3>🎬 GoDrive Player</h3>
                <p>GoDrive player will open in a new tab for the best viewing experience.</p>
                <div className="notice-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '1rem 0' }}>
                  <Button
                    variant="primary"
                    size="large"
                    onClick={() => {
                      window.open(playerUrl, '_blank', 'width=1280,height=720,scrollbars=yes,resizable=yes');
                      setIsLoading(false);
                    }}
                  >
                    Open GoDrive Player
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => switchPlayer('videasy')}
                  >
                    Try Videasy Instead
                  </Button>
                </div>
                <div className="debug-info" style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <small style={{ color: 'var(--netflix-text-gray)' }}>Player URL: {playerUrl}</small>
                </div>
              </div>
            </div>
          ) : (
            // Other players use iframe
            playerUrl && !error && (
              <iframe
                ref={iframeRef}
                src={playerUrl}
                className="video-player-iframe"
                frameBorder="0"
                allowFullScreen
                allow="encrypted-media; autoplay; picture-in-picture"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ display: isLoading || error || !playerUrl ? 'none' : 'block' }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
