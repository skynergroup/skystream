import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const AuthenticatedLink = ({ 
  to, 
  children, 
  className = '', 
  requireAuth = true,
  onClick,
  ...props 
}) => {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = (e) => {
    // If authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
      e.preventDefault();
      setShowAuthModal(true);
      return;
    }

    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <>
      <Link 
        to={to} 
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
    </>
  );
};

export default AuthenticatedLink;
