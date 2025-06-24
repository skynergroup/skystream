# Video Streaming API Documentation

## Table of Contents
- [Overview](#overview)
- [VidSrc API](#vidsrc-api)
- [VIDEASY API](#videasy-api)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## Overview

This documentation covers two powerful video streaming APIs that provide seamless integration for movies, TV shows, and anime content:

1. **VidSrc** - Comprehensive streaming API with embed links and WordPress plugins
2. **VIDEASY** - Easy-to-use player with advanced customization options

### Content Statistics
- **Movies**: 84,696 titles
- **TV Series**: 18,404 shows  
- **Episodes**: 446,100 episodes
- **Quality**: 80% of content available in 1080p
- **Updates**: Automatically updated with new and better quality sources

---

## VidSrc API

### Base Domains
Use any of these domains for embed URLs:
- `vidsrc.in`
- `vidsrc.pm` 
- `vidsrc.xyz`
- `vidsrc.net`

### Download Service
- **Download URL**: `dl.vidsrc.me`

### URL Structure

#### Movies
```
https://v2.vidsrc.me/embed/{imdb_id}
```

**Example:**
```html
<iframe 
  src="https://v2.vidsrc.me/embed/tt1300854" 
  width="100%" 
  height="500" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

#### TV Shows
```
https://v2.vidsrc.me/embed/{imdb_id}/{season}-{episode}
```

**Example:**
```html
<iframe 
  src="https://v2.vidsrc.me/embed/tt0944947/1-1" 
  width="100%" 
  height="500" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

### Customization Options

#### Color Customization
Add a hexadecimal color code to customize the player theme:

```
https://v2.vidsrc.me/embed/tt1300854/color-15006D
```

**Example:**
```html
<iframe src="https://v2.vidsrc.me/embed/tt1300854/color-15006D"></iframe>
```

### Features
- ✅ **Auto-Updated**: Links automatically updated with better quality sources
- ✅ **Responsive**: Works on Desktop, Mobile, and Tablet
- ✅ **High Quality**: 80% of content in 1080p
- ✅ **DMCA Protected**: Secure links protected from takedown notices
- ✅ **Subtitles**: Wide selection of subtitles for most titles
- ✅ **Multi-language**: Global movies in original languages

### WordPress Integration
VidSrc offers plugins compatible with:
- **Dooplay** theme
- **Psyplay** theme
- Custom themes (contact support)

---

## VIDEASY API

### Base URL
```
https://player.videasy.net/
```

### URL Structure

#### Movies
```
https://player.videasy.net/movie/{tmdb_id}
```

**Example:**
```html
<!-- Avengers: Endgame -->
<iframe src="https://player.videasy.net/movie/299534"></iframe>
```

#### TV Shows
```
https://player.videasy.net/tv/{tmdb_id}/{season}/{episode}
```

**Example:**
```html
<!-- Game of Thrones S01E01 -->
<iframe src="https://player.videasy.net/tv/1399/1/1"></iframe>
```

#### Anime Shows
```
https://player.videasy.net/anime/{anilist_id}/{episode}?dub={true|false}
```

**Examples:**
```html
<!-- One Piece Episode 1 (Subtitled) -->
<iframe src="https://player.videasy.net/anime/21/1"></iframe>

<!-- One Piece Episode 1 (Dubbed) -->
<iframe src="https://player.videasy.net/anime/21/1?dub=true"></iframe>
```

#### Anime Movies
```
https://player.videasy.net/anime/{anilist_id}?dub={true|false}
```

**Examples:**
```html
<!-- THE FIRST SLAM DUNK (Subtitled) -->
<iframe src="https://player.videasy.net/anime/145139"></iframe>

<!-- THE FIRST SLAM DUNK (Dubbed) -->
<iframe src="https://player.videasy.net/anime/145139?dub=true"></iframe>
```

### Advanced Customization

#### Color Themes
Customize the player's accent color using hex codes (without #):

```html
<!-- Purple Theme -->
<iframe src="https://player.videasy.net/movie/299534?color=8B5CF6"></iframe>

<!-- Blue Theme -->
<iframe src="https://player.videasy.net/movie/299534?color=3B82F6"></iframe>
```

#### Player Features

##### Start Time Control
Set the initial playback position in seconds:
```html
<iframe src="https://player.videasy.net/movie/299534?progress=120"></iframe>
```

##### TV Show Features
```html
<!-- Next Episode Button -->
<iframe src="https://player.videasy.net/tv/1399/1/1?nextEpisode=true"></iframe>

<!-- Episode Selector -->
<iframe src="https://player.videasy.net/tv/1399/1/1?episodeSelector=true"></iframe>

<!-- Autoplay Next Episode -->
<iframe src="https://player.videasy.net/tv/1399/1/1?autoplayNextEpisode=true"></iframe>

<!-- All Features Combined -->
<iframe src="https://player.videasy.net/tv/1399/1/1?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&color=8B5CF6"></iframe>
```

#### Parameter Reference

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `color` | string | Hex color code (without #) | `8B5CF6` |
| `progress` | integer | Start time in seconds | `120` |
| `nextEpisode` | boolean | Show next episode button | `true` |
| `episodeSelector` | boolean | Enable episode selector | `true` |
| `autoplayNextEpisode` | boolean | Auto-play next episode | `true` |
| `dub` | boolean | Use dubbed version (anime only) | `true` |

### Watch Progress Tracking

VIDEASY supports real-time progress tracking through postMessage API:

```javascript
// Add this script to your website
window.addEventListener("message", function (event) {
  if (typeof event.data === "string") {
    const progressData = JSON.parse(event.data);
    console.log("Progress update:", progressData);
    
    // Save to localStorage
    localStorage.setItem(`progress_${progressData.id}`, JSON.stringify(progressData));
    
    // Or send to your backend
    // saveProgressToBackend(progressData);
  }
});
```

#### Progress Data Structure
```javascript
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

---

## Implementation Examples

### Responsive Player Container

#### 16:9 Aspect Ratio
```html
<div style="position: relative; padding-bottom: 56.25%; height: 0;">
  <iframe
    src="https://player.videasy.net/movie/299534"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    allowfullscreen
    allow="encrypted-media">
  </iframe>
</div>
```

#### 4:3 Aspect Ratio
```html
<div style="position: relative; padding-bottom: 75%; height: 0;">
  <iframe
    src="https://player.videasy.net/movie/299534"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    allowfullscreen>
  </iframe>
</div>
```

### Dynamic Player Implementation

```javascript
class VideoPlayer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.setupProgressTracking();
  }
  
  loadMovie(tmdbId, options = {}) {
    const params = new URLSearchParams();
    
    if (options.color) params.append('color', options.color);
    if (options.progress) params.append('progress', options.progress);
    
    const url = `https://player.videasy.net/movie/${tmdbId}?${params}`;
    this.createIframe(url);
  }
  
  loadTVShow(tmdbId, season, episode, options = {}) {
    const params = new URLSearchParams();
    
    if (options.color) params.append('color', options.color);
    if (options.nextEpisode) params.append('nextEpisode', 'true');
    if (options.episodeSelector) params.append('episodeSelector', 'true');
    if (options.autoplayNextEpisode) params.append('autoplayNextEpisode', 'true');
    
    const url = `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}?${params}`;
    this.createIframe(url);
  }
  
  loadAnime(anilistId, episode = null, options = {}) {
    const params = new URLSearchParams();
    
    if (options.dub) params.append('dub', 'true');
    if (options.color) params.append('color', options.color);
    
    const url = episode 
      ? `https://player.videasy.net/anime/${anilistId}/${episode}?${params}`
      : `https://player.videasy.net/anime/${anilistId}?${params}`;
      
    this.createIframe(url);
  }
  
  createIframe(src) {
    this.container.innerHTML = `
      <div style="position: relative; padding-bottom: 56.25%; height: 0;">
        <iframe
          src="${src}"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          frameborder="0"
          allowfullscreen
          allow="encrypted-media">
        </iframe>
      </div>
    `;
  }
  
  setupProgressTracking() {
    window.addEventListener("message", (event) => {
      if (typeof event.data === "string") {
        try {
          const progressData = JSON.parse(event.data);
          this.onProgressUpdate(progressData);
        } catch (e) {
          console.error("Failed to parse progress data:", e);
        }
      }
    });
  }
  
  onProgressUpdate(data) {
    // Override this method to handle progress updates
    console.log("Progress update:", data);
    
    // Example: Save to localStorage
    localStorage.setItem(`progress_${data.id}`, JSON.stringify(data));
  }
}

// Usage
const player = new VideoPlayer('player-container');

// Load a movie
player.loadMovie('299534', { color: '8B5CF6', progress: 120 });

// Load a TV show episode
player.loadTVShow('1399', 1, 1, { 
  nextEpisode: true, 
  episodeSelector: true,
  color: '3B82F6' 
});

// Load anime episode
player.loadAnime('21', 1, { dub: false, color: 'FF6B6B' });
```

---

## Finding Content IDs

### TMDB IDs (Movies & TV Shows)

#### Method 1: TMDB Website
1. Visit [themoviedb.org](https://themoviedb.org)
2. Search for your content
3. Extract ID from URL:
   - Movies: `themoviedb.org/movie/299534` → ID: `299534`
   - TV Shows: `themoviedb.org/tv/1399` → ID: `1399`

#### Method 2: TMDB API
```javascript
// Search for content
const searchMovie = async (query) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=YOUR_API_KEY&query=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.results;
};

// Usage
const results = await searchMovie("Avengers Endgame");
console.log(results[0].id); // 299534
```

### AniList IDs (Anime)

#### Method 1: AniList Website
1. Visit [anilist.co](https://anilist.co)
2. Search for anime
3. Extract ID from URL:
   - `anilist.co/anime/21` → ID: `21`

#### Method 2: AniList API
```javascript
const searchAnime = async (query) => {
  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query ($search: String) {
          Media (search: $search, type: ANIME) {
            id
            title {
              romaji
              english
            }
          }
        }
      `,
      variables: { search: query }
    })
  });
  
  const data = await response.json();
  return data.data.Media;
};

// Usage
const anime = await searchAnime("One Piece");
console.log(anime.id); // 21
```

---

## Best Practices

### Performance Optimization

1. **Lazy Loading**: Load iframes only when needed
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const iframe = entry.target;
      iframe.src = iframe.dataset.src;
      observer.unobserve(iframe);
    }
  });
});

