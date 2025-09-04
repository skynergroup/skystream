/**
 * Streaming Services Test Utility
 * Test the streaming services integration
 */

import tmdbApi from '../services/tmdbApi';
import streamingServices from '../services/streamingServices';

class StreamingTest {
  /**
   * Test search functionality
   */
  async testSearch(query = 'avengers') {
    console.log(`🔍 Testing search for: "${query}"`);
    
    try {
      const results = await tmdbApi.search(query);
      console.log(`✅ Search successful: ${results.results.length} results found`);
      
      if (results.results.length > 0) {
        const firstResult = results.results[0];
        const transformed = tmdbApi.transformContent(firstResult);
        console.log(`📄 First result:`, {
          title: transformed.title,
          type: transformed.type,
          id: transformed.id,
          year: transformed.release_date?.substring(0, 4)
        });
        
        return transformed;
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }

  /**
   * Test streaming URL generation
   */
  testStreamingUrls(content) {
    console.log(`🎬 Testing streaming URLs for: "${content.title}"`);
    
    try {
      const urls = streamingServices.getAllStreamingUrls(content);
      console.log('✅ Streaming URLs generated:');
      console.log(`  Vidsrc: ${urls.vidsrc}`);
      console.log(`  Videasy: ${urls.videasy}`);
      
      return urls;
    } catch (error) {
      console.error('❌ URL generation failed:', error);
      throw error;
    }
  }

  /**
   * Test specific movie URLs
   */
  testMovieUrls() {
    console.log('🎭 Testing movie URL generation...');
    
    const testMovie = {
      id: 299534, // Avengers: Endgame
      title: 'Avengers: Endgame',
      type: 'movie'
    };

    const vidsrcUrl = streamingServices.getVidsrcMovieUrl(testMovie.id);
    const videasyUrl = streamingServices.getVideasyMovieUrl(testMovie.id);

    console.log('✅ Movie URLs:');
    console.log(`  Vidsrc: ${vidsrcUrl}`);
    console.log(`  Videasy: ${videasyUrl}`);

    return { vidsrc: vidsrcUrl, videasy: videasyUrl };
  }

  /**
   * Test TV show URLs
   */
  testTVUrls() {
    console.log('📺 Testing TV show URL generation...');
    
    const testShow = {
      id: 1399, // Game of Thrones
      title: 'Game of Thrones',
      type: 'tv'
    };

    const vidsrcUrl = streamingServices.getVidsrcTVUrl(testShow.id, 1, 1);
    const videasyUrl = streamingServices.getVideasyTVUrl(testShow.id, 1, 1);

    console.log('✅ TV Show URLs (S01E01):');
    console.log(`  Vidsrc: ${vidsrcUrl}`);
    console.log(`  Videasy: ${videasyUrl}`);

    return { vidsrc: vidsrcUrl, videasy: videasyUrl };
  }

  /**
   * Run comprehensive test suite
   */
  async runFullTest() {
    console.log('🚀 Starting SkyStream streaming test suite...\n');
    
    try {
      // Test search
      const searchResult = await this.testSearch('avengers');
      console.log('');
      
      // Test URL generation for search result
      if (searchResult) {
        this.testStreamingUrls(searchResult);
        console.log('');
      }
      
      // Test specific movie URLs
      this.testMovieUrls();
      console.log('');
      
      // Test TV show URLs
      this.testTVUrls();
      console.log('');
      
      console.log('✅ All tests completed successfully!');
      return true;
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      return false;
    }
  }

  /**
   * Test Vidsrc latest content API
   */
  async testVidsrcLatest() {
    console.log('📡 Testing Vidsrc latest content API...');
    
    try {
      const movies = await streamingServices.getVidsrcLatestMovies(1);
      console.log(`✅ Latest movies: ${movies?.length || 0} items`);
      
      const tvShows = await streamingServices.getVidsrcLatestTVShows(1);
      console.log(`✅ Latest TV shows: ${tvShows?.length || 0} items`);
      
      const episodes = await streamingServices.getVidsrcLatestEpisodes(1);
      console.log(`✅ Latest episodes: ${episodes?.length || 0} items`);
      
      return { movies, tvShows, episodes };
    } catch (error) {
      console.error('❌ Vidsrc API test failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
const streamingTest = new StreamingTest();

// Add to window for browser console testing
if (typeof window !== 'undefined') {
  window.streamingTest = streamingTest;
  console.log('🧪 Streaming test utility available as window.streamingTest');
  console.log('Run window.streamingTest.runFullTest() to test all features');
}

export default streamingTest;
