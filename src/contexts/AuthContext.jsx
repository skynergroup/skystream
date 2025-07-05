import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../services/authService';
import { analytics } from '../utils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userAttributes, setUserAttributes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if AWS Cognito is configured
        if (!authService.isConfigured) {
          console.info('Authentication system not configured. Users can still browse content.');
          setLoading(false);
          return;
        }

        // Check for existing session
        const session = await authService.getCurrentSession();
        
        if (session) {
          setIsAuthenticated(true);
          setUser(authService.getCurrentUser());
          setUserAttributes(authService.getCurrentUserAttributes());
          
          // Track user session
          analytics.trackEvent('user_session_restored', {
            category: 'auth',
            label: 'session_check',
            user_id: authService.getCurrentUserAttributes().sub
          });
        }

        // Initialize Google Sign-In
        try {
          await authService.initializeGoogleSignIn();
        } catch (googleError) {
          console.warn('Google Sign-In initialization failed:', googleError);
          // Don't fail the entire auth initialization if Google fails
        }

      } catch (err) {
        console.error('Auth initialization failed:', err);
        setError(err);
        setIsAuthenticated(false);
        setUser(null);
        setUserAttributes({});
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const handleAuthChange = (authState) => {
      setIsAuthenticated(authState.isAuthenticated);
      setUser(authState.user);
      setUserAttributes(authState.attributes);
    };

    authService.addAuthListener(handleAuthChange);

    // Cleanup
    return () => {
      authService.removeAuthListener(handleAuthChange);
    };
  }, []);

  // Sign up function
  const signUp = useCallback(async (email, password, additionalAttributes = {}) => {
    if (!authService.isConfigured) {
      throw new Error('Authentication not configured. Please run ./scripts/setup-aws.sh');
    }

    try {
      setError(null);
      setLoading(true);

      const result = await authService.signUp(email, password, additionalAttributes);
      
      // Track sign up
      analytics.trackEvent('user_signup_attempt', {
        category: 'auth',
        label: 'email_signup',
        method: 'email'
      });

      return result;
    } catch (err) {
      setError(err);
      
      // Track sign up error
      analytics.trackError(`Sign up failed: ${err.message}`, 'auth_signup_error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirm sign up function
  const confirmSignUp = useCallback(async (email, verificationCode) => {
    try {
      setError(null);
      setLoading(true);

      const result = await authService.confirmSignUp(email, verificationCode);
      
      // Track confirmation
      analytics.trackEvent('user_signup_confirmed', {
        category: 'auth',
        label: 'email_confirmation'
      });

      return result;
    } catch (err) {
      setError(err);
      
      // Track confirmation error
      analytics.trackError(`Sign up confirmation failed: ${err.message}`, 'auth_confirmation_error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in function
  const signIn = useCallback(async (email, password) => {
    if (!authService.isConfigured) {
      throw new Error('Authentication not configured. Please run ./scripts/setup-aws.sh');
    }

    try {
      setError(null);
      setLoading(true);

      const result = await authService.signIn(email, password);
      
      setIsAuthenticated(true);
      setUser(result.user);
      setUserAttributes(result.attributes);

      // Track sign in
      analytics.trackEvent('user_signin', {
        category: 'auth',
        label: 'email_signin',
        method: 'email',
        user_id: result.attributes.sub
      });

      return result;
    } catch (err) {
      setError(err);
      setIsAuthenticated(false);
      setUser(null);
      setUserAttributes({});
      
      // Track sign in error
      analytics.trackError(`Sign in failed: ${err.message}`, 'auth_signin_error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Track sign out
      analytics.trackEvent('user_signout', {
        category: 'auth',
        label: 'user_initiated',
        user_id: userAttributes.sub
      });

      await authService.signOut();
      
      setIsAuthenticated(false);
      setUser(null);
      setUserAttributes({});

    } catch (err) {
      setError(err);
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  }, [userAttributes.sub]);

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    try {
      setError(null);
      setLoading(true);

      const result = await authService.forgotPassword(email);
      
      // Track forgot password
      analytics.trackEvent('user_forgot_password', {
        category: 'auth',
        label: 'password_reset_request'
      });

      return result;
    } catch (err) {
      setError(err);
      
      // Track forgot password error
      analytics.trackError(`Forgot password failed: ${err.message}`, 'auth_forgot_password_error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirm password function
  const confirmPassword = useCallback(async (email, verificationCode, newPassword) => {
    try {
      setError(null);
      setLoading(true);

      const result = await authService.confirmPassword(email, verificationCode, newPassword);
      
      // Track password confirmation
      analytics.trackEvent('user_password_reset_confirmed', {
        category: 'auth',
        label: 'password_reset_success'
      });

      return result;
    } catch (err) {
      setError(err);
      
      // Track password confirmation error
      analytics.trackError(`Password confirmation failed: ${err.message}`, 'auth_password_confirmation_error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Google Sign-In function
  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      
      // Trigger Google Sign-In
      if (window.google && window.google.accounts) {
        window.google.accounts.id.prompt();
      } else {
        throw new Error('Google Sign-In not available');
      }
    } catch (err) {
      setError(err);
      
      // Track Google sign in error
      analytics.trackError(`Google Sign-In failed: ${err.message}`, 'auth_google_signin_error');
      throw err;
    }
  }, []);

  // Render Google Sign-In button
  const renderGoogleSignInButton = useCallback((elementId, options = {}) => {
    authService.renderGoogleSignInButton(elementId, options);
  }, []);

  const value = {
    // State
    isAuthenticated,
    user,
    userAttributes,
    loading,
    error,

    // Actions
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    forgotPassword,
    confirmPassword,
    signInWithGoogle,
    renderGoogleSignInButton,

    // Utilities
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
