import { CheckCircle, AlertCircle, Globe } from 'lucide-react';
import PropTypes from 'prop-types';
import './ChannelListItem.css';

const ChannelListItem = ({ channel, isSelected, isPlaying, onClick }) => {
  // Determine if channel is browser compatible
  // Compatible if it has either IPTV URLs (HLS) or YouTube URLs
  const hasIPTV = channel.iptv_urls && channel.iptv_urls.length > 0;
  const hasYouTube = channel.youtube_urls && channel.youtube_urls.length > 0;
  const isBrowserCompatible = hasIPTV || hasYouTube;
  const isGeoBlocked = channel.isGeoBlocked;

  // Get country flag emoji
  const getCountryFlag = (countryCode) => {
    if (!countryCode) return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div
      className={`channel-list-item ${isSelected ? 'selected' : ''} ${!isBrowserCompatible ? 'incompatible' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${channel.name} - ${isBrowserCompatible ? 'Browser compatible' : 'VLC required'}`}
    >
      <div className="channel-item-content">
        <div className="channel-main-info">
          <span className="channel-flag">{getCountryFlag(channel.country)}</span>
          <span className="channel-name">{channel.name}</span>
          {isPlaying && (
            <span className="playing-indicator">
              <span className="playing-dot"></span>
            </span>
          )}
        </div>
        
        <div className="channel-meta">
          {channel.language && (
            <span className="channel-language">{channel.language.toUpperCase()}</span>
          )}
        </div>
      </div>

      <div className="channel-status">
        {isGeoBlocked && (
          <div className="status-badge geo-blocked" title="Geo-blocked">
            <Globe size={14} />
          </div>
        )}
        {isBrowserCompatible ? (
          <div className="status-badge compatible" title="Browser compatible">
            <CheckCircle size={14} />
          </div>
        ) : (
          <div className="status-badge incompatible" title="VLC required">
            <AlertCircle size={14} />
          </div>
        )}
      </div>
    </div>
  );
};

ChannelListItem.propTypes = {
  channel: PropTypes.shape({
    nanoid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    iptv_urls: PropTypes.arrayOf(PropTypes.string),
    youtube_urls: PropTypes.arrayOf(PropTypes.string),
    language: PropTypes.string,
    country: PropTypes.string,
    isGeoBlocked: PropTypes.bool,
  }).isRequired,
  isSelected: PropTypes.bool,
  isPlaying: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

ChannelListItem.defaultProps = {
  isSelected: false,
  isPlaying: false,
};

export default ChannelListItem;