document.querySelectorAll('iframe[data-src]').forEach(iframe => {
  observer.observe(iframe);
});
```

2. **Preload Critical Content**: Use `<link rel="preload">` for important resources

3. **Progress Persistence**: Save user progress across sessions
```javascript
const saveProgress = (data) => {
  const key = `progress_${data.type}_${data.id}`;
  if (data.season && data.episode) {
    key += `_s${data.season}e${data.episode}`;
  }
  localStorage.setItem(key, JSON.stringify(data));
};

const loadProgress = (type, id, season = null, episode = null) => {
  let key = `progress_${type}_${id}`;
  if (season && episode) {
    key += `_s${season}e${episode}`;
  }
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
};
```

### Security Considerations

1. **Content Security Policy**: Configure CSP headers
```html
<meta http-equiv="Content-Security-Policy" 
      content="frame-src 'self' https://player.videasy.net https://v2.vidsrc.me https://vidsrc.in https://vidsrc.pm https://vidsrc.xyz https://vidsrc.net;">
```

2. **Iframe Sandbox**: Use sandbox attributes when needed
```html
<iframe 
  src="https://player.videasy.net/movie/299534"
  sandbox="allow-scripts allow-same-origin allow-presentation"
  allowfullscreen>
</iframe>
```

### User Experience

1. **Loading States**: Show loading indicators
```css
.player-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #000;
  color: #fff;
}

