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
  const [retryCount, setRetryCount] = useState(0);
  const [failedPlayers, setFailedPlayers] = useState(new Set());
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);
  const iframeRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Generate player URL with error handling
  const [playerUrl, setPlayerUrl] = useState('');

  // Function to get saved progress from localStorage
  const getSavedProgress = () => {
    try {
      const key = `progress_${contentType}_${contentId}${season && episode ? `_s${season}e${episode}` : ''}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const progressData = JSON.parse(saved);
        // Only return progress if it's recent (within 30 days) and meaningful (>30 seconds)
        const isRecent = Date.now() - progressData.timestamp < 30 * 24 * 60 * 60 * 1000;
        if (isRecent && progressData.currentTime > 30) {
          return progressData;
        }
      }
    } catch (error) {
      console.error('Error retrieving saved progress:', error);
    }
    return null;
  };

  // Helper function to format time in MM:SS or HH:MM:SS format
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Reset error state when content changes
    resetErrorState();

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

        // Add saved progress for resume functionality
        const savedProgress = getSavedProgress();
        if (savedProgress && savedProgress.currentTime > 30) { // Only resume if more than 30 seconds watched
          playerOptions.progress = Math.floor(savedProgress.currentTime);
          console.log('Resuming from saved progress:', savedProgress.currentTime, 'seconds');
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

    // Add current player to failed players set
    setFailedPlayers(prev => new Set([...prev, currentPlayer]));
    setRetryCount(prev => prev + 1);

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
      retry_count: retryCount,
    };

    analytics.trackVideoEvent('load_error', contentType, contentId, contentTitle, playerInfo);
    analytics.trackError(`Video player error: ${errorMessage}`, 'video_player_error');

    // Track player performance failure
    analytics.trackPlayerPerformance(currentPlayer, contentType, {
      success: false,
      errorType: 'load_failure',
      retryCount: retryCount,
    });

    // Auto-fallback to next available player if enabled
    if (autoRetryEnabled && retryCount < 3) {
      attemptAutoFallback();
    }
  };

  // Auto-fallback mechanism
  const attemptAutoFallback = () => {
    const availablePlayers = ['videasy', 'vidsrc'].filter(player =>
      !failedPlayers.has(player) && player !== currentPlayer
    );

    if (availablePlayers.length > 0) {
      const nextPlayer = availablePlayers[0];
      console.log(`Auto-switching from ${currentPlayer} to ${nextPlayer}...`);

      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Set a delay before switching to allow for proper cleanup
      retryTimeoutRef.current = setTimeout(() => {
        switchPlayer(nextPlayer);

        // Track auto-fallback
        analytics.trackEvent('player_auto_fallback', {
          category: 'video_error_recovery',
          label: `${currentPlayer}_to_${nextPlayer}`,
          from_player: currentPlayer,
          to_player: nextPlayer,
          retry_count: retryCount,
          content_type: contentType,
          content_id: contentId
        });
      }, 1500);
    } else {
      console.log('No more players available for auto-fallback');
      setAutoRetryEnabled(false);
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
    if (newPlayer === currentPlayer) return;

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

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

      // Add saved progress for resume functionality when switching players
      const savedProgress = getSavedProgress();
      if (savedProgress && savedProgress.currentTime > 30) {
        playerOptions.progress = Math.floor(savedProgress.currentTime);
        console.log('Resuming from saved progress on player switch:', savedProgress.currentTime, 'seconds');
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
        is_auto_fallback: retryCount > 0,
        retry_count: retryCount,
      });
    } catch (error) {
      console.error('Failed to generate player URL:', error);
      setPlayerUrl('');
      setError(`Failed to switch to ${newPlayer} player: ${error.message}`);

      // Add failed player to the set
      setFailedPlayers(prev => new Set([...prev, newPlayer]));

      // Track player switch error
      analytics.trackError(`Player switch failed: ${error.message}`, 'player_switch_error');
    }
  };

  // Manual retry function
  const retryCurrentPlayer = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);

    // Track manual retry
    analytics.trackEvent('player_manual_retry', {
      category: 'video_error_recovery',
      label: currentPlayer,
      player: currentPlayer,
      retry_count: retryCount + 1,
      content_type: contentType,
      content_id: contentId
    });

    // Force iframe reload by updating the key
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Reset error state when content changes
  const resetErrorState = () => {
    setError(null);
    setRetryCount(0);
    setFailedPlayers(new Set());
    setAutoRetryEnabled(true);

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
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

  // Enhanced progress tracking for Videasy
  useEffect(() => {
    if (currentPlayer === 'videasy') {
      const handleMessage = event => {
        if (typeof event.data === 'string') {
          try {
            const progressData = JSON.parse(event.data);

            // Enhanced progress tracking with more metadata
            if (progressData.currentTime && progressData.duration) {
              const progressInfo = {
                currentTime: progressData.currentTime,
                duration: progressData.duration,
                percentage: (progressData.currentTime / progressData.duration) * 100,
                timestamp: Date.now(),
                contentType,
                contentId,
                season,
                episode,
                player: currentPlayer,
                lastWatched: new Date().toISOString()
              };

              // Save progress to localStorage
              const key = `progress_${contentType}_${contentId}${season && episode ? `_s${season}e${episode}` : ''}`;
              localStorage.setItem(key, JSON.stringify(progressInfo));

              // Track progress analytics
              analytics.trackEvent('video_progress', {
                category: 'video_engagement',
                label: `${contentType}_${contentId}`,
                content_type: contentType,
                content_id: contentId,
                progress_percentage: Math.round(progressInfo.percentage),
                current_time: progressData.currentTime,
                duration: progressData.duration,
                player: currentPlayer,
                season: season || null,
                episode: episode || null
              });

              console.log('Progress saved:', progressInfo);
            }
          } catch (e) {
            // Ignore non-JSON messages
            console.debug('Non-JSON message received:', event.data);
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [currentPlayer, contentId, contentType, season, episode]);

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

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

          {/* Resume Progress Indicator */}
          {(() => {
            const savedProgress = getSavedProgress();
            if (savedProgress && savedProgress.currentTime > 30) {
              const progressPercent = Math.round(savedProgress.percentage);
              const timeFormatted = formatTime(savedProgress.currentTime);
              return (
                <div className="resume-progress-indicator">
                  <div className="resume-info">
                    <span className="resume-icon">⏯️</span>
                    <span className="resume-text">Resume from {timeFormatted} ({progressPercent}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
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

              {/* Error details and retry info */}
              {retryCount > 0 && (
                <p style={{ fontSize: '0.9rem', color: 'var(--netflix-text-gray)', marginTop: '0.5rem' }}>
                  Retry attempts: {retryCount}/3
                  {failedPlayers.size > 0 && (
                    <span> • Failed players: {Array.from(failedPlayers).join(', ')}</span>
                  )}
                </p>
              )}

              <div
                style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
              >
                {/* Retry current player button */}
                {retryCount < 3 && (
                  <Button variant="primary" onClick={retryCurrentPlayer}>
                    Retry {currentPlayer} Player
                  </Button>
                )}

                {/* Alternative player buttons - only show if not failed */}
                {currentPlayer !== 'videasy' && !failedPlayers.has('videasy') && (
                  <Button variant="primary" onClick={() => switchPlayer('videasy')}>
                    Try Videasy Player
                  </Button>
                )}
                {currentPlayer !== 'vidsrc' && !failedPlayers.has('vidsrc') && (
                  <Button variant="primary" onClick={() => switchPlayer('vidsrc')}>
                    Try VidSrc Player
                  </Button>
                )}

                {/* Show all players if all have failed */}
                {failedPlayers.size >= 2 && (
                  <>
                    <Button variant="secondary" onClick={() => switchPlayer('videasy')}>
                      Force Videasy
                    </Button>
                    <Button variant="secondary" onClick={() => switchPlayer('vidsrc')}>
                      Force VidSrc
                    </Button>
                  </>
                )}

                <Button variant="secondary" onClick={handleClose}>
                  Close Player
                </Button>
              </div>

              {/* Auto-retry status */}
              {autoRetryEnabled && retryCount > 0 && retryCount < 3 && (
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--netflix-text-gray)',
                  marginTop: '1rem',
                  textAlign: 'center'
                }}>
                  Auto-retry is enabled. The player will automatically try alternative sources.
                </p>
              )}

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
