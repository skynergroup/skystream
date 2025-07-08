import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Play, Share, ArrowLeft, X } from 'lucide-react';
import { Button, Loading, Breadcrumb, ProductionInfo, CommentsSection, FAQSection, BookmarkButton } from '../components';
import VideoPlayer from '../components/VideoPlayer';
import SeasonEpisodeSelector from '../components/SeasonEpisodeSelector';
import WatchlistButton from '../components/WatchlistButton';
import tmdbApi from '../services/tmdbApi';
import { utils, analytics } from '../utils';

const ContentDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

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

      analytics.trackContentView(type, id, transformedContent.title, metadata);

      // Track specific content type popularity
      if (type === 'movie') {
        analytics.trackMovieView(id, transformedContent.title, metadata);
      } else if (type === 'tv') {
        analytics.trackSeriesView(id, transformedContent.title, metadata);
      } else if (type === 'anime') {
        analytics.trackAnimeView(id, transformedContent.title, metadata);
      }

      // Track genre preferences
      if (transformedContent.genres?.length > 0) {
        transformedContent.genres.forEach(genre => {
          analytics.trackGenreInteraction(genre, type, 'view');
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

  // Auto-open player for movies when content loads
  useEffect(() => {
    if (content && content.type === 'movie' && !showPlayer) {
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

  const handlePlayClick = (season = null, episode = null) => {
    const playerInfo = {
      player: utils.PLAYER_CONFIG?.defaults?.player || 'unknown',
      season: season || selectedSeason,
      episode: episode || selectedEpisode,
    };

    if (content.type === 'movie') {
      setShowPlayer(true);
      // Track movie play with player info
      analytics.trackVideoEvent('play', content.type, content.id, content.title, playerInfo);
    } else if (content.type === 'tv' || content.type === 'anime') {
      const currentSeason = season || selectedSeason;
      const currentEpisode = episode || selectedEpisode;

      setSelectedSeason(currentSeason);
      setSelectedEpisode(currentEpisode);
      setShowPlayer(true);

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
      analytics.trackVideoEvent('play', content.type, content.id,
        `${content.title} S${currentSeason}E${currentEpisode}`, playerInfo);
    }
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
        style={{
          position: 'relative',
          height: '70vh',
          minHeight: '500px',
          background: backdropUrl ? `url(${backdropUrl})` : 'var(--netflix-dark-gray)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 2rem',
            width: '100%',
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          {/* Poster */}
          {posterUrl && (
            <img
              src={posterUrl}
              alt={content.title || content.name}
              style={{
                width: '300px',
                height: '450px',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            />
          )}

          {/* Info */}
          <div style={{ flex: 1, maxWidth: '600px' }}>
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

            <h1
              style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: 'var(--netflix-white)',
                margin: '0 0 1rem 0',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {content.title || content.name}
            </h1>

            {/* Meta Info */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  color: 'var(--netflix-white)',
                  fontWeight: '500',
                }}
              >
                {formatDate(content.release_date || content.first_air_date)}
              </span>

              {content.vote_average && (
                <span
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    color: '#ffd700',
                    fontWeight: '500',
                  }}
                >
                  ★ {Math.round(content.vote_average * 10) / 10}
                </span>
              )}

              {content.runtime && (
                <span
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    color: 'var(--netflix-white)',
                    fontWeight: '500',
                  }}
                >
                  {formatRuntime(content.runtime)}
                </span>
              )}

              {content.number_of_seasons && (
                <span
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    color: 'var(--netflix-white)',
                    fontWeight: '500',
                  }}
                >
                  {content.number_of_seasons} Season{content.number_of_seasons !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Genres */}
            {content.genres && (
              <div style={{ marginBottom: '1.5rem' }}>
                {content.genres.map(genre => (
                  <span
                    key={genre}
                    style={{
                      display: 'inline-block',
                      background: 'var(--netflix-red)',
                      color: 'var(--netflix-white)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      marginRight: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <p
              style={{
                fontSize: '1.1rem',
                lineHeight: '1.6',
                color: 'var(--netflix-text-gray)',
                margin: '0 0 2rem 0',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              {content.overview}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Play Button for Movies */}
              {type === 'movie' && (
                <Button
                  variant="primary"
                  size="large"
                  icon={<Play size={20} fill="currentColor" />}
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
                variant="large"
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
                variant="secondary"
                size="large"
                showText={true}
              />

              <Button variant="ghost" size="large" icon={<Share size={20} />}>
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Production Information */}
      <ProductionInfo
        contentId={content.id}
        contentType={content.type}
      />

      {/* Content Section */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
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

      {/* FAQ Section */}
      <FAQSection
        contentType={content.type}
        contentTitle={content.title || content.name}
      />
    </div>
  );
};

export default ContentDetail;
