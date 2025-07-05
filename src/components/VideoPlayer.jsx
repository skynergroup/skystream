import { useState, useEffect, useRef } from 'react';
import { X, Settings, Download, Maximize } from 'lucide-react';
import Button from './Button';
import { PLAYER_CONFIG, utils, analytics } from '../utils';
import './VideoPlayer.css';

const VideoPlayer = ({
  contentId,
  contentType = 'movie',
  season = null,
  episode = null,
  onClose,
  autoPlay = true,
  preferredPlayer = 'videasy', // Default to videasy as preferred
}) => {
  const [currentPlayer, setCurrentPlayer] = useState(preferredPlayer);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isDubbed, setIsDubbed] = useState(true); // Default to English dub for anime
  const iframeRef = useRef(null);

  // Generate player URL with error handling
  const [playerUrl, setPlayerUrl] = useState('');

  useEffect(() => {
    const generatePlayerUrl = async () => {
      try {
        let url;
        // Use synchronous version for all players
        const playerOptions = {
          autoplay: autoPlay ? 'true' : 'false',
        };

        // Add dub option for anime
        if (contentType === 'anime') {
          playerOptions.dub = isDubbed ? 'true' : 'false';
        }

        url = utils.generatePlayerUrl(currentPlayer, contentId, contentType, season, episode, playerOptions);
        setPlayerUrl(url);
        console.log('Generated player URL:', url);
      } catch (error) {
        console.error('Failed to generate player URL:', error);
        setPlayerUrl('');
        setError(`Failed to generate ${currentPlayer} player URL: ${error.message}`);
      }
    };

    generatePlayerUrl();
  }, [currentPlayer, contentId, contentType, season, episode, autoPlay, isDubbed]);

  const handleIframeLoad = () => {
    console.log('Video player loaded successfully:', playerUrl);
    setIsLoading(false);
    setError(null);

    // Track successful video load with player performance
    const contentTitle = contentType === 'movie' ?
      `Movie ${contentId}` :
      `${contentType} ${contentId} S${season}E${episode}`;

    const playerInfo = {
      player: currentPlayer,
      season: season,
      episode: episode,
    };

    analytics.trackVideoEvent('load_success', contentType, contentId, contentTitle, playerInfo);

    // Track player performance
    analytics.trackPlayerPerformance(currentPlayer, contentType, {
      success: true,
      loadTime: null, // Could be enhanced with actual load time measurement
    });
  };

  const handleIframeError = () => {
    console.error('Video player failed to load:', playerUrl);
    setIsLoading(false);
    const errorMessage = `Failed to load ${currentPlayer} player. The content might not be available on this service.`;
    setError(errorMessage);

    // Track video load error with player info
    const contentTitle = contentType === 'movie' ?
      `Movie ${contentId}` :
      `${contentType} ${contentId} S${season}E${episode}`;

    const playerInfo = {
      player: currentPlayer,
      season: season,
      episode: episode,
    };

    analytics.trackVideoEvent('load_error', contentType, contentId, contentTitle, playerInfo);
    analytics.trackError(`Video player error: ${errorMessage}`, 'video_player_error');

    // Track player performance failure
    analytics.trackPlayerPerformance(currentPlayer, contentType, {
      success: false,
      errorType: 'load_failure',
    });

    // Auto-fallback to next player if current one fails
    if (currentPlayer === 'videasy') {
      console.log('Videasy failed, will suggest trying VidSrc...');
    } else if (currentPlayer === 'vidsrc') {
      console.log('VidSrc failed, will suggest trying Videasy...');
    }
  };

  // Analytics-aware close handler
  const handleClose = () => {
    const contentTitle = contentType === 'movie' ?
      `Movie ${contentId}` :
      `${contentType} ${contentId} S${season}E${episode}`;

    const playerInfo = {
      player: currentPlayer,
      season: season,
      episode: episode,
    };

    analytics.trackVideoEvent('close', contentType, contentId, contentTitle, playerInfo);
    onClose();
  };

  const switchPlayer = async newPlayer => {
    setCurrentPlayer(newPlayer);
    setIsLoading(true);
    setError(null);
    setShowSettings(false);

    // Regenerate URL for new player
    try {
      // Use synchronous version for all players
      const playerOptions = {
        autoplay: autoPlay ? 'true' : 'false',
      };

      // Add dub option for anime
      if (contentType === 'anime') {
        playerOptions.dub = isDubbed ? 'true' : 'false';
      }

      const url = utils.generatePlayerUrl(newPlayer, contentId, contentType, season, episode, playerOptions);
      setPlayerUrl(url);
      console.log('Switched to player:', newPlayer, 'URL:', url);

      // Track player switch
      const contentTitle = contentType === 'movie' ?
        `Movie ${contentId}` :
        `${contentType} ${contentId} S${season}E${episode}`;
      analytics.trackEvent('player_switch', {
        category: 'video',
        label: `${currentPlayer}_to_${newPlayer}`,
        content_type: contentType,
        content_id: contentId,
        content_title: contentTitle,
        from_player: currentPlayer,
        to_player: newPlayer,
      });
    } catch (error) {
      console.error('Failed to generate player URL:', error);
      setPlayerUrl('');
      setError(`Failed to switch to ${newPlayer} player: ${error.message}`);

      // Track player switch error
      analytics.trackError(`Player switch failed: ${error.message}`, 'player_switch_error');
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
      const handleMessage = event => {
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
              : contentType.toUpperCase()}
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
              onClick={handleClose}
              title="Close"
            />
          </div>
        </div>

        {/* Prominent Player Switching Buttons */}
        <div className="video-player-switcher">
          <div className="player-switch-buttons">
            <button
              className={`player-switch-btn ${currentPlayer === 'videasy' ? 'active' : ''}`}
              onClick={() => switchPlayer('videasy')}
              disabled={isLoading}
            >
              <span className="player-icon">🎬</span>
              <span className="player-name">Videasy</span>
              <span className="player-subtitle">Preferred</span>
              {currentPlayer === 'videasy' && <span className="active-indicator">●</span>}
            </button>
            <button
              className={`player-switch-btn ${currentPlayer === 'vidsrc' ? 'active' : ''}`}
              onClick={() => switchPlayer('vidsrc')}
              disabled={isLoading}
            >
              <span className="player-icon">📺</span>
              <span className="player-name">VidSrc</span>
              <span className="player-subtitle">Alternative</span>
              {currentPlayer === 'vidsrc' && <span className="active-indicator">●</span>}
            </button>
          </div>

          {/* Anime Dub Toggle */}
          {contentType === 'anime' && (
            <div className="anime-dub-toggle">
              <button
                className={`dub-toggle-btn ${isDubbed ? 'active' : ''}`}
                onClick={() => {
                  setIsDubbed(!isDubbed);
                  // Regenerate URL with new dub setting
                  setIsLoading(true);
                }}
                disabled={isLoading}
              >
                <span className="dub-icon">🎭</span>
                <span className="dub-text">{isDubbed ? 'English Dub' : 'Subtitled'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="video-player-settings">
            <h4>Player Settings</h4>

            <div className="setting-group">
              <label>Video Player:</label>
              <div className="player-options">
                <button
                  className={`player-option ${currentPlayer === 'videasy' ? 'active' : ''}`}
                  onClick={() => switchPlayer('videasy')}
                >
                  Videasy (Preferred)
                </button>
                <button
                  className={`player-option ${currentPlayer === 'vidsrc' ? 'active' : ''}`}
                  onClick={() => switchPlayer('vidsrc')}
                >
                  VidSrc (Alternative)
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
                  <button className="player-option active">Subtitled (English)</button>
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
              <p>
                {error?.message ||
                  'Unable to generate player URL. This content might not be available for streaming.'}
              </p>
              <div
                style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
              >

                {currentPlayer !== 'videasy' && (
                  <Button variant="primary" onClick={() => switchPlayer('videasy')}>
                    Try Videasy Player
                  </Button>
                )}
                {currentPlayer !== 'vidsrc' && (
                  <Button variant="primary" onClick={() => switchPlayer('vidsrc')}>
                    Try VidSrc Player
                  </Button>
                )}
                <Button variant="secondary" onClick={handleClose}>
                  Close Player
                </Button>
              </div>
              {playerUrl && (
                <p
                  style={{
                    marginTop: '1rem',
                    fontSize: '0.8rem',
                    color: 'var(--netflix-text-gray)',
                  }}
                >
                  Player URL: {playerUrl}
                </p>
              )}
            </div>
          )}

          {(currentPlayer === 'videasy' || currentPlayer === 'vidsrc') && playerUrl && !error && (
            // Players use iframe
            <iframe
              ref={iframeRef}
              src={playerUrl}
              className="video-player-iframe"
              style={{ border: 'none', display: isLoading || error || !playerUrl ? 'none' : 'block' }}
              allowFullScreen
              allow="encrypted-media; autoplay; picture-in-picture"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
