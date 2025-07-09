import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';

// AWS Cognito Configuration
const poolData = {
  UserPoolId: import.meta.env.VITE_AWS_USER_POOL_ID || 'us-east-1_PLACEHOLDER',
  ClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID',
};

const userPool = new CognitoUserPool(poolData);

// Google OAuth Configuration
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'PLACEHOLDER_GOOGLE_CLIENT_ID';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userAttributes = {};
    this.authListeners = [];
    this.isConfigured = this.checkConfiguration();
  }

  // Check if AWS Cognito is properly configured
  checkConfiguration() {
    const hasUserPoolId = import.meta.env.VITE_AWS_USER_POOL_ID &&
                         import.meta.env.VITE_AWS_USER_POOL_ID !== 'us-east-1_PLACEHOLDER';
    const hasClientId = import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID &&
                       import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID !== 'PLACEHOLDER_CLIENT_ID';

    if (!hasUserPoolId || !hasClientId) {
      console.warn('🔧 AWS Cognito not configured. Run ./scripts/setup-aws.sh to set up authentication.');
      return false;
    }

    return true;
  }

  // Event listener management
  addAuthListener(callback) {
    this.authListeners.push(callback);
  }

  removeAuthListener(callback) {
    this.authListeners = this.authListeners.filter(listener => listener !== callback);
  }

  notifyAuthListeners() {
    this.authListeners.forEach(callback => callback({
      isAuthenticated: this.isAuthenticated,
      user: this.currentUser,
      attributes: this.userAttributes
    }));
  }

  // Get current session
  async getCurrentSession() {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.userAttributes = {};
        resolve(null);
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          this.isAuthenticated = false;
          this.currentUser = null;
          this.userAttributes = {};
          reject(err);
          return;
        }

        if (session.isValid()) {
          this.isAuthenticated = true;
          this.currentUser = cognitoUser;
          this.getUserAttributes(cognitoUser).then(attributes => {
            this.userAttributes = attributes;
            this.notifyAuthListeners();
            resolve(session);
          });
        } else {
          this.isAuthenticated = false;
          this.currentUser = null;
          this.userAttributes = {};
          resolve(null);
        }
      });
    });
  }

  // Get user attributes
  async getUserAttributes(cognitoUser = this.currentUser) {
    return new Promise((resolve, reject) => {
      if (!cognitoUser) {
        resolve({});
        return;
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }

        const attributeMap = {};
        attributes.forEach(attribute => {
          attributeMap[attribute.Name] = attribute.Value;
        });

        resolve(attributeMap);
      });
    });
  }

  // Sign up new user
  async signUp(email, password, additionalAttributes = {}) {
    if (!this.isConfigured) {
      return Promise.reject(new Error('AWS Cognito not configured. Please run ./scripts/setup-aws.sh'));
    }

    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
      ];

      // Add additional attributes
      Object.keys(additionalAttributes).forEach(key => {
        attributeList.push(new CognitoUserAttribute({
          Name: key,
          Value: additionalAttributes[key],
        }));
      });

      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          user: result.user,
          userConfirmed: result.userConfirmed,
          userSub: result.userSub,
        });
      });
    });
  }

  // Confirm sign up with verification code
  async confirmSignUp(email, verificationCode) {
    if (!this.isConfigured) {
      return Promise.reject(new Error('AWS Cognito not configured. Please run ./scripts/setup-aws.sh'));
    }

    try {
      // Use AWS SDK to confirm the user directly
      const client = new CognitoIdentityProviderClient({
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      });

      const command = new AdminCreateUserCommand({
        UserPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
        Username: email,
        MessageAction: 'SUPPRESS', // Don't send welcome message
        TemporaryPassword: 'TempPass123!', // This will be ignored since we're confirming
      });

      // Actually, let's use the client-side confirmation but with better error handling
      return new Promise((resolve, reject) => {
        const cognitoUser = new CognitoUser({
          Username: email,
          Pool: userPool,
        });

        cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
          if (err) {
            console.error('Confirmation error details:', {
              code: err.code,
              message: err.message,
              name: err.name
            });

            // Provide more specific error messages
            if (err.code === 'CodeMismatchException') {
              reject(new Error('Invalid verification code. Please check the code and try again.'));
            } else if (err.code === 'ExpiredCodeException') {
              reject(new Error('Verification code has expired. Please request a new code.'));
            } else if (err.code === 'LimitExceededException') {
              reject(new Error('Too many attempts. Please wait before trying again.'));
            } else {
              reject(new Error(err.message || 'Failed to confirm account. Please try again.'));
            }
            return;
          }

          resolve(result);
        });
      });
    } catch (error) {
      throw new Error(`Confirmation failed: ${error.message}`);
    }
  }

  // Resend confirmation code
  async resendConfirmationCode(email) {
    if (!this.isConfigured) {
      return Promise.reject(new Error('AWS Cognito not configured. Please run ./scripts/setup-aws.sh'));
    }

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          console.error('Resend confirmation error:', err);

          if (err.code === 'LimitExceededException') {
            reject(new Error('Too many requests. Please wait before requesting another code.'));
          } else if (err.code === 'InvalidParameterException') {
            reject(new Error('User is already confirmed or does not exist.'));
          } else {
            reject(new Error(err.message || 'Failed to resend confirmation code.'));
          }
          return;
        }

        resolve(result);
      });
    });
  }

  // Sign in user
  async signIn(email, password) {
    if (!this.isConfigured) {
      return Promise.reject(new Error('AWS Cognito not configured. Please run ./scripts/setup-aws.sh'));
    }

    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (session) => {
          this.isAuthenticated = true;
          this.currentUser = cognitoUser;
          this.userAttributes = await this.getUserAttributes(cognitoUser);
          this.notifyAuthListeners();
          resolve({
            session,
            user: cognitoUser,
            attributes: this.userAttributes,
          });
        },
        onFailure: (err) => {
          this.isAuthenticated = false;
          this.currentUser = null;
          this.userAttributes = {};

          // Enhanced error handling for common scenarios
          if (err.code === 'UserNotConfirmedException') {
            reject({
              ...err,
              message: 'Please check your email and confirm your account with the verification code.',
              needsConfirmation: true,
              email: email
            });
          } else if (err.code === 'NotAuthorizedException') {
            reject({
              ...err,
              message: 'Incorrect email or password. Please try again.'
            });
          } else if (err.code === 'UserNotFoundException') {
            reject({
              ...err,
              message: 'No account found with this email. Please sign up first.'
            });
          } else {
            reject(err);
          }
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required scenario
          reject({
            name: 'NewPasswordRequired',
            userAttributes,
            requiredAttributes,
            cognitoUser,
          });
        },
      });
    });
  }

  // Sign out user
  async signOut() {
    return new Promise((resolve) => {
      if (this.currentUser) {
        this.currentUser.signOut();
      }

      // Clear Google sign-in if available
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }

      this.isAuthenticated = false;
      this.currentUser = null;
      this.userAttributes = {};
      this.notifyAuthListeners();
      resolve();
    });
  }

  // Forgot password
  async forgotPassword(email) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  // Confirm forgot password
  async confirmPassword(email, verificationCode, newPassword) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: () => {
          resolve('Password confirmed successfully');
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  // Initialize Google Sign-In
  initializeGoogleSignIn() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Sign-In can only be initialized in browser environment'));
        return;
      }

      // Load Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: this.handleGoogleSignIn.bind(this),
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };

      document.head.appendChild(script);
    });
  }

  // Handle Google Sign-In response
  async handleGoogleSignIn(response) {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Here you would typically exchange the Google token for Cognito credentials
      // For now, we'll create a mock user session
      console.log('Google Sign-In successful:', payload);
      
      // In a real implementation, you would:
      // 1. Send the Google token to your backend
      // 2. Verify the token with Google
      // 3. Create or link a Cognito user
      // 4. Return Cognito credentials
      
      this.isAuthenticated = true;
      this.userAttributes = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
        provider: 'google',
      };
      this.notifyAuthListeners();
      
      return {
        success: true,
        user: payload,
        provider: 'google',
      };
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  }

  // Render Google Sign-In button
  renderGoogleSignInButton(elementId, options = {}) {
    if (!window.google || !window.google.accounts) {
      console.error('Google Identity Services not loaded');
      return;
    }

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: options.theme || 'outline',
        size: options.size || 'large',
        type: options.type || 'standard',
        shape: options.shape || 'rectangular',
        logo_alignment: options.logo_alignment || 'left',
        width: options.width || 250,
        ...options,
      }
    );
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user attributes
  getCurrentUserAttributes() {
    return this.userAttributes;
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
