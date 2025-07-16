import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Play, Share, ArrowLeft, X, Download, Users } from 'lucide-react';
import { Button, Loading, Breadcrumb, ProductionInfo, CommentsSection, FAQSection, BookmarkButton, ServerSelector, ContentFAQ } from '../components';
import VideoPlayer from '../components/VideoPlayer';
import SeasonEpisodeSelector from '../components/SeasonEpisodeSelector';
import WatchlistButton from '../components/WatchlistButton';
import tmdbApi from '../services/tmdbApi';
import { utils, analytics } from '../utils';
import './ContentDetail.css';

const ContentDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [selectedServer, setSelectedServer] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Extract type from pathname
  const type = location.pathname.split('/')[1]; // Gets 'movie', 'tv', or 'anime'

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simple direct API call without using the service
      const API_KEY = '20aed25855723af6f6a4dcdad0f17b86';
      const BASE_URL = 'https://api.themoviedb.org/3';

      let url;
      if (type === 'movie') {
        url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}`;
      } else if (type === 'tv' || type === 'anime') {
        url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}`;
      } else {
        throw new Error(`Invalid content type: ${type}`);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const contentData = await response.json();

      // Simple transformation
      const transformedContent = {
        id: contentData.id,
        title: contentData.title || contentData.name,
        name: contentData.name || contentData.title,
        overview: contentData.overview,
        poster_path: contentData.poster_path,
        backdrop_path: contentData.backdrop_path,
        release_date: contentData.release_date || contentData.first_air_date,
        first_air_date: contentData.first_air_date || contentData.release_date,
        vote_average: contentData.vote_average,
        runtime: contentData.runtime,
        number_of_seasons: contentData.number_of_seasons,
        number_of_episodes: contentData.number_of_episodes,
        genres: contentData.genres?.map(g => g.name) || [],
        type: type,
      };

      setContent(transformedContent);

      // Track content view with detailed metadata
      const metadata = {
        genres: transformedContent.genres,
        year: transformedContent.release_date?.split('-')[0] || transformedContent.first_air_date?.split('-')[0],
        rating: transformedContent.vote_average,
        runtime: transformedContent.runtime,
        language: transformedContent.original_language,
        seasons: transformedContent.number_of_seasons,
        episodes: transformedContent.number_of_episodes,
      };

      // Enhanced content view tracking with comprehensive metadata
      const enhancedMetadata = {
        ...metadata,
        genres: transformedContent.genres?.map(g => g.name) || [],
        cast: transformedContent.credits?.cast?.slice(0, 10).map(c => c.name) || [],
        director: transformedContent.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown',
        country: transformedContent.production_countries?.[0]?.name || 'Unknown',
        language: transformedContent.original_language || 'Unknown',
        budget: transformedContent.budget || 0,
        revenue: transformedContent.revenue || 0,
        popularity: transformedContent.popularity || 0,
        vote_average: transformedContent.vote_average || 0,
        vote_count: transformedContent.vote_count || 0,
      };

      analytics.trackContentView(type, id, transformedContent.title, enhancedMetadata);

      // Track specific content type popularity
      if (type === 'movie') {
        analytics.trackMovieView(id, transformedContent.title, enhancedMetadata);
      } else if (type === 'tv') {
        analytics.trackSeriesView(id, transformedContent.title, enhancedMetadata);
      } else if (type === 'anime') {
        analytics.trackAnimeView(id, transformedContent.title, enhancedMetadata);
      }

      // Track genre preferences
      if (transformedContent.genres?.length > 0) {
        transformedContent.genres.forEach(genre => {
          analytics.trackGenreInteraction(genre.name, type, 'view');
        });
      }
    } catch (err) {
      console.error('Failed to load content details:', err);
      setError(err);

      // Track content loading error
      analytics.trackError(`Failed to load ${type} ${id}: ${err.message}`, 'content_load_error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type && id) {
      loadContent();
    }
  }, [type, id, location.pathname]);

  // Auto-open player for all content types when content loads
  useEffect(() => {
    if (content && !showPlayer) {
      // Small delay to ensure content is fully loaded
      const timer = setTimeout(() => {
        handlePlayClick();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [content]);

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
        <Loading size="large" text="Loading content..." />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            color: 'var(--netflix-red)',
            margin: '0 0 1rem 0',
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: '1.5rem',
            color: 'var(--netflix-white)',
            margin: '0 0 1rem 0',
          }}
        >
          Content Not Found
        </h2>
        <p
          style={{
            color: 'var(--netflix-text-gray)',
            margin: '0 0 2rem 0',
          }}
        >
          The content you're looking for doesn't exist or has been removed.
        </p>
        <Button as={Link} to="/" variant="primary">
          Go Back Home
        </Button>
      </div>
    );
  }

  const handleEpisodeSelect = (season, episode) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
  };

  const handleServerChange = (serverNumber) => {
    setSelectedServer(serverNumber);

    // Enhanced server change tracking
    analytics.trackEvent('server_change', {
      category: 'player_behavior',
      label: `server_${serverNumber}`,
      event_action: 'server_change',
      content_type: content?.type,
      content_id: content?.id,
      content_title: content?.title,
      server_from: selectedServer,
      server_to: serverNumber,
      content_genre: content?.genres?.map(g => g.name).join(', ') || 'Unknown',
      session_id: analytics.getSessionId(),
      timestamp: new Date().toISOString(),
      value: 1,
    });

    // Track server preference
    analytics.trackEvent('server_preference', {
      category: 'player_preferences',
      label: `Server ${serverNumber}`,
      server_name: `Server ${serverNumber}`,
      content_type: content?.type,
      content_id: content?.id,
      value: 1,
    });
  };

  const handlePlayClick = (season = null, episode = null) => {
    const playerInfo = {
      playerType: utils.PLAYER_CONFIG?.defaults?.player || 'videasy',
      serverName: `Server ${selectedServer}`,
      quality: 'Auto',
      season: season || selectedSeason,
      episode: episode || selectedEpisode,
    };

    // Enhanced metadata for tracking with proper genre handling
    const trackingMetadata = {
      genres: content.genres?.map(g => g.name).filter(name => name && name.trim() !== '') || [],
      year: content.release_date ? new Date(content.release_date).getFullYear() :
            content.first_air_date ? new Date(content.first_air_date).getFullYear() : 'Unknown',
      rating: content.vote_average || 'Unknown',
      runtime: content.runtime || content.episode_run_time?.[0] || 'Unknown',
    };

    if (content.type === 'movie') {
      setShowPlayer(true);

      // Track "Watch Now" button click
      analytics.trackWatchNowClick(content.type, content.id, content.title, trackingMetadata);

      // Track actual watch start
      analytics.trackWatchStart(content.type, content.id, content.title, trackingMetadata, playerInfo);

      // Track movie play with player info
      analytics.trackVideoEvent('play', content.type, content.id, content.title, playerInfo);
    } else if (content.type === 'tv' || content.type === 'anime') {
      const currentSeason = season || selectedSeason;
      const currentEpisode = episode || selectedEpisode;

      setSelectedSeason(currentSeason);
      setSelectedEpisode(currentEpisode);
      setShowPlayer(true);

      const episodeTitle = `${content.title} S${currentSeason}E${currentEpisode}`;

      // Track "Watch Now" button click for episodes
      analytics.trackWatchNowClick(content.type, content.id, episodeTitle, trackingMetadata);

      // Track actual watch start for episodes
      analytics.trackWatchStart(content.type, content.id, episodeTitle, trackingMetadata, playerInfo);

      // Track episode view
      analytics.trackEpisodeView(
        content.type,
        content.id,
        content.title,
        currentSeason,
        currentEpisode,
        { episodeTitle: `Episode ${currentEpisode}` }
      );

      // Track TV/anime episode play with player info
      analytics.trackVideoEvent('play', content.type, content.id, episodeTitle, playerInfo);
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${content.title || content.name} - SkyStream`,
      text: `Watch ${content.title || content.name} on SkyStream - Free streaming platform`,
      url: window.location.href
    };

    try {
      // Use Web Share API if available (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
        analytics.trackEvent('content_share', {
          category: 'user_engagement',
          label: 'web_share_api',
          content_type: content.type,
          content_id: content.id,
          content_title: content.title || content.name
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);

        // Show feedback (you could enhance this with a toast notification)
        alert('Link copied to clipboard!');

        analytics.trackEvent('content_share', {
          category: 'user_engagement',
          label: 'clipboard_copy',
          content_type: content.type,
          content_id: content.id,
          content_title: content.title || content.name
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  // Save to favorites functionality
  const handleSave = () => {
    const favorites = JSON.parse(localStorage.getItem('skystream_favorites') || '[]');
    const contentData = {
      id: content.id,
      type: content.type,
      title: content.title || content.name,
      poster_path: content.poster_path,
      overview: content.overview,
      vote_average: content.vote_average,
      release_date: content.release_date || content.first_air_date,
      savedAt: new Date().toISOString()
    };

    const existingIndex = favorites.findIndex(item =>
      item.id === content.id && item.type === content.type
    );

    let action = '';
    if (existingIndex >= 0) {
      favorites.splice(existingIndex, 1);
      action = 'removed';
      alert('Removed from favorites!');
    } else {
      favorites.unshift(contentData);
      action = 'added';
      alert('Added to favorites!');
    }

    localStorage.setItem('skystream_favorites', JSON.stringify(favorites));

    analytics.trackEvent('content_favorite', {
      category: 'user_engagement',
      label: `${action}_favorite`,
      content_type: content.type,
      content_id: content.id,
      content_title: content.title || content.name,
      action: action
    });
  };

  // Party functionality
  const handleParty = () => {
    const partyUrl = `/parties?content=${content.type}/${content.id}`;

    // For now, navigate to parties page with content parameter
    window.location.href = partyUrl;

    analytics.trackEvent('party_create', {
      category: 'social_features',
      label: 'party_button_click',
      content_type: content.type,
      content_id: content.id,
      content_title: content.title || content.name
    });
  };

  // Download functionality
  const handleDownload = () => {
    // For TV shows and anime, use current season/episode; for movies, season/episode will be null
    const downloadUrl = utils.getDownloadUrl(
      content.id,
      content.type,
      content.type === 'movie' ? null : selectedSeason,
      content.type === 'movie' ? null : selectedEpisode
    );
    window.open(downloadUrl, '_blank');

    analytics.trackEvent('content_download', {
      category: 'user_engagement',
      label: `${content.type}_download`,
      content_type: content.type,
      content_id: content.id,
      content_title: content.title || content.name,
      season: content.type === 'movie' ? null : selectedSeason,
      episode: content.type === 'movie' ? null : selectedEpisode,
      download_url: downloadUrl
    });
  };

  const backdropUrl = utils.getBackdropUrl(content.backdrop_path);
  const posterUrl = utils.getPosterUrl(content.poster_path);

  const formatDate = date => {
    if (!date) return '';
    return new Date(date).getFullYear();
  };

  const formatRuntime = minutes => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Helper function to truncate description
  const truncateDescription = (text, maxLength = 300) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    // Find the last complete sentence within the limit
    const truncated = text.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');

    // Use last sentence if found, otherwise use last space
    const cutPoint = lastSentence > maxLength * 0.7 ? lastSentence + 1 : lastSpace;
    return text.substring(0, cutPoint) + '...';
  };

  const getDisplayDescription = () => {
    if (!content?.overview) return '';
    if (showFullDescription || content.overview.length <= 300) {
      return content.overview;
    }
    return truncateDescription(content.overview);
  };

  return (
    <div className="content-detail">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            label: content.type === 'movie' ? 'Movies' : content.type === 'tv' ? 'TV Shows' : 'Anime',
            path: `/browse/${content.type === 'movie' ? 'movies' : content.type}`
          },
          {
            label: content.title || content.name,
            path: `/${content.type}/${content.id}`
          }
        ]}
      />

      {/* Hero Section */}
      <div
        className="content-hero"
        style={{
          background: backdropUrl ? `url(${backdropUrl})` : 'var(--netflix-dark-gray)',
        }}
      >
        {/* Overlay */}
        <div className="content-hero__overlay" />

        {/* Content */}
        <div className="content-hero__content">
          {/* Poster */}
          {posterUrl && (
            <img
              src={posterUrl}
              alt={content.title || content.name}
              className="content-hero__poster"
            />
          )}

          {/* Info */}
          <div className="content-hero__info">
            {/* Back Button */}
            <Button
              as={Link}
              to="/"
              variant="ghost"
              size="small"
              icon={<ArrowLeft size={16} />}
              style={{ marginBottom: '1rem' }}
            >
              Back
            </Button>

            <h1 className="content-hero__title">
              {content.title || content.name}
            </h1>

            {/* Meta Info */}
            <div className="content-meta">
              <span className="content-meta__item">
                {formatDate(content.release_date || content.first_air_date)}
              </span>

              {content.vote_average && (
                <span className="content-meta__item content-meta__item--rating">
                  ★ {Math.round(content.vote_average * 10) / 10}
                </span>
              )}

              {content.runtime && (
                <span className="content-meta__item">
                  {formatRuntime(content.runtime)}
                </span>
              )}

              {content.number_of_seasons && (
                <span className="content-meta__item">
                  {content.number_of_seasons} Season{content.number_of_seasons !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Genres */}
            {content.genres && (
              <div className="content-genres">
                {content.genres.map(genre => (
                  <span key={genre} className="content-genre">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="content-description">
              <p className="content-description__text">
                {getDisplayDescription()}
              </p>

              {/* Read More/Less Toggle */}
              {content.overview && content.overview.length > 300 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="content-description__toggle"
                >
                  {showFullDescription ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="content-actions">
              {/* Play Button for Movies */}
              {type === 'movie' && (
                <Button
                  variant="primary"
                  size="large"
                  icon={<Play size={16} fill="currentColor" />}
                  onClick={() => handlePlayClick()}
                >
                  Play Movie
                </Button>
              )}

              <WatchlistButton
                content={{
                  id: content.id,
                  type: type,
                  title: content.title || content.name,
                  poster_path: content.poster_path,
                  overview: content.overview,
                  vote_average: content.vote_average,
                  release_date: content.release_date || content.first_air_date
                }}
                variant="secondary"
                size="large"
                showText={true}
              />

              <BookmarkButton
                content={{
                  id: content.id,
                  type: type,
                  title: content.title || content.name,
                  poster_path: content.poster_path,
                  overview: content.overview,
                  vote_average: content.vote_average,
                  release_date: content.release_date || content.first_air_date
                }}
                variant="ghost"
                size="large"
                showText={true}
              />

              <Button
                variant="ghost"
                size="large"
                icon={<Share size={16} />}
                onClick={handleShare}
              >
                Share
              </Button>

              <Button
                variant="ghost"
                size="large"
                icon={<Users size={16} />}
                onClick={handleParty}
              >
                Party
              </Button>

              <Button
                variant="ghost"
                size="large"
                icon={<Download size={16} />}
                onClick={handleDownload}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Production Information */}
      <div className="content-section content-section--compact">
        <ProductionInfo
          contentId={content.id}
          contentType={content.type}
        />
      </div>

      {/* Content Section */}
      <div className="content-section">
        {/* Season/Episode Selector - Only for TV Shows and Anime */}
        {(type === 'tv' || type === 'anime') && !showPlayer && (
          <SeasonEpisodeSelector
            contentId={content.id}
            contentType={type}
            totalSeasons={content.number_of_seasons || 1}
            onEpisodeSelect={handleEpisodeSelect}
            onPlayClick={handlePlayClick}
          />
        )}

        {/* BoredFlix-style Server Selector */}
        {showPlayer && (
          <ServerSelector
            onServerChange={handleServerChange}
            activeServer={selectedServer}
            availableServers={[1, 2, 3, 4, 5, 6, 7, 8]}
            serverStatus={{
              1: 'online',  // Videasy
              2: 'online',  // Vidsrc
              3: 'unavailable',
              4: 'unavailable',
              5: 'unavailable',
              6: 'unavailable',
              7: 'unavailable',
              8: 'unavailable'
            }}
          />
        )}

        {/* Embedded Video Player */}
        {(() => {
          try {
            return (
              <VideoPlayer
                contentId={content.id}
                contentType={type}
                season={selectedSeason}
                episode={selectedEpisode}
                totalSeasons={content.number_of_seasons || 1}
                show={showPlayer}
                onClose={() => setShowPlayer(false)}
                onEpisodeSelect={handleEpisodeSelect}
                autoPlay={true}
                selectedServer={selectedServer}
              />
            );
          } catch (error) {
            console.error('VideoPlayer error:', error);
            return (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--netflix-text-gray)',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '8px',
                margin: '1rem 0'
              }}>
                <p>Video player temporarily unavailable. Please try refreshing the page.</p>
              </div>
            );
          }
        })()}
      </div>

      {/* Comments Section */}
      <CommentsSection
        contentId={content.id}
        contentType={content.type}
        contentTitle={content.title || content.name}
      />

      {/* BoredFlix-style FAQ Section */}
      <div className="content-section">
        <ContentFAQ content={content} />
      </div>
    </div>
  );
};

export default ContentDetail;
