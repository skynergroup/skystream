# 🎬 SkyStream - Netflix-Inspired Streaming Website

A modern, responsive streaming website built with React.js that replicates Netflix's design and functionality. Features integrated video players, TMDB API integration, search functionality, and a clean component architecture optimized for static hosting.

🚀 **Now with comprehensive CI/CD workflows and staging deployment!**

✅ **All workflows optimized for GitHub free tier**

![SkyStream](https://img.shields.io/badge/SkyStream-v2.0.0-red?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.0.0-purple?style=for-the-badge&logo=vite)

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Development](#-development)
- [Video Player Integration](#-video-player-integration)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Configuration](#-configuration)
- [Customization](#-customization)
- [Security](#-security)
- [Performance](#-performance)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Features

### 🎨 Netflix-Inspired Design
- **Dark Theme**: Netflix-style dark interface with red accent colors
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Grid-Based Layouts**: Movie and TV show grids with hover effects
- **Hero Banner**: Featured content section with background images
- **Smooth Animations**: CSS transitions and loading states

### 🎥 Video Player Integration
- **Videasy Player**: Primary player with advanced features
- **VidSrc Player**: Alternative player option
- **GoDrive Player**: Additional player option with IMDB support
- **Download Support**: Direct download links via VidSrc
- **Player Settings**: Switch between players and audio options
- **Progress Tracking**: Automatic progress saving for episodes

### 🔍 Content Discovery
- **TMDB Integration**: Real-time data from The Movie Database
- **Search Functionality**: Search across movies, TV shows, and anime
- **Browse Categories**: Dedicated pages for different content types
- **Content Details**: Detailed information pages with trailers and cast
- **My Library**: Watchlist, favorites, and continue watching
- **Trending Content**: Weekly trending movies and TV shows
- **Popular & Top Rated**: Curated lists of popular and highly-rated content

### 🚀 Performance & Deployment
- **Static Site Ready**: Optimized for static hosting deployment
- **Code Splitting**: Chunked bundles for faster loading
- **Asset Optimization**: Compressed images and minified code
- **SEO Optimized**: Meta tags and social media integration
- **CI/CD Pipeline**: Automated testing, building, and deployment

## 🛠️ Technology Stack

- **Frontend**: React 18.3.1 with Hooks
- **Build Tool**: Vite 7.0.0
- **Routing**: React Router DOM 6.x
- **Styling**: CSS3 with CSS Variables
- **Icons**: Lucide React
- **API**: TMDB (The Movie Database) API
- **Deployment**: GitHub Actions + FTP
- **Testing**: ESLint for code quality

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- TMDB API Key (get from [TMDB](https://www.themoviedb.org/settings/api))

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd streaming-site-v2

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Edit .env.local with your TMDB API key
# VITE_TMDB_API_KEY=your_api_key_here

# Start development server
npm run dev
```

### Environment Configuration
Edit `.env.local` with your configuration:
```env
# Application
VITE_APP_NAME=SkyStream
VITE_APP_VERSION=2.0.0
VITE_APP_DESCRIPTION=Your ultimate destination for streaming movies and TV shows

# API Configuration
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3

# Video Players
VITE_VIDEASY_BASE_URL=https://player.videasy.net
VITE_VIDSRC_BASE_URL=https://v2.vidsrc.me/embed
VITE_VIDSRC_DOWNLOAD_URL=https://dl.vidsrc.me
VITE_DEFAULT_PLAYER=videasy
VITE_PLAYER_COLOR=e50914
VITE_AUTO_PLAY=true

# Image Configuration
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
VITE_DEFAULT_POSTER_SIZE=w500
VITE_DEFAULT_BACKDROP_SIZE=w1280

# Development
VITE_DEV_MODE=true
VITE_ENABLE_CONSOLE_LOGS=true
```

## 🚀 Development

### Available Scripts
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run build:production # Production build with NODE_ENV
npm run build:analyze    # Build with bundle analysis
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run clean            # Clean build directory
```

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Navigation header
│   ├── Footer.jsx      # Site footer
│   ├── HeroBanner.jsx  # Featured content banner
│   ├── ContentCard.jsx # Movie/TV show cards
│   ├── ContentGrid.jsx # Grid layouts
│   ├── VideoPlayer.jsx # Video player component
│   ├── Loading.jsx     # Loading spinner
│   ├── Layout.jsx      # Main layout wrapper
│   └── ...
├── pages/              # Page components
│   ├── Home.jsx        # Homepage with trending content
│   ├── Movies.jsx      # Movies browse page
│   ├── TVShows.jsx     # TV shows page
│   ├── Anime.jsx       # Anime page
│   ├── Search.jsx      # Search page
│   ├── Library.jsx     # User library
│   ├── ContentDetail.jsx # Content details page
│   └── ...
├── services/           # API services
│   └── tmdbApi.js      # TMDB API integration
├── utils/              # Utility functions
│   └── config.js       # Environment configuration
└── styles/             # Global styles
```

## 🎬 Video Player Integration

### Supported Players

#### 1. Videasy Player (Recommended)
- **Features**: Advanced episode navigation, subtitle/dub options, progress tracking
- **Movies**: `https://player.videasy.net/movie/{tmdb_id}`
- **TV Shows**: `https://player.videasy.net/tv/{tmdb_id}/{season}/{episode}`
- **Anime**: `https://player.videasy.net/anime/{anilist_id}/{episode}`

#### 2. VidSrc Player
- **Features**: Alternative player, download functionality, color customization
- **Movies**: `https://v2.vidsrc.me/embed/{imdb_id}`
- **TV Shows**: `https://v2.vidsrc.me/embed/{imdb_id}/{season}-{episode}`

#### 3. GoDrive Player
- **Features**: IMDB integration, series support
- **Movies**: `https://godriveplayer.com/player.php?imdb={imdb_id}`
- **TV Shows**: `https://godriveplayer.com/player.php?type=series&tmdb={tmdb_id}&season={season}&episode={episode}`

### Player Configuration
```javascript
// Configure in src/utils/config.js
export const PLAYER_CONFIG = {
  defaults: {
    player: 'videasy',    // videasy, vidsrc, godrive
    color: 'e50914',      // Player theme color
    autoPlay: true,       // Auto-play videos
    language: 'en'        // Default language
  }
};
```

### Progress Tracking
The application supports real-time progress tracking:

```javascript
// Progress data structure
{
  "id": "299534",           // Content ID
  "type": "movie",          // Content type: movie/tv/anime
  "progress": 45.2,         // Watch progress percentage
  "timestamp": 2710,        // Current position in seconds
  "duration": 6000,         // Total duration in seconds
  "season": 1,              // Season number (TV shows only)
  "episode": 5              // Episode number (TV/Anime only)
}
```

## 📡 API Documentation

### TMDB API Integration

The application integrates with The Movie Database (TMDB) API for content data:

#### Available Endpoints
- **Trending Content**: `/trending/{media_type}/{time_window}`
- **Popular Movies**: `/movie/popular`
- **Popular TV Shows**: `/tv/popular`
- **Top Rated Movies**: `/movie/top_rated`
- **Search**: `/search/multi`
- **Movie Details**: `/movie/{movie_id}`
- **TV Show Details**: `/tv/{tv_id}`

#### Usage Example
```javascript
import tmdbApi from './services/tmdbApi';

// Get trending content
const trending = await tmdbApi.getTrending('all', 'week');

// Search for content
const results = await tmdbApi.search('Avengers');

// Get movie details
const movie = await tmdbApi.getMovieDetails(299534);
```

### Content Statistics
- **Movies**: 84,696+ titles
- **TV Series**: 18,404+ shows  
- **Episodes**: 446,100+ episodes
- **Quality**: 80% of content available in 1080p
- **Updates**: Automatically updated with new releases

### Finding Content IDs

#### TMDB IDs (Movies & TV Shows)
1. Visit [themoviedb.org](https://themoviedb.org)
2. Search for content
3. Extract ID from URL: `themoviedb.org/movie/299534` → ID: `299534`

#### AniList IDs (Anime)
1. Visit [anilist.co](https://anilist.co)
2. Search for anime
3. Extract ID from URL: `anilist.co/anime/21` → ID: `21`

## 🌐 Deployment

### Automatic Deployment (GitHub Actions)

The project includes comprehensive CI/CD workflows:

#### Production Deployment
1. **Trigger**: Push to `production` branch
2. **Process**: 
   - Installs Node.js 18
   - Installs dependencies with `npm ci`
   - Builds project with `npm run build`
   - Deploys via FTP to production server
3. **Environment**: Uses production environment with secrets

#### Staging Deployment
1. **Trigger**: Push to `staging` branch
2. **Process**: Similar to production but deploys to staging environment

#### Required GitHub Secrets
Set these in `Settings > Secrets and variables > Actions`:
- `FTP_USERNAME`: Your FTP username
- `FTP_PASSWORD`: Your FTP password

### Manual Deployment
```bash
# Build the project
npm run build:production

# Upload dist/ folder contents to your web server
# Files are optimized and ready for static hosting
```

### Server Configuration

#### Apache (.htaccess)
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css
    AddOutputFilterByType DEFLATE application/xml application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
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

### Server Requirements
- Static file hosting (Apache, Nginx, etc.)
- Support for SPA routing (fallback to index.html)
- HTTPS recommended
- Proper MIME types for all file extensions

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

### Features
- Responsive navigation with mobile menu
- Adaptive grid layouts (1-6 columns based on screen size)
- Touch-friendly interactions
- Optimized images for different screen sizes
- Mobile-first CSS approach

## 🔧 Configuration

### Player Settings
Configure video players in `src/utils/config.js`:
```javascript
export const PLAYER_CONFIG = {
  videasy: {
    baseUrl: 'https://player.videasy.net',
  },
  vidsrc: {
    baseUrl: 'https://v2.vidsrc.me/embed',
    downloadUrl: 'https://dl.vidsrc.me',
  },
  godrive: {
    baseUrl: 'https://godriveplayer.com/player.php',
  },
  defaults: {
    player: 'videasy',
    color: 'e50914',
    autoPlay: true,
    language: 'en',
  },
};
```

### API Configuration
```javascript
export const API_CONFIG = {
  tmdb: {
    apiKey: getEnvVar('VITE_TMDB_API_KEY'),
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p',
    defaultPosterSize: 'w500',
    defaultBackdropSize: 'w1280',
  },
};
```

### Analytics Configuration
```javascript
export const ANALYTICS_CONFIG = {
  enabled: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
  trackingId: getEnvVar('VITE_GA_TRACKING_ID'),
};
```

## 🎨 Customization

### Theme Colors
Update CSS variables in `src/index.css`:
```css
:root {
  --netflix-red: #e50914;
  --netflix-black: #141414;
  --netflix-dark-gray: #181818;
  --netflix-light-gray: #333333;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-muted: #808080;
}
```

### Component Styling
Each component has its own CSS file for easy customization:
- `Header.css` - Navigation styling
- `HeroBanner.css` - Hero section styling
- `ContentCard.css` - Movie/TV card styling
- `ContentGrid.css` - Grid layout styling
- `VideoPlayer.css` - Player styling

### Player Customization
```javascript
// Custom player colors
const playerOptions = {
  color: '8B5CF6',        // Purple theme
  autoplay: 'true',       // Enable autoplay
  language: 'en',         // English language
  nextEpisode: 'true',    // Show next episode button
  episodeSelector: 'true' // Enable episode selector
};
```

## 🔒 Security

### Environment Variables
- All sensitive data stored in environment variables
- `.env.local` ignored by git
- Production secrets managed through GitHub Actions

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="frame-src 'self' https://player.videasy.net https://v2.vidsrc.me https://godriveplayer.com;">
```

### Iframe Security
```html
<iframe 
  src="https://player.videasy.net/movie/299534"
  sandbox="allow-scripts allow-same-origin allow-presentation"
  allowfullscreen>
</iframe>
```

### Best Practices
- XSS protection through React's built-in sanitization
- Secure iframe integration with sandbox attributes
- HTTPS enforcement in production
- Input validation for search queries

## 📊 Performance

### Bundle Optimization
- **Code Splitting**: Separate chunks for vendor, router, and icons
- **Asset Organization**: Organized into css/, js/, images/, fonts/ folders
- **Minification**: Terser minification for JavaScript
- **CSS Optimization**: Separate CSS chunks
- **Compression**: Gzip compression reporting

### Bundle Analysis
```bash
npm run build:analyze
```

### Optimization Features
- Lazy loading for images and components
- Image optimization with proper sizing
- CSS minification and purging
- Tree shaking for unused code
- Service worker for caching (optional)

### Performance Monitoring
Monitor these metrics:
- **Page Load Times**: Use PageSpeed Insights
- **Bundle Size**: Keep JavaScript bundles under 1MB
- **Core Web Vitals**: Monitor LCP, FID, and CLS
- **API Response Times**: TMDB API performance

## 🔧 Troubleshooting

### Common Issues

#### TMDB API 401 Errors
**Symptoms**: API requests failing with 401 Unauthorized
**Solutions**:
1. Verify TMDB API key is set in `.env.local`
2. Restart development server after adding API key
3. Check API key is valid on TMDB website

#### Player Not Loading
**Symptoms**: Blank iframe or loading indefinitely
**Solutions**:
1. Check if content ID is correct (TMDB/IMDB/AniList)
2. Verify URL structure matches API specification
3. Check browser console for CSP violations
4. Ensure domain is not blocked by ad blockers

#### Build Failures
**Symptoms**: npm run build fails
**Solutions**:
1. Check Node.js version (requires 18+)
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check for TypeScript/ESLint errors
4. Verify all environment variables are set

#### Routing Issues
**Symptoms**: 404 errors on page refresh
**Solutions**:
1. Ensure server redirects to index.html for SPA routing
2. Check .htaccess configuration for Apache
3. Verify base path configuration in Vite

### Debug Mode
Enable debug logging:
```env
VITE_DEV_MODE=true
VITE_ENABLE_CONSOLE_LOGS=true
```

### Error Codes
| Code | Description | Solution |
|------|-------------|----------|
| 401 | TMDB API Unauthorized | Check API key configuration |
| 404 | Content not found | Verify content ID is correct |
| 403 | Access denied | Check if domain is whitelisted |
| 500 | Server error | Try again later or contact support |

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly: `npm run lint && npm run build`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit a pull request

### Code Standards
- Follow ESLint configuration
- Use meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Test on multiple devices/browsers

### Pull Request Guidelines
- Describe changes clearly
- Include screenshots for UI changes
- Test all functionality
- Update README if needed
- Ensure CI/CD passes

## 📄 License

This project is for educational purposes. Please respect copyright laws and streaming service terms of service.

## 🆘 Support

### Getting Help
1. Check the [Issues](../../issues) page for existing solutions
2. Search documentation for common problems
3. Create a new issue with detailed information:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)

### Community
- GitHub Discussions for general questions
- Issues for bug reports and feature requests
- Pull requests for contributions

## 🙏 Acknowledgments

- **Netflix** for design inspiration
- **TMDB** for comprehensive movie/TV database
- **Videasy** and **VidSrc** for player integration
- **React** and **Vite** communities for excellent tools
- **Open Source** contributors and maintainers

## 📈 Roadmap

### Upcoming Features
- [ ] User authentication and profiles
- [ ] Advanced search filters
- [ ] Recommendation engine
- [ ] Offline viewing support
- [ ] Mobile app development
- [ ] Multi-language support

### Recent Updates
- ✅ TMDB API integration
- ✅ Comprehensive CI/CD pipeline
- ✅ Multiple video player support
- ✅ Progress tracking system
- ✅ Responsive design improvements

---

**Made with ❤️ for movie lovers**

*Last updated: January 2025*
*Documentation version: 2.0*