.player-loading::after {
  content: "Loading player...";
  animation: pulse 1.5s infinite;
}
```

2. **Error Handling**: Implement fallback mechanisms
```javascript
const loadPlayerWithFallback = (primaryUrl, fallbackUrl) => {
  const iframe = document.createElement('iframe');
  iframe.src = primaryUrl;
  
  iframe.onerror = () => {
    console.warn('Primary player failed, trying fallback');
    iframe.src = fallbackUrl;
  };
  
  return iframe;
};
```

---

## Troubleshooting

### Common Issues

#### Player Not Loading
**Symptoms**: Blank iframe or loading indefinitely
**Solutions**:
1. Check if the content ID is correct
2. Verify the URL structure matches the API specification
3. Ensure the domain is not blocked by ad blockers
4. Check browser console for CSP violations

#### Progress Tracking Not Working
**Symptoms**: No progress events received
**Solutions**:
1. Verify the message event listener is properly set up
2. Check if the iframe has the correct `allow` attributes
3. Ensure the parent domain allows cross-origin messaging

#### Autoplay Issues
**Symptoms**: Videos don't autoplay
**Solutions**:
1. Add `allow="autoplay"` to iframe
2. Note that most browsers require user interaction for autoplay
3. Consider using muted autoplay as fallback

#### Mobile Playback Issues
**Symptoms**: Player not working on mobile devices
**Solutions**:
1. Ensure responsive container is properly implemented
2. Add `allow="encrypted-media"` to iframe
3. Test on actual devices, not just browser dev tools

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 404 | Content not found | Verify the content ID is correct |
| 403 | Access denied | Check if domain is whitelisted |
| 500 | Server error | Try again later or contact support |
| CSP | Content Security Policy violation | Update CSP headers |

### Debug Mode

Enable debug mode for VIDEASY player:
```html
<iframe src="https://player.videasy.net/movie/299534?debug=true"></iframe>
```

---

## Support

### VidSrc Support
- **Availability**: Almost 24/7 support
- **High Traffic**: Contact support if daily traffic exceeds 10,000 users for ad reduction
- **Custom Themes**: Request WordPress plugins for custom themes
- **Technical Help**: API implementation assistance available

### VIDEASY Support
- **Documentation**: Comprehensive guides available
- **Community**: Active developer community
- **Issues**: Report bugs through the player's report button

### Contact Information
- **VidSrc**: Contact through official website
- **VIDEASY**: Support available through documentation portal

### Rate Limits
- No explicit rate limits mentioned for either service
- For high-traffic applications, contact support for optimization

### Service Status
Both services maintain high uptime with automatic failover systems. Monitor service status through:
- Official websites
- Community forums
- Social media channels

---

## Changelog

### Recent Updates
- Added comprehensive progress tracking documentation
- Enhanced customization options for VIDEASY
- Improved error handling examples
- Added security best practices
- Updated content statistics

### API Versions
- **VidSrc**: v2 (current)
- **VIDEASY**: Latest stable version

---

*Last updated: January 2025*
*Documentation version: 2.0*