import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Share, ArrowLeft } from 'lucide-react';
import { Button, Loading } from '../components';
import VideoPlayer from '../components/VideoPlayer';
import tmdbApi from '../services/tmdbApi';
import { utils } from '../utils/config';

const ContentDetail = () => {
  const { type, id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      let contentData;
      if (type === 'movie') {
        contentData = await tmdbApi.getMovieDetails(id);
      } else if (type === 'tv' || type === 'anime') {
        contentData = await tmdbApi.getTVShowDetails(id);
      } else {
        throw new Error('Invalid content type');
      }

      // Transform the data to our format
      const transformedContent = {
        ...tmdbApi.transformContent(contentData),
        runtime: contentData.runtime,
        number_of_seasons: contentData.number_of_seasons,
        number_of_episodes: contentData.number_of_episodes,
        genres: contentData.genres?.map(g => g.name) || [],
        type: type
      };

      setContent(transformedContent);

    } catch (err) {
      console.error('Failed to load content details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type && id) {
      loadContent();
    }
  }, [type, id]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Loading size="large" text="Loading content..." />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          color: 'var(--netflix-red)', 
          margin: '0 0 1rem 0' 
        }}>
          404
        </h1>
        <h2 style={{ 
          fontSize: '1.5rem', 
          color: 'var(--netflix-white)', 
          margin: '0 0 1rem 0' 
        }}>
          Content Not Found
        </h2>
        <p style={{ 
          color: 'var(--netflix-text-gray)', 
          margin: '0 0 2rem 0' 
        }}>
          The content you're looking for doesn't exist or has been removed.
        </p>
        <Button as={Link} to="/" variant="primary">
          Go Back Home
        </Button>
      </div>
    );
  }

  const backdropUrl = utils.getBackdropUrl(content.backdrop_path);
  const posterUrl = utils.getPosterUrl(content.poster_path);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).getFullYear();
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="content-detail">
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        height: '70vh',
        minHeight: '500px',
        background: backdropUrl ? `url(${backdropUrl})` : 'var(--netflix-dark-gray)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)'
        }} />
        
        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          width: '100%',
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
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
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
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
            
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: 'var(--netflix-white)',
              margin: '0 0 1rem 0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              {content.title || content.name}
            </h1>
            
            {/* Meta Info */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                background: 'rgba(0,0,0,0.6)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                color: 'var(--netflix-white)',
                fontWeight: '500'
              }}>
                {formatDate(content.release_date || content.first_air_date)}
              </span>
              
              {content.vote_average && (
                <span style={{
                  background: 'rgba(0,0,0,0.6)',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  color: '#ffd700',
                  fontWeight: '500'
                }}>
                  ★ {Math.round(content.vote_average * 10) / 10}
                </span>
              )}
              
              {content.runtime && (
                <span style={{
                  background: 'rgba(0,0,0,0.6)',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  color: 'var(--netflix-white)',
                  fontWeight: '500'
                }}>
                  {formatRuntime(content.runtime)}
                </span>
              )}
              
              {content.number_of_seasons && (
                <span style={{
                  background: 'rgba(0,0,0,0.6)',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  color: 'var(--netflix-white)',
                  fontWeight: '500'
                }}>
                  {content.number_of_seasons} Season{content.number_of_seasons !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {/* Genres */}
            {content.genres && (
              <div style={{ marginBottom: '1.5rem' }}>
                {content.genres.map((genre, index) => (
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
                      marginBottom: '0.5rem'
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            
            {/* Overview */}
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.6',
              color: 'var(--netflix-text-gray)',
              margin: '0 0 2rem 0',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              {content.overview}
            </p>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="large"
                icon={<Play size={20} fill="currentColor" />}
                onClick={() => setShowPlayer(true)}
              >
                Play Now
              </Button>

              <Button
                variant="secondary"
                size="large"
                icon={<Plus size={20} />}
              >
                Add to Watchlist
              </Button>

              <Button
                variant="ghost"
                size="large"
                icon={<Share size={20} />}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      {showPlayer && (
        <VideoPlayer
          contentId={content.id}
          contentType={type}
          onClose={() => setShowPlayer(false)}
          autoPlay={true}
        />
      )}
    </div>
  );
};

export default ContentDetail;
