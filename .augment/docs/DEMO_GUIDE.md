# SkyStream Demo Guide

## 🚀 Quick Start Demo

### 1. Launch the Application
```bash
cd skystream
npm run dev
```
Open http://localhost:3000 in your browser.

### 2. Test the Search Feature
1. **Type in the search bar**: Try searching for popular content like:
   - "avengers"
   - "game of thrones"
   - "naruto"
   - "breaking bad"

2. **Watch auto-search in action**: Results appear as you type with a 300ms delay

3. **Browse results**: Each result shows:
   - Movie poster or placeholder
   - Title and release year
   - Rating and content type
   - Two streaming buttons (Vidsrc & Videasy)

### 3. Test Streaming
1. **Click a streaming button**: Choose either "Vidsrc" or "Videasy"
2. **Modal player opens**: Full-screen streaming experience
3. **Player controls**: 
   - Close button (X)
   - Open in new tab button
   - Full iframe embed

### 4. Test Maintenance Banner
- The yellow maintenance banner appears at the top
- Click the X to dismiss it
- It's configurable for different message types

## 🧪 Developer Testing

### Browser Console Testing
Open browser console and run:
```javascript
// Test search functionality
window.streamingTest.testSearch('avengers')

// Test URL generation
window.streamingTest.testMovieUrls()
window.streamingTest.testTVUrls()

// Run full test suite
window.streamingTest.runFullTest()
```

### Manual URL Testing
Test streaming URLs directly:

**Vidsrc Movie Example:**
```
https://vidsrc.xyz/embed/movie?tmdb=299534&autoplay=1
```

**Videasy Movie Example:**
```
https://player.videasy.net/movie/299534?color=8B5CF6&overlay=true
```

**Vidsrc TV Show Example:**
```
https://vidsrc.xyz/embed/tv?tmdb=1399&season=1&episode=1&autoplay=1&autonext=0
```

**Videasy TV Show Example:**
```
https://player.videasy.net/tv/1399/1/1?nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true&overlay=true&color=8B5CF6
```

## 📱 Responsive Testing

### Desktop (1200px+)
- Full grid layout with 5-6 cards per row
- Large search bar and hero section
- Modal player at optimal size

### Tablet (768px - 1199px)
- 3-4 cards per row
- Adjusted spacing and typography
- Touch-friendly buttons

### Mobile (< 768px)
- 2-3 cards per row
- Compact search bar
- Mobile-optimized modal
- Touch-friendly interface

## 🎯 Key Features to Demo

### 1. Auto-Search
- **Real-time results**: No need to press Enter
- **Debounced requests**: Efficient API usage
- **Smart filtering**: Only movies, TV shows, and anime

### 2. Dual Streaming Platforms
- **Vidsrc**: Red buttons, basic streaming
- **Videasy**: Purple buttons, advanced features
- **Platform comparison**: Different player features

### 3. User Experience
- **Loading states**: Smooth animations
- **Error handling**: Graceful failure states
- **Accessibility**: Keyboard navigation
- **Performance**: Fast search and rendering

### 4. Content Information
- **TMDB Integration**: Rich metadata
- **Visual design**: Netflix-inspired interface
- **Content types**: Movies, TV shows, anime support

## 🔧 Customization Demo

### Change Maintenance Message
Edit `src/pages/Home.jsx`:
```jsx
<MaintenanceBanner 
  message="Custom maintenance message here"
  type="info" // warning, info, error
  dismissible={false} // Make it persistent
/>
```

### Modify Search Debounce
Edit `src/components/StreamingSearchBar.jsx`:
```jsx
<StreamingSearchBar
  debounceMs={500} // Increase delay
  autoFocus={false} // Disable auto-focus
/>
```

### Customize Player Colors
The Videasy player uses purple by default. To change:
```javascript
// In streamingServices.js
getVideasyMovieUrl(tmdbId, { color: 'FF0000' }) // Red theme
```

## 🐛 Troubleshooting

### Common Issues

1. **Search not working**
   - Check TMDB API key in environment variables
   - Verify network connectivity
   - Check browser console for errors

2. **Streaming not loading**
   - Third-party streaming services may have downtime
   - Try different content or platform
   - Check if content exists on the platform

3. **Responsive issues**
   - Test in different browser sizes
   - Check CSS media queries
   - Verify touch interactions on mobile

### Debug Commands
```bash
# Check for linting issues
npm run lint

# Check for build issues
npm run build

# Run in production mode
npm run preview
```

## 📊 Analytics

The application tracks:
- Search queries and results
- Content play events
- Platform usage (Vidsrc vs Videasy)
- Error events

Check browser console for analytics events during testing.

## 🎬 Content Recommendations for Demo

### Popular Movies (Good for Demo)
- "Avengers: Endgame" (ID: 299534)
- "The Dark Knight" (ID: 155)
- "Inception" (ID: 27205)
- "Interstellar" (ID: 157336)

### Popular TV Shows
- "Game of Thrones" (ID: 1399)
- "Breaking Bad" (ID: 1396)
- "Stranger Things" (ID: 66732)
- "The Office" (ID: 2316)

### Popular Anime
- "Attack on Titan"
- "Naruto"
- "One Piece"
- "Death Note"

These titles typically have good metadata and are likely to be available on streaming platforms.
