import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, Heart, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getWatchlist, getWatchlistStats, getProgressStats } from '../utils/watchlist';
import './UserProfile.css';

const UserProfile = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stats, setStats] = useState({
    watchlist: { total: 0, movies: 0, shows: 0 },
    progress: { total: 0, completed: 0, inProgress: 0 }
  });
  
  const dropdownRef = useRef(null);
  const { isAuthenticated, userAttributes, signOut } = useAuth();

  // Load user stats
  useEffect(() => {
    if (isAuthenticated) {
      const watchlistStats = getWatchlistStats();
      const progressStats = getProgressStats();
      
      setStats({
        watchlist: watchlistStats,
        progress: progressStats
      });
    }
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const displayName = userAttributes.name || userAttributes.email?.split('@')[0] || 'User';
  const userEmail = userAttributes.email;
  const userAvatar = userAttributes.picture;
  const isGoogleUser = userAttributes.provider === 'google';

  return (
    <div className="user-profile" ref={dropdownRef}>
      <button
        className="user-profile__trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <div className="user-profile__avatar">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={displayName}
              className="user-profile__avatar-image"
            />
          ) : (
            <User size={20} />
          )}
        </div>
        <span className="user-profile__name">{displayName}</span>
        <ChevronDown 
          size={16} 
          className={`user-profile__chevron ${isDropdownOpen ? 'user-profile__chevron--open' : ''}`}
        />
      </button>

      {isDropdownOpen && (
        <div className="user-profile__dropdown">
          {/* User Info Section */}
          <div className="user-profile__info">
            <div className="user-profile__avatar user-profile__avatar--large">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={displayName}
                  className="user-profile__avatar-image"
                />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className="user-profile__details">
              <div className="user-profile__display-name">{displayName}</div>
              <div className="user-profile__email">{userEmail}</div>
              {isGoogleUser && (
                <div className="user-profile__provider">
                  <span className="user-profile__provider-badge">Google</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="user-profile__stats">
            <div className="user-profile__stat">
              <div className="user-profile__stat-icon">
                <Heart size={16} />
              </div>
              <div className="user-profile__stat-content">
                <div className="user-profile__stat-value">{stats.watchlist.total}</div>
                <div className="user-profile__stat-label">Watchlist</div>
              </div>
            </div>

            <div className="user-profile__stat">
              <div className="user-profile__stat-icon">
                <Clock size={16} />
              </div>
              <div className="user-profile__stat-content">
                <div className="user-profile__stat-value">{stats.progress.inProgress}</div>
                <div className="user-profile__stat-label">Watching</div>
              </div>
            </div>

            <div className="user-profile__stat">
              <div className="user-profile__stat-icon">
                <Star size={16} />
              </div>
              <div className="user-profile__stat-content">
                <div className="user-profile__stat-value">{stats.progress.completed}</div>
                <div className="user-profile__stat-label">Completed</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="user-profile__menu">
            <button 
              className="user-profile__menu-item"
              onClick={() => {
                setIsDropdownOpen(false);
                // Navigate to profile settings (implement later)
                console.log('Navigate to profile settings');
              }}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>

            <button 
              className="user-profile__menu-item user-profile__menu-item--danger"
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
