import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Tv } from 'lucide-react';
import PropTypes from 'prop-types';
import ChannelSearch from './ChannelSearch';
import ChannelListItem from './ChannelListItem';
import CountrySelector from './CountrySelector';
import { DEFAULT_COUNTRY } from '../data/countries';
import './ChannelSelector.css';

const ChannelSelector = ({ selectedChannel, onChannelSelect, currentlyPlayingId, onClose }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(() => {
    // Load from localStorage or use default
    return localStorage.getItem('liveTV_selectedCountry') || DEFAULT_COUNTRY;
  });

  // Fetch channels from API based on selected country
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://raw.githubusercontent.com/TVGarden/tv-garden-channel-list/refs/heads/main/channels/raw/countries/${selectedCountry}.json`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }

        const data = await response.json();
        setChannels(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError('Failed to load channels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [selectedCountry]);

  // Save selected country to localStorage
  useEffect(() => {
    localStorage.setItem('liveTV_selectedCountry', selectedCountry);
  }, [selectedCountry]);

  // Handle country change
  const handleCountryChange = countryCode => {
    setSelectedCountry(countryCode);
    setSearchQuery(''); // Clear search when changing country
  };

  // Filter channels based on search
  const filteredChannels = useMemo(() => {
    let filtered = channels;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        channel =>
          channel.name.toLowerCase().includes(query) ||
          (channel.language && channel.language.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [channels, searchQuery]);

  const handleChannelClick = channel => {
    onChannelSelect(channel);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="channel-selector">
      {/* Header */}
      <div className="channel-selector-header">
        <div className="header-top">
          {onClose && (
            <button className="back-button" onClick={onClose} aria-label="Close channel selector">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="header-title">
            <Tv size={20} />
            <h2>Live TV</h2>
          </div>
        </div>

        <div className="channel-count">
          {loading ? (
            <span>Loading...</span>
          ) : (
            <span>
              {filteredChannels.length} {filteredChannels.length === 1 ? 'channel' : 'channels'}
            </span>
          )}
        </div>
      </div>

      {/* Country Selector */}
      <div className="country-selector-wrapper">
        <CountrySelector selectedCountry={selectedCountry} onCountryChange={handleCountryChange} />
      </div>

      {/* Search */}
      <ChannelSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={handleClearSearch}
      />

      {/* Channel List */}
      <div className="channel-list">
        {loading && (
          <div className="channel-list-loading">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>Loading channels...</p>
          </div>
        )}

        {error && (
          <div className="channel-list-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredChannels.length === 0 && (
          <div className="channel-list-empty">
            <Tv size={48} />
            <p>No channels found</p>
            {searchQuery && (
              <button className="clear-filters-button" onClick={handleClearSearch}>
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredChannels.length > 0 && (
          <div className="channel-list-items">
            {filteredChannels.map(channel => (
              <ChannelListItem
                key={channel.nanoid}
                channel={channel}
                isSelected={selectedChannel?.nanoid === channel.nanoid}
                isPlaying={currentlyPlayingId === channel.nanoid}
                onClick={() => handleChannelClick(channel)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

ChannelSelector.propTypes = {
  selectedChannel: PropTypes.object,
  onChannelSelect: PropTypes.func.isRequired,
  currentlyPlayingId: PropTypes.string,
  onClose: PropTypes.func,
};

export default ChannelSelector;
