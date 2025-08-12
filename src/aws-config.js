// AWS Amplify Configuration for SkyStream
import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    // Amazon Cognito Region
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    
    // Amazon Cognito User Pool ID
    userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID || 'us-east-1_ryDGqW5QF',
    
    // Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID || '253ap8mkv34ktblhonapjc5bsh',
    
    // Hosted UI configuration
    oauth: {
      domain: `skystream-auth-${import.meta.env.VITE_AWS_REGION || 'us-east-1'}.auth.${import.meta.env.VITE_AWS_REGION || 'us-east-1'}.amazoncognito.com`,
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: import.meta.env.DEV 
        ? 'http://localhost:3001/' 
        : 'https://sky-stream.online/',
      redirectSignOut: import.meta.env.DEV 
        ? 'http://localhost:3001/' 
        : 'https://sky-stream.online/',
      responseType: 'code',
    },
    
    // Authentication flow type
    authenticationFlowType: 'USER_SRP_AUTH',
    
    // Password policy
    passwordPolicy: {
      minimumLength: 8,
      requireLowercase: true,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false,
    },
  },
  
  // API Configuration (if needed for future features)
  API: {
    endpoints: [
      {
        name: 'skystream-api',
        endpoint: import.meta.env.VITE_API_ENDPOINT || 'https://api.sky-stream.online',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      },
    ],
  },
  
  // Storage Configuration (if needed for user uploads)
  Storage: {
    AWSS3: {
      bucket: import.meta.env.VITE_S3_BUCKET || 'skystream-user-content',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    },
  },
};

// Configure Amplify
Amplify.configure(awsConfig);

export default awsConfig;

// Free Tier Monitoring Configuration
export const freetierLimits = {
  // AWS Cognito Free Tier Limits
  monthlyActiveUsers: 50000, // 50,000 MAUs free per month
  userPoolOperations: 50000, // 50,000 operations free per month
  
  // Monitoring thresholds (80% of free tier)
  warningThresholds: {
    monthlyActiveUsers: 40000,
    userPoolOperations: 40000,
  },
  
  // Cost optimization settings
  tokenValidityPeriods: {
    accessToken: 60, // 1 hour (minimize token refresh calls)
    idToken: 60, // 1 hour
    refreshToken: 43200, // 30 days (maximum allowed)
  },
};

// Development vs Production configuration
export const getEnvironmentConfig = () => {
  const isDev = import.meta.env.DEV;
  
  return {
    environment: isDev ? 'development' : 'production',
    domain: isDev ? 'localhost:3001' : 'sky-stream.online',
    apiEndpoint: isDev 
      ? 'http://localhost:3001/api' 
      : 'https://api.sky-stream.online',
    enableLogging: isDev,
    enableAnalytics: !isDev,
  };
};

// Cognito User Pool monitoring helper
export const getCognitoUsage = async () => {
  try {
    // This would typically be called from a backend service
    // to monitor usage and stay within free tier limits
    return {
      monthlyActiveUsers: 0,
      userPoolOperations: 0,
      estimatedCost: 0,
      freetierRemaining: {
        users: freeierLimits.monthlyActiveUsers,
        operations: freeierLimits.userPoolOperations,
      },
    };
  } catch (error) {
    console.error('Error fetching Cognito usage:', error);
    return null;
  }
};
