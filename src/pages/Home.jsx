import { useState, useEffect } from 'react';
import { HeroBanner, ContentGrid, Loading } from '../components';

const Home = () => {
  const [featuredContent, setFeaturedContent] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockFeaturedContent = {
    id: 299534,
    title: "Avengers: Endgame",
    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
    backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    release_date: "2019-04-24",
    vote_average: 8.3,
    type: "movie"
  };

  const mockTrendingMovies = [
    {
      id: 299534,
      title: "Avengers: Endgame",
      poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
      backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
      overview: "After the devastating events of Avengers: Infinity War...",
      release_date: "2019-04-24",
      vote_average: 8.3,
      type: "movie"
    },
    {
      id: 299536,
      title: "Avengers: Infinity War",
      poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
      backdrop_path: "/lmZFxXgJE3vgrciwuDib0N8CfQo.jpg",
      overview: "As the Avengers and their allies have continued to protect the world...",
      release_date: "2018-04-25",
      vote_average: 8.3,
      type: "movie"
    },
    {
      id: 155,
      title: "The Dark Knight",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdrop_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
      overview: "Batman raises the stakes in his war on crime...",
      release_date: "2008-07-16",
      vote_average: 9.0,
      type: "movie"
    }
  ];

  const mockTrendingTV = [
    {
      id: 1399,
      name: "Game of Thrones",
      poster_path: "/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg",
      backdrop_path: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
      overview: "Seven noble families fight for control of the mythical land of Westeros...",
      first_air_date: "2011-04-17",
      vote_average: 8.3,
      type: "tv"
    },
    {
      id: 94605,
      name: "Arcane",
      poster_path: "/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
      backdrop_path: "/rkB4LyZHo1NHXFEDHl9vSD9r1lI.jpg",
      overview: "Amid the stark discord of twin cities Piltover and Zaun...",
      first_air_date: "2021-11-06",
      vote_average: 8.7,
      type: "tv"
    }
  ];

  useEffect(() => {
    // Simulate API loading
    const loadContent = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFeaturedContent(mockFeaturedContent);
      setTrendingMovies(mockTrendingMovies);
      setTrendingTV(mockTrendingTV);
      setLoading(false);
    };

    loadContent();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Loading size="large" text="Loading amazing content..." />
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <HeroBanner content={featuredContent} />
      
      {/* Content Sections */}
      <div style={{ padding: '2rem 0' }}>
        <ContentGrid
          title="Trending Movies"
          items={trendingMovies}
          cardSize="medium"
          className="content-grid--horizontal"
        />
        
        <ContentGrid
          title="Trending TV Shows"
          items={trendingTV}
          cardSize="medium"
          className="content-grid--horizontal"
        />
      </div>
    </div>
  );
};

export default Home;
