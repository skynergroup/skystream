/**
 * BoredFlix-inspired utility functions
 * Helper functions to match BoredFlix's design and functionality
 */

/**
 * Convert TMDB rating (0-10) to percentage (0-100%)
 */
export const convertRatingToPercentage = (tmdbRating) => {
  if (!tmdbRating || tmdbRating === 0) return null;
  return Math.round(tmdbRating * 10);
};

/**
 * Determine if content is "new" (released within last 60 days)
 */
export const isNewContent = (releaseDate) => {
  if (!releaseDate) return false;
  
  const release = new Date(releaseDate);
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
  
  return release >= sixtyDaysAgo;
};

/**
 * Extract year from release date string
 */
export const formatYear = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear();
};

/**
 * Format runtime in BoredFlix style (e.g., "2h 7m")
 */
export const formatRuntime = (minutes) => {
  if (!minutes) return null;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

/**
 * Get content type display name
 */
export const getContentTypeDisplay = (type) => {
  switch (type) {
    case 'movie':
      return 'Movie';
    case 'tv':
      return 'TV';
    case 'anime':
      return 'TV';
    default:
      return 'Movie';
  }
};

/**
 * Generate BoredFlix-style content metadata string
 */
export const formatContentMeta = (content) => {
  const year = formatYear(content.release_date || content.first_air_date);
  const runtime = formatRuntime(content.runtime);
  const type = getContentTypeDisplay(content.type);
  
  const parts = [year];
  if (runtime) parts.push(runtime);
  
  return parts.join(' • ');
};

/**
 * Get rating color based on percentage
 */
export const getRatingColor = (percentage) => {
  if (!percentage) return '#666';
  
  if (percentage >= 80) return '#4CAF50'; // Green for excellent
  if (percentage >= 70) return '#8BC34A'; // Light green for good
  if (percentage >= 60) return '#FFC107'; // Yellow for average
  if (percentage >= 40) return '#FF9800'; // Orange for below average
  return '#F44336'; // Red for poor
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Get backdrop image URL with fallback
 */
export const getBackdropUrl = (backdropPath, size = 'original') => {
  if (!backdropPath) return '/placeholder-backdrop.jpg';
  return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
};

/**
 * Get poster image URL with fallback
 */
export const getPosterUrl = (posterPath, size = 'w500') => {
  if (!posterPath) return '/placeholder-poster.jpg';
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

/**
 * Generate share URL for content
 */
export const generateShareUrl = (content) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/${content.type}/${content.id}`;
};

/**
 * Generate share text for social media
 */
export const generateShareText = (content) => {
  const title = content.title || content.name;
  const year = formatYear(content.release_date || content.first_air_date);
  const rating = convertRatingToPercentage(content.vote_average);
  
  let text = `Check out ${title}`;
  if (year) text += ` (${year})`;
  if (rating) text += ` - ${rating}% rating`;
  text += ' on SkyStream!';
  
  return text;
};

/**
 * Get genre names from genre objects
 */
export const getGenreNames = (genres) => {
  if (!genres || !Array.isArray(genres)) return [];
  return genres.map(genre => genre.name || genre).filter(Boolean);
};

/**
 * Format genre list for display
 */
export const formatGenres = (genres, maxGenres = 3) => {
  const genreNames = getGenreNames(genres);
  if (genreNames.length === 0) return '';
  
  const displayGenres = genreNames.slice(0, maxGenres);
  return displayGenres.join(', ');
};

/**
 * Check if content is anime based on genres or origin country
 */
export const isAnimeContent = (content) => {
  // Check genres for Animation and origin country for Japan
  const genres = getGenreNames(content.genres || []);
  const isAnimation = genres.some(genre => 
    genre.toLowerCase().includes('animation')
  );
  
  const originCountries = content.origin_country || [];
  const isJapanese = originCountries.includes('JP');
  
  // Also check if it's explicitly marked as anime type
  const isAnimeType = content.type === 'anime';
  
  return isAnimeType || (isAnimation && isJapanese);
};

/**
 * Get content status display
 */
export const getContentStatus = (content) => {
  if (content.status) {
    return content.status;
  }
  
  // For movies, check if it's released
  if (content.type === 'movie') {
    const releaseDate = new Date(content.release_date);
    const now = new Date();
    return releaseDate <= now ? 'Released' : 'Upcoming';
  }
  
  // For TV shows, check if it's ended or ongoing
  if (content.type === 'tv' || content.type === 'anime') {
    return content.in_production ? 'Ongoing' : 'Ended';
  }
  
  return 'Unknown';
};

/**
 * Calculate content popularity score (for trending)
 */
export const calculatePopularityScore = (content) => {
  const rating = content.vote_average || 0;
  const voteCount = content.vote_count || 0;
  const popularity = content.popularity || 0;
  
  // Weighted score: rating * vote count weight + popularity
  const voteWeight = Math.min(voteCount / 100, 10); // Cap at 10x multiplier
  return (rating * voteWeight) + (popularity * 0.1);
};

/**
 * Sort content by BoredFlix-style popularity
 */
export const sortByPopularity = (contentArray) => {
  return [...contentArray].sort((a, b) => {
    const scoreA = calculatePopularityScore(a);
    const scoreB = calculatePopularityScore(b);
    return scoreB - scoreA;
  });
};

/**
 * Filter content by type
 */
export const filterContentByType = (contentArray, type) => {
  if (type === 'all') return contentArray;
  if (type === 'anime') {
    return contentArray.filter(content => isAnimeContent(content));
  }
  return contentArray.filter(content => content.type === type);
};

/**
 * Get random featured content for hero banner
 */
export const getRandomFeaturedContent = (contentArray) => {
  if (!contentArray || contentArray.length === 0) return null;
  
  // Prefer content with high ratings and backdrop images
  const goodContent = contentArray.filter(content => 
    content.vote_average >= 7 && 
    content.backdrop_path &&
    content.overview
  );
  
  const sourceArray = goodContent.length > 0 ? goodContent : contentArray;
  const randomIndex = Math.floor(Math.random() * sourceArray.length);
  return sourceArray[randomIndex];
};
