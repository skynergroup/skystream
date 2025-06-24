# 🎬 Boredflix - Netflix-Inspired Streaming Website

A modern, responsive streaming website built with React.js that replicates Netflix's design and functionality. Features integrated video players, search functionality, and a clean component architecture optimized for static hosting.

![Boredflix](https://img.shields.io/badge/Boredflix-v2.0.0-red?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.0.0-purple?style=for-the-badge&logo=vite)

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
- **Download Support**: Direct download links via VidSrc
- **Player Settings**: Switch between players and audio options
- **Progress Tracking**: Automatic progress saving for episodes

### 🔍 Content Discovery
- **Search Functionality**: Search across movies, TV shows, and anime
- **Browse Categories**: Dedicated pages for different content types
- **Content Details**: Detailed information pages with trailers
- **My Library**: Watchlist, favorites, and continue watching

### 🚀 Performance & Deployment
- **Static Site Ready**: Optimized for static hosting deployment
- **Code Splitting**: Chunked bundles for faster loading
- **Asset Optimization**: Compressed images and minified code
- **SEO Optimized**: Meta tags and social media integration

## 🛠️ Technology Stack

- **Frontend**: React 18.3.1 with Hooks
- **Build Tool**: Vite 7.0.0
- **Routing**: React Router DOM 6.x
- **Styling**: CSS3 with CSS Variables
- **Icons**: Lucide React
- **Deployment**: GitHub Actions + FTP

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd streaming-site-v2

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Configuration
Edit `.env.local` with your configuration:
```env
# Application
VITE_APP_NAME=Boredflix
VITE_APP_VERSION=2.0.0

# Video Players
VITE_DEFAULT_PLAYER=videasy
VITE_PLAYER_COLOR=e50914
VITE_AUTO_PLAY=true

# Development
VITE_DEV_MODE=true
VITE_ENABLE_CONSOLE_LOGS=true
```

## 🚀 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run clean        # Clean build directory
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
│   └── ...
├── pages/              # Page components
│   ├── Home.jsx        # Homepage
│   ├── Movies.jsx      # Movies browse page
│   ├── TVShows.jsx     # TV shows page
│   ├── Search.jsx      # Search page
│   └── ...
├── utils/              # Utility functions
│   └── config.js       # Environment configuration
└── styles/             # Global styles
```

## 🎬 Video Player Integration

### Supported Players
1. **Videasy** (Recommended)
   - Advanced episode navigation
   - Subtitle/dub options for anime
   - Progress tracking
   - Auto-play next episode

2. **VidSrc**
   - Alternative player option
   - Download functionality
   - Color customization

### Player URLs
- Movies: `https://player.videasy.net/movie/{id}`
- TV Shows: `https://player.videasy.net/tv/{id}/{season}/{episode}`
- Anime: `https://player.videasy.net/anime/{id}/{episode}`

## 🌐 Deployment

### Automatic Deployment (GitHub Actions)
1. Push to `production` branch
2. GitHub Actions builds and deploys via FTP
3. Site goes live automatically

### Manual Deployment
```bash
# Build the project
npm run build

# Upload dist/ folder to your web server
# Files are optimized and ready for static hosting
```

### Server Requirements
- Static file hosting (Apache, Nginx, etc.)
- Support for SPA routing (fallback to index.html)
- HTTPS recommended

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

### Features
- Responsive navigation with mobile menu
- Adaptive grid layouts
- Touch-friendly interactions
- Optimized images for different screen sizes

## 🔧 Configuration

### Player Settings
Configure video players in `src/utils/config.js`:
```javascript
export const PLAYER_CONFIG = {
  defaults: {
    player: 'videasy',
    color: 'e50914',
    autoPlay: true
  }
};
```

### API Integration
Ready for TMDB API integration:
```javascript
export const API_CONFIG = {
  tmdb: {
    apiKey: process.env.VITE_TMDB_API_KEY,
    baseUrl: 'https://api.themoviedb.org/3'
  }
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
  /* ... */
}
```

### Component Styling
Each component has its own CSS file for easy customization.

## 🔒 Security

- Environment variables for sensitive data
- Content Security Policy headers
- XSS protection
- Secure iframe integration

## 📊 Performance

### Bundle Analysis
```bash
npm run build:analyze
```

### Optimization Features
- Code splitting by route and vendor
- Image optimization
- CSS minification
- Gzip compression
- Lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes. Please respect copyright laws and streaming service terms of service.

## 🆘 Support

For issues and questions:
1. Check the [Issues](../../issues) page
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- Netflix for design inspiration
- TMDB for movie/TV data structure
- Videasy and VidSrc for player integration
- React and Vite communities

---

**Made with ❤️ for movie lovers**
