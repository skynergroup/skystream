import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { X, ExternalLink, Download } from 'lucide-react';
import streamingServices from '../services/streamingServices';
import tmdbApi from '../services/tmdbApi';
import './StreamingPlayerModal.css';

const StreamingPlayerModal = ({
  isOpen,
  onClose,
  content,
  platform,
  embedUrl,
  contentType = 'movie',
  season = null,
  episode = null,
}) => {
  // State for season and episode selection
  const [selectedSeason, setSelectedSeason] = useState(season || 1);
  const [selectedEpisode, setSelectedEpisode] = useState(episode || 1);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState(embedUrl);
  const [selectedPlatform, setSelectedPlatform] = useState(platform || 'server1');
  const [seasonsData, setSeasonsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle season change - reset episode to 1
  const handleSeasonChange = newSeason => {
    const seasonNum = Number.parseInt(newSeason, 10);
    setSelectedSeason(seasonNum);
    setSelectedEpisode(1); // Reset to episode 1 when season changes

    // Ensure episode 1 exists for the selected season
    if (seasonsData) {
      const currentSeason = seasonsData.seasons.find(s => s.season_number === seasonNum);
      if (currentSeason && currentSeason.episode_count === 0) {
        // If season has no episodes, don't change episode
        return;
      }
    }
  };

  // Update embed URL when season/episode/platform changes
  useEffect(() => {
    if (content?.id && selectedPlatform) {
      const urls = streamingServices.getAllStreamingUrls(content, {
        season: selectedSeason,
        episode: selectedEpisode,
      });

      // Support both old format (vidsrc/videasy) and new format (server1-5)
      if (selectedPlatform?.startsWith('server')) {
        setCurrentEmbedUrl(urls[selectedPlatform]);
      } else if (selectedPlatform === 'vidsrc') {
        setCurrentEmbedUrl(urls.server1);
      } else if (selectedPlatform === 'videasy') {
        setCurrentEmbedUrl(urls.server5);
      }
    } else {
      setCurrentEmbedUrl(embedUrl);
    }
  }, [selectedSeason, selectedEpisode, selectedPlatform, contentType, content, embedUrl]);

  // Fetch seasons data from TMDB when modal opens for TV content
  useEffect(() => {
    const fetchSeasonsData = async () => {
      if (isOpen && contentType === 'tv' && content?.id) {
        setLoading(true);
        try {
          const data = await tmdbApi.getTVSeasonsData(content.id);
          setSeasonsData(data);
        } catch (error) {
          console.error('Failed to fetch seasons data:', error);
          // Fallback to generic data if API fails
          setSeasonsData(null);
        } finally {
          setLoading(false);
        }
      } else {
        setSeasonsData(null);
      }
    };

    fetchSeasonsData();
  }, [isOpen, contentType, content?.id]);

  // Reset season/episode/platform when modal opens with new content
  useEffect(() => {
    if (isOpen) {
      setSelectedSeason(season || 1);
      setSelectedEpisode(episode || 1);
      setSelectedPlatform(platform);
    }
  }, [isOpen, season, episode, platform]);

  // Listen for episode changes from Server 2 navigation
  useEffect(() => {
    if (!isOpen || selectedPlatform !== 'videasy' || contentType !== 'tv') return;

    // Listen for postMessage from iframe about navigation
    const handleMessage = event => {
      if (event.data && event.data.type === 'episodeChange') {
        const { season: newSeason, episode: newEpisode } = event.data;
        if (newSeason && newEpisode) {
          const seasonNum = Number.parseInt(newSeason, 10);
          const episodeNum = Number.parseInt(newEpisode, 10);

          if (seasonNum !== selectedSeason || episodeNum !== selectedEpisode) {
            setSelectedSeason(seasonNum);
            setSelectedEpisode(episodeNum);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, selectedPlatform, contentType, selectedSeason, selectedEpisode]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Open in new tab
  const handleOpenInNewTab = () => {
    window.open(currentEmbedUrl, '_blank', 'noopener,noreferrer');
  };

  // Extract season and episode from selected values or embed URL
  const extractSeasonEpisode = () => {
    // Use selected values if available
    if (selectedSeason && selectedEpisode) {
      return { season: selectedSeason, episode: selectedEpisode };
    }

    // Fall back to props
    if (season && episode) {
      return { season, episode };
    }

    if (embedUrl && contentType === 'tv') {
      try {
        const url = new URL(embedUrl);
        const urlSeason = url.searchParams.get('season');
        const urlEpisode = url.searchParams.get('episode');

        if (urlSeason && urlEpisode) {
          return {
            season: Number.parseInt(urlSeason, 10),
            episode: Number.parseInt(urlEpisode, 10),
          };
        }
      } catch (e) {
        console.warn('Failed to parse embed URL:', e);
      }
    }

    // Default to season 1, episode 1 for TV series
    return { season: 1, episode: 1 };
  };

  // Generate download URL
  const generateDownloadUrl = () => {
    if (!content?.id) return null;

    const baseUrl = 'https://dl.vidsrc.vip';

    if (contentType === 'movie') {
      // Movie format: https://dl.vidsrc.vip/movie/986056
      return `${baseUrl}/movie/${content.id}`;
    } else if (contentType === 'tv') {
      // TV format: https://dl.vidsrc.vip/tv/60572/1/1
      const { season: extractedSeason, episode: extractedEpisode } = extractSeasonEpisode();
      return `${baseUrl}/tv/${content.id}/${extractedSeason}/${extractedEpisode}`;
    }

    return null;
  };

  // Handle download
  const handleDownload = () => {
    const downloadUrl = generateDownloadUrl();
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Get download button title
  const getDownloadTitle = () => {
    if (contentType === 'movie') {
      return 'Download movie';
    } else if (contentType === 'tv') {
      const { season: extractedSeason, episode: extractedEpisode } = extractSeasonEpisode();
      return `Download S${extractedSeason}E${extractedEpisode}`;
    }
    return 'Download content';
  };

  if (!isOpen) return null;

  return (
    <dialog
      className="streaming-player-modal"
      aria-modal="true"
      open
      onKeyDown={e => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
    >
      <div className="streaming-player-modal__content" onClick={handleBackdropClick}>
        <div className="streaming-player-modal__header">
          <div className="streaming-player-modal__title">
            <h2>{content?.title}</h2>
            <div className="streaming-player-modal__server-selector">
              <label htmlFor="server-select">Server:</label>
              <select
                id="server-select"
                value={selectedPlatform}
                onChange={e => setSelectedPlatform(e.target.value)}
                className="streaming-player-modal__server-select"
              >
                <option value="server1">Server 1 (Vidsrc)</option>
                <option value="server2">Server 2 (Vidsrc)</option>
                <option value="server3">Server 3 (Vidsrc)</option>
                <option value="server4">Server 4 (Vidsrc)</option>
                <option value="server5">Server 5 (Videasy)</option>
              </select>
            </div>
          </div>

          {/* Season and Episode Selectors for TV Series */}
          {contentType === 'tv' && (
            <div className="streaming-player-modal__episode-controls">
              <div className="streaming-player-modal__selector">
                <label htmlFor="season-select">
                  Season: {loading && <span className="loading-text">(Loading...)</span>}
                </label>
                <select
                  id="season-select"
                  value={selectedSeason}
                  onChange={e => handleSeasonChange(e.target.value)}
                  className="streaming-player-modal__select"
                  disabled={loading}
                >
                  {seasonsData
                    ? seasonsData.seasons.map(season => (
                        <option key={season.season_number} value={season.season_number}>
                          Season {season.season_number}
                          {season.name &&
                            season.name !== `Season ${season.season_number}` &&
                            ` - ${season.name}`}
                        </option>
                      ))
                    : // Fallback to generic seasons if TMDB data not available
                      Array.from({ length: 10 }, (_, i) => i + 1).map(seasonNum => (
                        <option key={seasonNum} value={seasonNum}>
                          Season {seasonNum}
                        </option>
                      ))}
                </select>
              </div>

              <div className="streaming-player-modal__selector">
                <label htmlFor="episode-select">Episode:</label>
                <select
                  id="episode-select"
                  value={selectedEpisode}
                  onChange={e => setSelectedEpisode(Number.parseInt(e.target.value, 10))}
                  className="streaming-player-modal__select"
                  disabled={loading}
                >
                  {(() => {
                    // Get episode count for selected season
                    let episodeCount = 24; // Default fallback

                    if (seasonsData) {
                      const currentSeason = seasonsData.seasons.find(
                        s => s.season_number === selectedSeason
                      );
                      if (currentSeason) {
                        episodeCount = currentSeason.episode_count;
                      }
                    }

                    return Array.from({ length: episodeCount }, (_, i) => i + 1).map(episodeNum => (
                      <option key={episodeNum} value={episodeNum}>
                        Episode {episodeNum}
                      </option>
                    ));
                  })()}
                </select>
              </div>
            </div>
          )}

          <div className="streaming-player-modal__controls">
            {generateDownloadUrl() && (
              <button
                className="streaming-player-modal__control-btn"
                onClick={handleDownload}
                title={getDownloadTitle()}
              >
                <Download size={18} />
              </button>
            )}
            <button
              className="streaming-player-modal__control-btn"
              onClick={handleOpenInNewTab}
              title="Open in new tab"
            >
              <ExternalLink size={18} />
            </button>
            <button
              className="streaming-player-modal__control-btn streaming-player-modal__close"
              onClick={onClose}
              title="Close player"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="streaming-player-modal__player">
          <iframe
            src={currentEmbedUrl}
            title={`${content?.title} - ${platform}`}
            className="streaming-player-modal__iframe"
            allowFullScreen
            allow="encrypted-media; autoplay; fullscreen"
            referrerPolicy="origin"
            style={{ border: 'none' }}
            loading="lazy"
          />
        </div>

        <div className="streaming-player-modal__footer">
          <p className="streaming-player-modal__disclaimer">
            Content is provided by third-party services. We do not host any content.
          </p>
        </div>
      </div>
    </dialog>
  );
};

StreamingPlayerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  content: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
  }),
  platform: PropTypes.oneOf([
    'server1',
    'server2',
    'server3',
    'server4',
    'server5',
    'vidsrc',
    'videasy',
  ]).isRequired,
  embedUrl: PropTypes.string,
  contentType: PropTypes.oneOf(['movie', 'tv']),
  season: PropTypes.number,
  episode: PropTypes.number,
};

export default StreamingPlayerModal;
