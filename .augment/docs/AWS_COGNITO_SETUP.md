# AWS Cognito Authentication Setup for SkyStream

## 🔐 Overview

SkyStream is now configured with AWS Cognito for secure user authentication on the domain `sky-stream.online`. The setup is optimized to stay within AWS free tier limits.

## 📋 Configuration Details

### User Pool Information
- **User Pool ID**: `us-east-1_ryDGqW5QF`
- **Client ID**: `253ap8mkv34ktblhonapjc5bsh`
- **Region**: `us-east-1`
- **Pool Name**: `skystream-users`

### Domain Configuration
- **Production Domain**: `sky-stream.online`
- **Development Domain**: `localhost:3001`
- **Callback URLs**: 
  - `http://localhost:3000`
  - `http://localhost:3001`
  - `https://sky-stream.online`
  - `https://www.sky-stream.online`
- **Logout URLs**: Same as callback URLs

## 💰 Free Tier Limits

### AWS Cognito Free Tier (Monthly)
- **Monthly Active Users (MAUs)**: 50,000 free
- **User Pool Operations**: 50,000 free
- **Advanced Security Features**: 50,000 MAUs free

### Monitoring Thresholds
- **Warning at**: 40,000 MAUs (80% of limit)
- **Warning at**: 40,000 operations (80% of limit)

## 🚀 Features Implemented

### Authentication Features
- ✅ User registration with email verification
- ✅ User login with SRP authentication
- ✅ Password reset functionality
- ✅ Session management with refresh tokens
- ✅ User profile management
- ✅ Social login ready (Google OAuth configured)

### Free Tier Optimizations
- ✅ SRP authentication (reduces API calls)
- ✅ Optimized token expiration times
- ✅ Local session persistence
- ✅ Proper logout implementation
- ✅ Usage monitoring component

### Security Features
- ✅ Password policy enforcement
- ✅ Email verification required
- ✅ Secure token handling
- ✅ HTTPS-only in production
- ✅ CORS configuration

## 🛠️ Setup Verification

Run the verification script to check your setup:

```bash
./scripts/verify-cognito-setup.sh
```

This script will:
- Verify AWS CLI configuration
- Check User Pool and Client settings
- Validate domain configuration
- Test authentication flow
- Monitor free tier usage

## 📱 Usage in Application

### Environment Variables
```env
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_ryDGqW5QF
VITE_AWS_USER_POOL_CLIENT_ID=253ap8mkv34ktblhonapjc5bsh
VITE_PRODUCTION_DOMAIN=sky-stream.online
VITE_PRODUCTION_URL=https://sky-stream.online
```

### Authentication Context
The `AuthContext` provides:
- `isAuthenticated`: Boolean authentication status
- `user`: Current user object
- `userAttributes`: User profile data
- `login()`: Login function
- `logout()`: Logout function
- `register()`: Registration function

### Example Usage
```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  if (isAuthenticated) {
    return <div>Welcome, {user.email}!</div>;
  }
  
  return <button onClick={login}>Login</button>;
}
```

## 📊 Monitoring

### Free Tier Monitor Component
Access the Free Tier Monitor through the application to track:
- Monthly Active Users
- User Pool Operations
- Estimated costs
- Usage percentages

### AWS Console Monitoring
Monitor usage in:
- AWS Console → Cognito → User Pools → Metrics
- AWS Console → Billing → Free Tier Usage

### CloudWatch Metrics (Optional)
Set up CloudWatch alarms for:
- `MonthlyActiveUsers`
- `UserPoolOperations`
- `SignInSuccesses`
- `SignInThrottles`

## 🔧 Maintenance

### Regular Tasks
1. **Monthly**: Check free tier usage
2. **Quarterly**: Review user pool settings
3. **Annually**: Audit security configurations

### Cost Optimization
- Monitor MAU count regularly
- Implement proper session management
- Use SRP authentication
- Set appropriate token expiration
- Clean up inactive users

### Security Best Practices
- Regular password policy reviews
- Monitor failed login attempts
- Keep AWS SDK updated
- Review user permissions
- Audit authentication logs

## 🚨 Troubleshooting

### Common Issues

#### Authentication Not Working
1. Check environment variables
2. Verify User Pool configuration
3. Check callback URLs
4. Validate CORS settings

#### Free Tier Exceeded
1. Check current usage in AWS Console
2. Review user activity patterns
3. Optimize authentication flow
4. Consider user cleanup policies

#### Domain Issues
1. Verify callback URLs include production domain
2. Check HTTPS configuration
3. Validate DNS settings
4. Test with different browsers

### Support Commands
```bash
# Verify setup
./scripts/verify-cognito-setup.sh

# Check AWS configuration
aws cognito-idp describe-user-pool --user-pool-id us-east-1_ryDGqW5QF

# Check client configuration
aws cognito-idp describe-user-pool-client \
  --user-pool-id us-east-1_ryDGqW5QF \
  --client-id 253ap8mkv34ktblhonapjc5bsh
```

## 📞 Support

For issues with AWS Cognito setup:
1. Check this documentation
2. Run verification script
3. Review AWS Console logs
4. Check application console errors

## 🔄 Updates

### Version History
- **v1.0**: Initial AWS Cognito setup
- **v1.1**: Free tier optimization
- **v1.2**: Domain configuration for sky-stream.online

### Future Enhancements
- [ ] Multi-factor authentication (MFA)
- [ ] Advanced security features
- [ ] User analytics dashboard
- [ ] Automated user cleanup
- [ ] Enhanced monitoring alerts

---

**Last Updated**: August 2025  
**Domain**: sky-stream.online  
**Status**: ✅ Production Ready
