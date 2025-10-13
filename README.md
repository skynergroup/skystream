# SkyStream

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TMDB API](https://img.shields.io/badge/TMDB_API-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

A modern, responsive streaming platform interface built with React.js that provides a feature-rich user experience for browsing and viewing movies, TV shows, and anime content. The application leverages The Movie Database (TMDB) API for comprehensive content metadata and integrates with multiple third-party streaming services.

**Live Demo:** [https://www.sky-stream.online/](https://www.sky-stream.online/)

## Overview

SkyStream is a content discovery and streaming aggregator that serves as a centralized platform for searching and accessing entertainment content. The application features a Netflix-inspired user interface with advanced search capabilities, real-time content discovery, and seamless integration with multiple video streaming platforms.

### Disclaimer

SkyStream is a viewing platform interface only. The application does not host, store, or distribute any movies, TV shows, or other media content. All content is sourced from third-party services and streamed directly to users. SkyStream acts solely as an interface to browse and access content in a user-friendly manner.

## Key Features

### Content Discovery
- **Discover Page** (`/home`) - Curated content sections with featured hero carousel
  - Featured content with auto-rotating carousel
  - Trending movies and TV shows
  - Popular movies and TV shows sections
  - Top-rated content
  - Popular anime section
  - Horizontal scrolling content rows
- **Search Page** (`/`) - Real-time search across movies, TV shows, and anime
  - Instant search results
  - Grid-based result display
  - Comprehensive content metadata including ratings, release dates, and descriptions

### User Interface
- Netflix-inspired dark theme with light mode support
- Fully responsive design optimized for desktop, tablet, and mobile devices
- Smooth animations and transitions
- Intuitive navigation between Discover and Search pages
- Persistent header with navigation links

### Streaming Integration
- Multiple streaming service integrations (Vidsrc, Videasy)
- Season and episode selection for TV content
- Embedded video player with quality controls
- Automatic episode progression for series

### Technical Features
- Server-side rendering optimization
- Code splitting and lazy loading for improved performance
- Comprehensive analytics and user behavior tracking
- Error handling with user-friendly fallbacks
- SEO optimization for content discovery

## Technology Stack

### Frontend Framework
- **React 19.1.0** - Modern React with hooks and functional components
- **React Router DOM 7.6.2** - Client-side routing
- **Vite 7.0.0** - Next-generation frontend build tool

### Styling & UI
- **CSS3** with CSS Variables for dynamic theming
- **Lucide React** - Modern icon library
- **Custom responsive design system** with mobile-first approach

### APIs & External Services
- **The Movie Database (TMDB) API** - Content metadata, search, and images
- **Vidsrc** - Primary streaming service integration
- **Videasy** - Alternative streaming service integration
- **Google Analytics** - User behavior and engagement tracking
- **Vercel Analytics** - Performance monitoring and insights

### Development Tools
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Terser** - Production code minification
- **LocatorJS** - Development debugging tool

## Architecture

### Project Structure
```
skystream/
├── public/              # Static assets and configuration
│   ├── _redirects      # Vercel SPA routing configuration
│   └── favicon.ico     # Application favicon
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ContentRow.jsx          # Horizontal scrolling content row
│   │   ├── FeaturedHero.jsx        # Hero banner with carousel
│   │   ├── Layout.jsx              # Shared layout wrapper
│   │   ├── Loading.jsx
│   │   ├── MaintenanceBanner.jsx
│   │   ├── StreamingPlayerModal.jsx
│   │   ├── StreamingResultCard.jsx
│   │   ├── StreamingSearchBar.jsx
│   │   └── ThemeToggle.jsx
│   ├── pages/          # Page-level components
│   │   ├── Discover.jsx            # Content discovery page (/home)
│   │   └── Search.jsx              # Search page (/)
│   ├── services/       # API service layers
│   │   ├── tmdbApi.js
│   │   └── streamingServices.js
│   ├── utils/          # Utility functions and configuration
│   │   ├── analytics.js
│   │   ├── config.js
│   │   └── useTheme.js
│   ├── styles/         # Global styles
│   │   └── responsive.css
│   ├── App.jsx         # Root application component with routing
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles and theme variables
├── package.json        # Project dependencies and scripts
├── vite.config.js      # Vite configuration
└── README.md
```

### Design Patterns
- **Component-based architecture** with React functional components
- **Service layer pattern** for API interactions and business logic
- **Utility-first approach** with centralized configuration management
- **Single Page Application (SPA)** with client-side routing via React Router
- **Layout pattern** with shared header/footer wrapper component

### Routing Structure

| Route | Page | Description |
|-------|------|-------------|
| `/` | Search | Search-focused interface for finding specific content |
| `/home` | Discover | Content discovery with featured carousel and curated sections |
| `*` | Redirect | Catch-all route redirects to search page |

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- TMDB API Key (obtain from [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/skynergroup/skystream.git
cd skystream
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Add your TMDB API key to the `.env` file:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:staging` - Build for staging environment
- `npm run build:production` - Build for production environment
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Deployment

The application is deployed on Vercel and optimized for static hosting platforms.

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Configure environment variables in the Vercel dashboard:
   - `VITE_TMDB_API_KEY`
   - `VITE_GA_TRACKING_ID` (optional)

### Build Optimization

The production build includes:
- Code splitting with vendor, router, and icon chunks
- Asset optimization with hashed filenames
- Minification with Terser
- CSS code splitting
- Optimized bundle size with tree shaking

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_TMDB_API_KEY` | TMDB API key for content data | Yes | - |
| `VITE_TMDB_BASE_URL` | TMDB API base URL | No | `https://api.themoviedb.org/3` |
| `VITE_TMDB_IMAGE_BASE_URL` | TMDB image CDN URL | No | `https://image.tmdb.org/t/p` |
| `VITE_GA_TRACKING_ID` | Google Analytics tracking ID | No | - |
| `VITE_ENABLE_ANALYTICS` | Enable/disable analytics | No | `true` |
| `VITE_DEFAULT_PLAYER` | Default video player | No | `videasy` |

## Performance

### Optimization Techniques
- Lazy loading of images with loading states
- Code splitting for reduced initial bundle size
- Optimized asset delivery with CDN
- Responsive images with multiple size options
- Debounced search input for reduced API calls
- Memoized components to prevent unnecessary re-renders

### Analytics & Monitoring
- Google Analytics for user behavior tracking
- Vercel Analytics for performance insights
- Custom event tracking for content interactions
- Error tracking and reporting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Commit Message Convention

Follow the conventional commits specification:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or modifications
- `chore:` - Build process or auxiliary tool changes

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing comprehensive movie and TV show data
- [Vidsrc](https://vidsrc.xyz/) and [Videasy](https://videasy.net/) for streaming service integration
- [Vercel](https://vercel.com/) for hosting and deployment infrastructure

## Contact

For questions, issues, or suggestions, please open an issue on GitHub or contact the development team.

---

**Note:** This project is for educational and demonstration purposes. Please ensure compliance with all applicable laws and terms of service when using third-party APIs and streaming services.
