import { useState, useEffect, useRef } from 'react';
import { X, Settings, Download, Maximize, ChevronDown, Play } from 'lucide-react';
import Button from './Button';
import UserPreferences from './UserPreferences';
import { utils, analytics } from '../utils';
import tmdbApi from '../services/tmdbApi';
import watchHistoryService from '../services/watchHistoryService';
import userPreferencesService from '../services/userPreferencesService';
import trendingService from '../services/trendingService';
import './VideoPlayer.css';

const VideoPlayer = ({
  contentId,
  contentType = 'movie',
  season = null,
  episode = null,
  totalSeasons = 1,
  show = false,
  onClose,
  onEpisodeSelect,
  autoPlay = true,
  preferredPlayer = 'videasy', // Default to videasy as preferred
  selectedServer = 1, // Server number from ServerSelector
}) => {
  // Map server numbers to player types
  const getPlayerFromServer = (serverNumber) => {
    switch (serverNumber) {
      case 1: return 'videasy';
      case 2: return 'vidsrc';
      default: return 'videasy'; // Default fallback
    }
  };

  const [currentPlayer, setCurrentPlayer] = useState(getPlayerFromServer(selectedServer));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isDubbed, setIsDubbed] = useState(true); // Default to English dub for anime
  const [retryCount, setRetryCount] = useState(0);
  const [failedPlayers, setFailedPlayers] = useState(new Set());
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);
  const iframeRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Episode selector state
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(season || 1);
  const [selectedEpisode, setSelectedEpisode] = useState(episode || 1);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [showEpisodeDropdown, setShowEpisodeDropdown] = useState(false);
  const [episodeLoading, setEpisodeLoading] = useState(false);

  // Progress tracking state
  const [watchProgress, setWatchProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(null);

  // Update player when selectedServer changes
  useEffect(() => {
    const newPlayer = getPlayerFromServer(selectedServer);
    if (newPlayer !== currentPlayer) {
      setCurrentPlayer(newPlayer);
      setIsLoading(true);
      setError(null);
    }
  }, [selectedServer]);

  // Load episodes for TV shows and anime
  useEffect(() => {
    if (contentType === 'tv' || contentType === 'anime') {
      loadEpisodes(selectedSeason);
    }
  }, [selectedSeason, contentId, contentType]);

  const loadEpisodes = async (seasonNumber) => {
    try {
      setEpisodeLoading(true);

      const tmdbApi = await import('../services/tmdbApi');
      const seasonData = await tmdbApi.default.getTVSeasonDetails(contentId, seasonNumber);
      const episodeList = seasonData?.episodes || [];

      setEpisodes(episodeList);
      setEpisodeLoading(false);

      // If no episodes found, log for debugging
      if (episodeList.length === 0) {
        console.warn(`No episodes found for Season ${seasonNumber} of content ${contentId}`);
      }
    } catch (error) {
      console.error('Failed to load episodes:', error);
      setEpisodes([]);
      setEpisodeLoading(false);
    }
  };
  const [currentTime, setCurrentTime] = useState(0);
  const progressUpdateInterval = useRef(null);

  // Generate player URL with error handling
  const [playerUrl, setPlayerUrl] = useState('');

  // Function to get saved progress from watch history service
  const getSavedProgress = () => {
    try {
      const progress = watchHistoryService.getItemProgress(
        contentId,
        contentType,
        selectedSeason,
        selectedEpisode
      );

      if (progress) {
        // Convert to the expected format
        return {
          currentTime: progress.current_time || 0,
          percentage: progress.progress || 0,
          duration: progress.duration || null,
          timestamp: new Date(progress.updated_at).getTime()
        };
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
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
  }, [currentPlayer, contentId, contentType, selectedSeason, selectedEpisode, autoPlay, isDubbed]);

  const handleIframeLoad = () => {
    console.log('Video player loaded successfully:', playerUrl);
    setIsLoading(false);
    setError(null);

    // Track successful video load with player performance
    const contentTitle = contentType === 'movie' ?
      `Movie ${contentId}` :
      `${contentType} ${contentId} S${selectedSeason}E${selectedEpisode}`;

    const playerInfo = {
      player: currentPlayer,
      season: selectedSeason,
      episode: selectedEpisode,
    };

    analytics.trackVideoEvent('load_success', contentType, contentId, contentTitle, playerInfo);

    // Track player performance
    analytics.trackPlayerPerformance(currentPlayer, contentType, {
      success: true,
      loadTime: null, // Could be enhanced with actual load time measurement
    });

    // Track in trending service
    trendingService.trackInteraction(contentId, contentType, 'play', {
      player: currentPlayer,
      season: selectedSeason,
      episode: selectedEpisode,
      title: contentTitle
    });

    // Add to watch history
    const watchData = {
      season: selectedSeason,
      episode: selectedEpisode,
      player_used: currentPlayer,
      progress: 0, // Just started
      current_time: 0
    };

    // Get content details for history (this would ideally come from props)
    const contentData = {
      id: contentId,
      type: contentType,
      title: contentTitle, // This should be the actual title from props
      // Add other content details as available
    };

    watchHistoryService.addToHistory(contentData, watchData);
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

  // Season change handler
  const handleSeasonChange = (seasonNumber) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1); // Reset to first episode
    setShowSeasonDropdown(false);

    // Notify parent component if callback provided
    if (onEpisodeSelect) {
      onEpisodeSelect(seasonNumber, 1);
    }
  };

  // Episode change handler
  const handleEpisodeChange = (episodeNumber) => {
    setSelectedEpisode(episodeNumber);
    setShowEpisodeDropdown(false);

    // Notify parent component if callback provided
    if (onEpisodeSelect) {
      onEpisodeSelect(selectedSeason, episodeNumber);
    }
  };

  // Get selected episode data
  const getSelectedEpisodeData = () => {
    if (!episodes || episodes.length === 0) return null;
    return episodes.find(ep => ep.episode_number === selectedEpisode) || null;
  };

  // Load existing watch progress
  const loadWatchProgress = () => {
    const progress = watchHistoryService.getItemProgress(
      contentId,
      contentType,
      selectedSeason,
      selectedEpisode
    );

    if (progress) {
      setWatchProgress(progress.progress || 0);
      setCurrentTime(progress.current_time || 0);
      setVideoDuration(progress.duration || null);
    }
  };

  // Update watch progress
  const updateWatchProgress = (currentTime, duration) => {
    if (!duration || duration === 0) return;

    const progress = Math.min((currentTime / duration) * 100, 100);
    setWatchProgress(progress);
    setCurrentTime(currentTime);
    setVideoDuration(duration);

    // Update progress in storage (throttled)
    if (progress > 5) { // Only track if watched more than 5%
      watchHistoryService.updateProgress(contentId, contentType, {
        season: selectedSeason,
        episode: selectedEpisode,
        progress: progress,
        current_time: currentTime,
        duration: duration,
        player_used: currentPlayer
      });
    }
  };

  // Analytics-aware close handler
  const handleClose = () => {
    const contentTitle = contentType === 'movie' ?
      `Movie ${contentId}` :
      `${contentType} ${contentId} S${selectedSeason}E${selectedEpisode}`;

    const playerInfo = {
      player: currentPlayer,
      season: selectedSeason,
      episode: selectedEpisode,
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
        `${contentType} ${contentId} S${selectedSeason}E${selectedEpisode}`;
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
    // Open VidSrc download service with proper content type and episode info
    const downloadUrl = utils.getDownloadUrl(contentId, contentType, selectedSeason, selectedEpisode);
    window.open(downloadUrl, '_blank');

    // Track download analytics with episode info
    analytics.trackEvent('content_download', {
      category: 'user_engagement',
      label: `${contentType}_download`,
      content_type: contentType,
      content_id: contentId,
      season: selectedSeason || null,
      episode: selectedEpisode || null,
      download_url: downloadUrl,
      session_id: analytics.getSessionId(),
      timestamp: new Date().toISOString(),
      value: 1,
    });
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
    <div className="video-player-embedded">
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

        {/* Episode Selector for TV Shows and Anime */}
        {(contentType === 'tv' || contentType === 'anime') && (
          <div className="video-player-episode-selector">
            <div className="episode-selector-controls">
              {/* Season Selector */}
              <div className="episode-selector-dropdown">
                <button
                  className="episode-selector-button"
                  onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                >
                  <span>Season {selectedSeason}</span>
                  <ChevronDown size={16} className={showSeasonDropdown ? 'rotated' : ''} />
                </button>

                {showSeasonDropdown && (
                  <div className="episode-selector-menu">
                    {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(seasonNum => (
                      <button
                        key={seasonNum}
                        className={`episode-selector-option ${seasonNum === selectedSeason ? 'selected' : ''}`}
                        onClick={() => handleSeasonChange(seasonNum)}
                      >
                        Season {seasonNum}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Episode Selector */}
              <div className="episode-selector-dropdown">
                <button
                  className="episode-selector-button"
                  onClick={() => setShowEpisodeDropdown(!showEpisodeDropdown)}
                  disabled={episodeLoading || episodes.length === 0}
                >
                  <span>Episode {selectedEpisode}</span>
                  <ChevronDown size={16} className={showEpisodeDropdown ? 'rotated' : ''} />
                </button>

                {showEpisodeDropdown && (
                  <div className="episode-selector-menu">
                    {episodes.map(ep => (
                      <button
                        key={ep.episode_number}
                        className={`episode-selector-option ${ep.episode_number === selectedEpisode ? 'selected' : ''}`}
                        onClick={() => handleEpisodeChange(ep.episode_number)}
                      >
                        <div className="episode-option-content">
                          <span className="episode-number">Episode {ep.episode_number}</span>
                          {ep.name && <span className="episode-name">{ep.name}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Current Episode Info */}
            {(() => {
              const currentEpisode = getSelectedEpisodeData();
              return currentEpisode && (
                <div className="current-episode-info">
                  <h4 className="episode-title">
                    S{selectedSeason}E{selectedEpisode}: {currentEpisode.name || `Episode ${selectedEpisode}`}
                  </h4>
                  {currentEpisode.overview && (
                    <p className="episode-overview">{currentEpisode.overview}</p>
                  )}
                  <div className="episode-meta">
                    {currentEpisode.air_date && (
                      <span className="episode-date">Aired: {new Date(currentEpisode.air_date).toLocaleDateString()}</span>
                    )}
                    {currentEpisode.runtime && (
                      <span className="episode-runtime">{currentEpisode.runtime} min</span>
                    )}
                    {currentEpisode.vote_average > 0 && (
                      <span className="episode-rating">★ {currentEpisode.vote_average.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="video-player-settings">
            <h4>Player Settings</h4>



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

            <div className="setting-group">
              <Button
                variant="primary"
                size="small"
                icon={<Settings size={16} />}
                onClick={() => setShowPreferences(true)}
                className="preferences-button"
              >
                Advanced Preferences
              </Button>
            </div>
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
                    Try Server 1
                  </Button>
                )}
                {currentPlayer !== 'vidsrc' && !failedPlayers.has('vidsrc') && (
                  <Button variant="primary" onClick={() => switchPlayer('vidsrc')}>
                    Try Server 2
                  </Button>
                )}

                {/* Show all players if all have failed */}
                {failedPlayers.size >= 2 && (
                  <>
                    <Button variant="secondary" onClick={() => switchPlayer('videasy')}>
                      Force Server 1
                    </Button>
                    <Button variant="secondary" onClick={() => switchPlayer('vidsrc')}>
                      Force Server 2
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

      {/* User Preferences Modal */}
      {showPreferences && (
        <UserPreferences
          onClose={() => setShowPreferences(false)}
          onPreferencesChange={(newPreferences) => {
            // Apply preferences to current player if needed
            console.log('Preferences updated:', newPreferences);
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
