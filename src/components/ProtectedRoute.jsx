import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import { Lock, Play, Eye } from 'lucide-react';
import './ProtectedRoute.css';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  fallback = null,
  showAuthPrompt = true,
  promptTitle = "Sign in to continue",
  promptMessage = "You need to be signed in to access this content.",
  promptIcon = Lock
}) => {
  const { isAuthenticated, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // If a custom fallback is provided, use it
    if (fallback) {
      return fallback;
    }

    // If showAuthPrompt is false, return null or empty
    if (!showAuthPrompt) {
      return null;
    }

    // Default authentication prompt
    const IconComponent = promptIcon;

    return (
      <>
        <div className="protected-route-prompt">
          <div className="protected-route-prompt-content">
            <div className="protected-route-prompt-icon">
              <IconComponent size={64} />
            </div>
            <h2 className="protected-route-prompt-title">{promptTitle}</h2>
            <p className="protected-route-prompt-message">{promptMessage}</p>
            <div className="protected-route-prompt-actions">
              <button 
                className="protected-route-btn protected-route-btn-primary"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </button>
              <button 
                className="protected-route-btn protected-route-btn-secondary"
                onClick={() => setShowAuthModal(true)}
              >
                Create Account
              </button>
            </div>
            <div className="protected-route-prompt-features">
              <div className="feature-item">
                <Play size={20} />
                <span>Stream unlimited content</span>
              </div>
              <div className="feature-item">
                <Eye size={20} />
                <span>Track your watch history</span>
              </div>
              <div className="feature-item">
                <Lock size={20} />
                <span>Secure and private</span>
              </div>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="signin"
        />
      </>
    );
  }

  // User is authenticated or authentication is not required
  return children;
};

// Higher-order component for protecting content access
export const withAuthProtection = (Component, options = {}) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific protection components for different use cases
export const ProtectedVideoPlayer = ({ children, ...props }) => (
  <ProtectedRoute
    requireAuth={true}
    promptTitle="Sign in to watch"
    promptMessage="Create a free account to start streaming movies and TV shows."
    promptIcon={Play}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

export const ProtectedLibrary = ({ children, ...props }) => (
  <ProtectedRoute
    requireAuth={true}
    promptTitle="Sign in to access your library"
    promptMessage="Your personal library keeps track of your watchlist and viewing history."
    promptIcon={Eye}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

export const ProtectedWatchlist = ({ children, ...props }) => (
  <ProtectedRoute
    requireAuth={true}
    promptTitle="Sign in to manage your watchlist"
    promptMessage="Save movies and TV shows to watch later with a free account."
    promptIcon={Eye}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
