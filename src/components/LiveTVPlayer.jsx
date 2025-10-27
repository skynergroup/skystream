import { useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import './LiveTVPlayer.css';

const LiveTVPlayer = ({ streamUrl = 'https://sabconeta.cdn.mangomolo.com/sabc1/smil:sabc1.stream.smil/master.m3u8' }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(DateTime.now());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(DateTime.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize HLS player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initPlayer = async () => {
      try {
        // Check if browser supports HLS natively (Safari)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          setIsLoading(false);
          setError(null);
        } else {
          // Use HLS.js for other browsers
          const HLS = (await import('hls.js')).default;
          
          if (HLS.isSupported()) {
            const hls = new HLS({
              enableWorker: true,
              lowLatencyMode: true,
            });
            
            hlsRef.current = hls;
            
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            
            hls.on(HLS.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
              setError(null);
              video.play().catch(() => {
                // Autoplay might be blocked
                setIsLoading(false);
              });
            });
            
            hls.on(HLS.Events.ERROR, (event, data) => {
              console.error('HLS error:', data);
              if (data.fatal) {
                switch (data.type) {
                  case HLS.ErrorTypes.NETWORK_ERROR:
                    console.error('Network error details:', data.details, data.response);
                    if (data.response?.code === 0) {
                      setError('CORS Error - Stream blocked by browser security. This stream may only work in VLC or similar players.');
                    } else {
                      setError('Network error - Failed to load stream. Please check your connection.');
                    }
                    // Try to recover
                    setTimeout(() => {
                      if (hlsRef.current) {
                        hls.startLoad();
                      }
                    }, 3000);
                    break;
                  case HLS.ErrorTypes.MEDIA_ERROR:
                    setError('Media error - Trying to recover...');
                    hls.recoverMediaError();
                    break;
                  default:
                    setError('Fatal error - Cannot play stream. Try using VLC or another media player.');
                    hls.destroy();
                    break;
                }
                setIsLoading(false);
              }
            });
          } else {
            setError('HLS is not supported in this browser');
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to initialize player:', err);
        setError('Failed to load video player');
        setIsLoading(false);
      }
    };

    // Handle video events
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => setIsLoading(false);
    const handleError = () => {
      const errorCode = video.error?.code;
      const errorMessages = {
        1: 'Video loading aborted',
        2: 'Network error',
        3: 'Video decoding failed',
        4: 'Video format not supported',
      };
      setError(errorMessages[errorCode] || 'Failed to load video');
      setIsLoading(false);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    initPlayer();

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  const formattedTime = currentTime.toFormat('HH:mm:ss');
  const formattedDate = currentTime.toFormat('EEEE, MMMM d, yyyy');

  return (
    <div className="live-tv-player">
      <div className="live-tv-container">
        <div className="live-tv-header">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">LIVE</span>
          </div>
          <div className="live-time">
            <div className="time">{formattedTime}</div>
            <div className="date">{formattedDate}</div>
          </div>
        </div>

        <div className="video-container">
          {error && (
            <div className="error-message">
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>{error}</p>
              {error.includes('CORS') ? (
                <div>
                  <p>This stream has CORS restrictions that prevent playback in browsers.</p>
                  <p style={{ marginTop: '1rem' }}>Alternative options:</p>
                  <ul style={{ textAlign: 'left', marginTop: '0.5rem', paddingLeft: '2rem' }}>
                    <li>Use VLC Media Player with this URL: <br/>
                      <code style={{
                        background: 'rgba(0,0,0,0.5)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        wordBreak: 'break-all'
                      }}>
                        {streamUrl}
                      </code>
                    </li>
                    <li style={{ marginTop: '0.5rem' }}>Try a different browser</li>
                    <li style={{ marginTop: '0.5rem' }}>Use a browser extension to bypass CORS</li>
                  </ul>
                </div>
              ) : (
                <p>Please try refreshing the page or check your internet connection.</p>
              )}
            </div>
          )}
          {isLoading && !error && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading stream...</p>
            </div>
          )}
          <video
            ref={videoRef}
            className="live-video"
            controls
            playsInline
            muted
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
          />
        </div>

        <div className="live-tv-footer">
          <p>SABC1 Live Stream</p>
        </div>
      </div>
    </div>
  );
};

LiveTVPlayer.propTypes = {
  streamUrl: PropTypes.string,
};

export default LiveTVPlayer;
