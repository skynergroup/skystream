import { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import Button from './Button';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode); // 'signin', 'signup', 'forgot', 'confirm'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    verificationCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState(''); // Store email for confirmation
  
  const googleButtonRef = useRef(null);
  const modalRef = useRef(null);

  const {
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    forgotPassword,
    confirmPassword,
    signInWithGoogle,
    renderGoogleSignInButton,
    loading,
    error,
    clearError,
  } = useAuth();

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        verificationCode: '',
      });
      setLocalError('');
      setSuccessMessage('');
      clearError();
    }
  }, [isOpen, mode, clearError]);

  // Initialize Google Sign-In button
  useEffect(() => {
    if (isOpen && mode === 'signin' && googleButtonRef.current) {
      try {
        renderGoogleSignInButton('google-signin-button', {
          theme: 'filled_blue',
          size: 'large',
          type: 'standard',
          width: '100%',
        });
      } catch (err) {
        console.warn('Failed to render Google Sign-In button:', err);
      }
    }
  }, [isOpen, mode, renderGoogleSignInButton]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
    clearError();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalLoading(true);

    try {
      switch (mode) {
        case 'signin':
          try {
            await signIn(formData.email, formData.password);
            setSuccessMessage('Sign in successful!');
            setTimeout(() => onClose(), 1500);
          } catch (signinError) {
            if (signinError.needsConfirmation) {
              setPendingEmail(formData.email); // Store email for confirmation
              setLocalError('Please check your email and confirm your account first.');
              setMode('confirm');
              // Auto-resend confirmation code
              try {
                await authService.resendConfirmationCode(formData.email);
                setSuccessMessage('Confirmation code resent to your email.');
              } catch (resendError) {
                console.warn('Failed to resend confirmation code:', resendError);
              }
            } else {
              throw signinError;
            }
          }
          break;

        case 'signup':
          if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
          }
          if (formData.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
          }

          await signUp(formData.email, formData.password, {
            name: formData.name,
          });
          setPendingEmail(formData.email); // Store email for confirmation
          setSuccessMessage('Sign up successful! Please check your email for verification code.');
          setMode('confirm');
          break;

        case 'confirm':
          const emailToConfirm = pendingEmail || formData.email;
          console.log('Confirmation attempt:', {
            pendingEmail,
            formDataEmail: formData.email,
            emailToConfirm,
            verificationCode: formData.verificationCode
          });

          if (!emailToConfirm) {
            throw new Error('Email address is required for confirmation');
          }
          if (!formData.verificationCode) {
            throw new Error('Verification code is required');
          }

          await confirmSignUp(emailToConfirm, formData.verificationCode);
          setSuccessMessage('Email verified successfully! You can now sign in.');
          setMode('signin');
          setPendingEmail(''); // Clear stored email
          break;

        case 'forgot':
          await forgotPassword(formData.email);
          setSuccessMessage('Password reset code sent to your email.');
          setMode('reset');
          break;

        case 'reset':
          if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
          }
          await confirmPassword(formData.email, formData.verificationCode, formData.password);
          setSuccessMessage('Password reset successful! You can now sign in.');
          setMode('signin');
          break;

        default:
          throw new Error('Invalid mode');
      }
    } catch (err) {
      setLocalError(err.message || 'An error occurred');
    } finally {
      setLocalLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setSuccessMessage('Google Sign-In successful!');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setLocalError(err.message || 'Google Sign-In failed');
    }
  };

  // Handle resend confirmation code
  const handleResendCode = async () => {
    const emailToUse = pendingEmail || formData.email;
    if (!emailToUse) {
      setLocalError('Please enter your email address');
      return;
    }

    setLocalLoading(true);
    try {
      await authService.resendConfirmationCode(emailToUse);
      setSuccessMessage('Confirmation code resent to your email.');
      setLocalError('');
    } catch (err) {
      setLocalError(err.message || 'Failed to resend confirmation code');
    } finally {
      setLocalLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      verificationCode: '',
    });
    setLocalError('');
    setSuccessMessage('');
    setPendingEmail(''); // Clear stored email
    clearError();
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  // Show configuration notice if AWS Cognito is not configured
  if (!authService.isConfigured) {
    return (
      <div
        ref={modalRef}
        className="auth-modal-overlay"
        onClick={handleBackdropClick}
      >
        <div className="auth-modal">
          <div className="auth-modal__header">
            <h2 className="auth-modal__title">
              <Settings size={24} style={{ marginRight: '8px' }} />
              Authentication Setup Required
            </h2>
            <button className="auth-modal__close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="auth-modal__content">
            <div className="auth-modal__setup-info">
              <p>To enable user accounts and personalized features, please configure AWS Cognito.</p>

              <div className="setup-step">
                <h3>🔧 Quick Setup</h3>
                <p>Run the automated setup script:</p>
                <code>./scripts/setup-aws.sh</code>
              </div>

              <div className="setup-step">
                <h3>✨ Features you'll unlock:</h3>
                <ul>
                  <li>Personal watchlist sync across devices</li>
                  <li>Watch progress tracking</li>
                  <li>Personalized recommendations</li>
                  <li>User preferences and settings</li>
                </ul>
              </div>
            </div>

            <div className="auth-modal__actions">
              <Button variant="primary" onClick={onClose}>
                Got it, I'll set it up later
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentError = localError || error?.message;
  const isLoading = localLoading || loading;

  return (
    <div 
      ref={modalRef}
      className="auth-modal-overlay" 
      onClick={handleBackdropClick}
    >
      <div className="auth-modal">
        <div className="auth-modal__header">
          <h2 className="auth-modal__title">
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'confirm' && 'Verify Email'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'reset' && 'Set New Password'}
          </h2>
          <button 
            className="auth-modal__close"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="auth-modal__content">
          {/* Success Message */}
          {successMessage && (
            <div className="auth-modal__message auth-modal__message--success">
              <CheckCircle size={20} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {currentError && (
            <div className="auth-modal__message auth-modal__message--error">
              <AlertCircle size={20} />
              <span>{currentError}</span>
            </div>
          )}

          {/* Google Sign-In (only for signin mode) */}
          {mode === 'signin' && (
            <div className="auth-modal__google">
              <div id="google-signin-button"></div>
              <div className="auth-modal__divider">
                <span>or</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-modal__form">
            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <div className="auth-modal__field">
                <label htmlFor="name">Full Name</label>
                <div className="auth-modal__input-wrapper">
                  <User size={20} className="auth-modal__input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            {(mode === 'signin' || mode === 'signup' || mode === 'forgot' || mode === 'reset') && (
              <div className="auth-modal__field">
                <label htmlFor="email">Email</label>
                <div className="auth-modal__input-wrapper">
                  <Mail size={20} className="auth-modal__input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading || mode === 'reset'}
                  />
                </div>
              </div>
            )}

            {/* Verification Code field */}
            {(mode === 'confirm' || mode === 'reset') && (
              <div className="auth-modal__field">
                <label htmlFor="verificationCode">Verification Code</label>
                <div className="auth-modal__input-wrapper">
                  <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    placeholder="Enter verification code"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Password field */}
            {(mode === 'signin' || mode === 'signup' || mode === 'reset') && (
              <div className="auth-modal__field">
                <label htmlFor="password">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </label>
                <div className="auth-modal__input-wrapper">
                  <Lock size={20} className="auth-modal__input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={mode === 'reset' ? 'Enter new password' : 'Enter your password'}
                    required
                    disabled={isLoading}
                    minLength={mode === 'signup' || mode === 'reset' ? 8 : undefined}
                  />
                  <button
                    type="button"
                    className="auth-modal__password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password field */}
            {(mode === 'signup' || mode === 'reset') && (
              <div className="auth-modal__field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="auth-modal__input-wrapper">
                  <Lock size={20} className="auth-modal__input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="auth-modal__password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isLoading}
              className="auth-modal__submit"
            >
              {isLoading ? 'Loading...' : (
                <>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'confirm' && 'Verify Email'}
                  {mode === 'forgot' && 'Send Reset Code'}
                  {mode === 'reset' && 'Reset Password'}
                </>
              )}
            </Button>
          </form>

          {/* Mode switching links */}
          <div className="auth-modal__links">
            {mode === 'signin' && (
              <>
                <button
                  type="button"
                  className="auth-modal__link"
                  onClick={() => setMode('forgot')}
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="auth-modal__link auth-modal__link--primary"
                    onClick={() => setMode('signup')}
                    disabled={isLoading}
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-modal__link auth-modal__link--primary"
                  onClick={() => setMode('signin')}
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'confirm' && (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="auth-modal__link"
                  onClick={handleResendCode}
                  disabled={localLoading}
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  className="auth-modal__link"
                  onClick={() => setMode('signin')}
                  disabled={localLoading}
                >
                  Back to sign in
                </button>
              </div>
            )}

            {(mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                className="auth-modal__link"
                onClick={() => setMode('signin')}
                disabled={isLoading}
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
