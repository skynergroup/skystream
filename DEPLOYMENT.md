# Boredflix Deployment Guide

This document outlines the deployment process for the Boredflix streaming website.

## Deployment Overview

The site is configured for static hosting deployment via FTP using GitHub Actions. The deployment automatically triggers when code is pushed to the `production` branch.

## Deployment Configuration

### GitHub Actions Workflow

The deployment is handled by `.github/workflows/deploy.yml` which:

1. **Triggers**: On push to `production` branch
2. **Environment**: Uses `production` environment with secrets
3. **Build Process**: 
   - Installs Node.js 18
   - Installs dependencies with `npm ci`
   - Builds the project with `npm run build`
4. **Deployment**: Uses FTP-Deploy-Action to upload to server

### Required GitHub Secrets

Set these secrets in your GitHub repository settings under `Settings > Secrets and variables > Actions`:

- `FTP_USERNAME`: Your FTP username
- `FTP_PASSWORD`: Your FTP password

### FTP Configuration

Current configuration in the workflow:
- **Server**: `ftp.skyner.co.za`
- **Local Directory**: `./dist/`
- **Server Directory**: `/bumblebeefoundation.co.za/`
- **Clean Slate**: `true` (removes old files)

## Build Optimization

### Static Site Features

1. **Client-Side Routing**: Configured for React Router with static hosting
2. **404 Handling**: Custom 404.html redirects to main app
3. **SPA Redirect**: JavaScript handles deep linking
4. **Asset Optimization**: Chunked bundles and optimized file names

### Build Scripts

- `npm run build`: Standard production build
- `npm run build:production`: Production build with NODE_ENV
- `npm run build:analyze`: Build with analysis mode
- `npm run preview`: Preview built site locally
- `npm run clean`: Clean dist directory

### Bundle Optimization

The build process includes:
- **Code Splitting**: Separate chunks for vendor, router, and icons
- **Asset Organization**: Organized into css/, js/, images/, fonts/ folders
- **Minification**: Terser minification for JavaScript
- **CSS Optimization**: Separate CSS chunks
- **Compression**: Gzip compression reporting

## Deployment Process

### Automatic Deployment

1. **Develop**: Work on `main` or feature branches
2. **Test**: Ensure all features work locally with `npm run preview`
3. **Merge**: Merge changes to `production` branch
4. **Deploy**: GitHub Actions automatically builds and deploys

### Manual Deployment

If needed, you can deploy manually:

```bash
# Build the project
npm run build:production

# Upload dist/ folder contents to your FTP server
# Use your preferred FTP client or command line tools
```

## Environment Configuration

### Environment Variables

The project uses environment variables for configuration:

- Copy `.env.example` to `.env.local`
- Configure API keys and settings as needed
- Environment variables are prefixed with `VITE_`

### Static Hosting Considerations

1. **Base Path**: Set to `./` for relative paths
2. **Routing**: Uses hash-based routing fallback for static hosts
3. **Assets**: All assets are bundled and optimized
4. **Caching**: Proper cache headers should be set on the server

## Server Configuration

### Recommended Server Settings

1. **MIME Types**: Ensure proper MIME types for all file extensions
2. **Compression**: Enable gzip/brotli compression
3. **Caching**: Set appropriate cache headers for static assets
4. **HTTPS**: Enable SSL/TLS for security
5. **Redirects**: Configure fallback to index.html for SPA routing

### .htaccess Example (Apache)

```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# SPA routing fallback
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version and dependencies
2. **FTP Errors**: Verify credentials and server paths
3. **Routing Issues**: Ensure server redirects to index.html
4. **Asset Loading**: Check base path configuration

### Debug Steps

1. **Local Testing**: Always test with `npm run preview` before deploying
2. **Build Analysis**: Use `npm run build:analyze` to check bundle size
3. **Console Logs**: Check browser console for errors
4. **Network Tab**: Verify all assets load correctly

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to repository
2. **FTP Credentials**: Store securely in GitHub Secrets
3. **HTTPS**: Always use HTTPS in production
4. **Content Security Policy**: Consider implementing CSP headers

## Performance Monitoring

After deployment, monitor:
- **Page Load Times**: Use tools like PageSpeed Insights
- **Bundle Size**: Keep JavaScript bundles under 1MB
- **Core Web Vitals**: Monitor LCP, FID, and CLS metrics
- **Error Tracking**: Implement error monitoring if needed

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Verify FTP server connectivity
3. Test build process locally
4. Contact server administrator if needed
