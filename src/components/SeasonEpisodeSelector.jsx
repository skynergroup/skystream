import { useState, useEffect } from 'react';
import { ChevronDown, Play } from 'lucide-react';
import Button from './Button';
import Loading from './Loading';
import tmdbApi from '../services/tmdbApi';
import { analytics } from '../utils';
import './SeasonEpisodeSelector.css';

const SeasonEpisodeSelector = ({
  contentId,
  contentType,
  totalSeasons = 1,
  onEpisodeSelect,
  onPlayClick,
}) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [showEpisodeDropdown, setShowEpisodeDropdown] = useState(false);

  // Load episodes for selected season
  useEffect(() => {
    if (contentType === 'tv' || contentType === 'anime') {
      loadEpisodes(selectedSeason);
    }
  }, [selectedSeason, contentId, contentType]);

  const loadEpisodes = async seasonNumber => {
    try {
      setLoading(true);
      setError(null);

      const seasonData = await tmdbApi.getTVSeasonDetails(contentId, seasonNumber);
      setEpisodes(seasonData.episodes || []);

      // Reset to first episode when changing seasons
      setSelectedEpisode(1);
    } catch (err) {
      console.error('Failed to load episodes:', err);
      setError(err);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonChange = season => {
    setSelectedSeason(season);
    setShowSeasonDropdown(false);

    // Track season selection analytics
    analytics.trackEvent('season_selection', {
      category: 'series_navigation',
      label: `${contentType}_season_${season}`,
      event_action: 'season_change',
      content_type: contentType,
      content_id: contentId,
      season_from: selectedSeason,
      season_to: season,
      session_id: analytics.getSessionId(),
      timestamp: new Date().toISOString(),
      page_url: window.location.pathname,
      value: 1,
    });
  };

  const handleEpisodeChange = episode => {
    setSelectedEpisode(episode);
    setShowEpisodeDropdown(false);

    // Get episode details for analytics
    const episodeData = episodes.find(ep => ep.episode_number === episode);

    // Track episode selection analytics
    analytics.trackEvent('episode_selection', {
      category: 'series_navigation',
      label: `${contentType}_S${selectedSeason}E${episode}`,
      event_action: 'episode_change',
      content_type: contentType,
      content_id: contentId,
      season: selectedSeason,
      episode_from: selectedEpisode,
      episode_to: episode,
      episode_title: episodeData?.name || `Episode ${episode}`,
      episode_air_date: episodeData?.air_date || 'Unknown',
      episode_rating: episodeData?.vote_average || 'Unknown',
      session_id: analytics.getSessionId(),
      timestamp: new Date().toISOString(),
      page_url: window.location.pathname,
      value: 1,
    });

    // Track episode discovery pattern
    analytics.trackEvent('episode_discovery', {
      category: 'content_discovery',
      label: `${contentType}_episode_browse`,
      content_type: contentType,
      content_id: contentId,
      season: selectedSeason,
      episode: episode,
      discovery_method: 'episode_selector',
      value: 1,
    });

    // Notify parent component
    if (onEpisodeSelect) {
      onEpisodeSelect(selectedSeason, episode);
    }

    // Auto-play when episode is selected
    if (onPlayClick) {
      onPlayClick(selectedSeason, episode);
    }
  };

  const handlePlayClick = () => {
    if (onPlayClick) {
      onPlayClick(selectedSeason, selectedEpisode);
    }
  };

  const getSelectedEpisodeData = () => {
    return episodes.find(ep => ep.episode_number === selectedEpisode);
  };

  const selectedEpisodeData = getSelectedEpisodeData();

  // For movies, don't render anything (play button is now in ContentDetail)
  if (contentType === 'movie') {
    return null;
  }

  return (
    <div className="season-episode-selector">
      {/* Season and Episode Selectors */}
      <div className="selector-controls">
        {/* Season Selector */}
        <div className="selector-dropdown">
          <button
            className="selector-button"
            onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
          >
            <span>Season {selectedSeason}</span>
            <ChevronDown size={16} className={showSeasonDropdown ? 'rotated' : ''} />
          </button>

          {showSeasonDropdown && (
            <div className="selector-menu">
              {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(season => (
                <button
                  key={season}
                  className={`selector-option ${season === selectedSeason ? 'selected' : ''}`}
                  onClick={() => handleSeasonChange(season)}
                >
                  Season {season}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Episode Selector */}
        <div className="selector-dropdown">
          <button
            className="selector-button"
            onClick={() => setShowEpisodeDropdown(!showEpisodeDropdown)}
            disabled={loading || episodes.length === 0}
          >
            <span>Episode {selectedEpisode}</span>
            <ChevronDown size={16} className={showEpisodeDropdown ? 'rotated' : ''} />
          </button>

          {showEpisodeDropdown && (
            <div className="selector-menu">
              {episodes.map(episode => (
                <button
                  key={episode.episode_number}
                  className={`selector-option ${episode.episode_number === selectedEpisode ? 'selected' : ''}`}
                  onClick={() => handleEpisodeChange(episode.episode_number)}
                >
                  <div className="episode-option">
                    <span className="episode-number">Episode {episode.episode_number}</span>
                    {episode.name && <span className="episode-name">{episode.name}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Play Button */}
        <Button
          variant="primary"
          size="large"
          icon={<Play size={20} fill="currentColor" />}
          onClick={handlePlayClick}
          disabled={loading || episodes.length === 0}
          className="play-episode-btn"
        >
          Play
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="selector-loading">
          <Loading size="small" text="Loading episodes..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="selector-error">
          <p>Failed to load episodes for Season {selectedSeason}</p>
        </div>
      )}

      {/* Selected Episode Info */}
      {selectedEpisodeData && !loading && (
        <div className="selected-episode-info">
          <h4 className="episode-title">
            S{selectedSeason}E{selectedEpisode}: {selectedEpisodeData.name}
          </h4>
          {selectedEpisodeData.overview && (
            <p className="episode-overview">{selectedEpisodeData.overview}</p>
          )}
          <div className="episode-meta">
            {selectedEpisodeData.air_date && (
              <span className="episode-date">
                Aired: {new Date(selectedEpisodeData.air_date).toLocaleDateString()}
              </span>
            )}
            {selectedEpisodeData.runtime && (
              <span className="episode-runtime">{selectedEpisodeData.runtime} min</span>
            )}
            {selectedEpisodeData.vote_average > 0 && (
              <span className="episode-rating">
                ★ {Math.round(selectedEpisodeData.vote_average * 10) / 10}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonEpisodeSelector;
