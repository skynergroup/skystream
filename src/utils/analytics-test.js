// Analytics Test Utility
// Use this to test analytics tracking in development

import analytics from './analytics';

export const testAnalytics = () => {
  console.log('🧪 Testing Analytics Implementation...');
  
  // Test basic initialization
  console.log('📊 Analytics enabled:', analytics.enabled);
  console.log('🔑 Tracking ID:', analytics.trackingId);
  console.log('✅ Analytics ready:', analytics.isReady());
  
  if (!analytics.isReady()) {
    console.warn('⚠️ Analytics not ready. Check configuration.');
    return;
  }

  // Test movie tracking
  console.log('🎬 Testing movie tracking...');
  analytics.trackMovieView('12345', 'Test Movie', {
    genres: ['Action', 'Adventure'],
    year: '2023',
    rating: 8.5,
    runtime: 120,
  });

  // Test series tracking
  console.log('📺 Testing series tracking...');
  analytics.trackSeriesView('67890', 'Test Series', {
    genres: ['Drama', 'Thriller'],
    year: '2023',
    rating: 9.0,
    seasons: 3,
  });

  // Test anime tracking
  console.log('🎌 Testing anime tracking...');
  analytics.trackAnimeView('11111', 'Test Anime', {
    genres: ['Animation', 'Action'],
    year: '2023',
    rating: 8.8,
    episodes: 24,
  });

  // Test episode tracking
  console.log('📹 Testing episode tracking...');
  analytics.trackEpisodeView('tv', '67890', 'Test Series', 1, 5, {
    episodeTitle: 'Test Episode 5',
  });

  // Test player tracking
  console.log('🎮 Testing player tracking...');
  analytics.trackPlayerPerformance('godrive', 'movie', {
    success: true,
    loadTime: 2.5,
  });

  // Test video events
  console.log('▶️ Testing video events...');
  analytics.trackVideoEvent('play', 'movie', '12345', 'Test Movie', {
    player: 'godrive',
    quality: '1080p',
  });

  // Test search tracking
  console.log('🔍 Testing search tracking...');
  analytics.trackSearch('action movies', 25);

  // Test genre preferences
  console.log('🎭 Testing genre tracking...');
  analytics.trackGenreInteraction('Action', 'movie', 'view');

  // Test custom events
  console.log('🎯 Testing custom events...');
  analytics.trackEvent('test_event', {
    category: 'testing',
    label: 'analytics_test',
    value: 1,
  });

  console.log('✅ Analytics test completed! Check your browser console and GA4 dashboard.');
};

// Test function for player switching
export const testPlayerSwitching = () => {
  console.log('🔄 Testing player switching analytics...');
  
  const players = ['godrive', 'videasy', 'vidsrc'];
  const contentTypes = ['movie', 'tv', 'anime'];
  
  players.forEach(player => {
    contentTypes.forEach(type => {
      analytics.trackPlayerPerformance(player, type, {
        success: Math.random() > 0.2, // 80% success rate
        loadTime: Math.random() * 5,
        errorType: Math.random() > 0.8 ? 'timeout' : null,
      });
    });
  });
  
  console.log('✅ Player switching test completed!');
};

// Test function for content popularity
export const testContentPopularity = () => {
  console.log('📊 Testing content popularity analytics...');
  
  // Simulate popular movies
  const popularMovies = [
    { id: '299534', title: 'Avengers: Endgame', genres: ['Action', 'Adventure'] },
    { id: '19995', title: 'Avatar', genres: ['Action', 'Adventure', 'Fantasy'] },
    { id: '157336', title: 'Interstellar', genres: ['Drama', 'Sci-Fi'] },
  ];
  
  // Simulate popular series
  const popularSeries = [
    { id: '1399', title: 'Game of Thrones', genres: ['Drama', 'Fantasy'] },
    { id: '66732', title: 'Stranger Things', genres: ['Drama', 'Fantasy', 'Horror'] },
    { id: '1396', title: 'Breaking Bad', genres: ['Crime', 'Drama', 'Thriller'] },
  ];
  
  // Simulate popular anime
  const popularAnime = [
    { id: '1735', title: 'Naruto', genres: ['Animation', 'Action', 'Adventure'] },
    { id: '31964', title: 'My Hero Academia', genres: ['Animation', 'Action', 'Adventure'] },
    { id: '1429', title: 'Attack on Titan', genres: ['Animation', 'Action', 'Drama'] },
  ];
  
  // Track movie views
  popularMovies.forEach(movie => {
    analytics.trackMovieView(movie.id, movie.title, {
      genres: movie.genres,
      year: '2023',
      rating: 8.0 + Math.random() * 2,
    });
  });
  
  // Track series views
  popularSeries.forEach(series => {
    analytics.trackSeriesView(series.id, series.title, {
      genres: series.genres,
      year: '2023',
      rating: 8.0 + Math.random() * 2,
    });
  });
  
  // Track anime views
  popularAnime.forEach(anime => {
    analytics.trackAnimeView(anime.id, anime.title, {
      genres: anime.genres,
      year: '2023',
      rating: 8.0 + Math.random() * 2,
    });
  });
  
  console.log('✅ Content popularity test completed!');
};

// Export all test functions
export default {
  testAnalytics,
  testPlayerSwitching,
  testContentPopularity,
};
