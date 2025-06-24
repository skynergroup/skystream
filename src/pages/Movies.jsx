import { useState, useEffect } from 'react';
import { ContentGrid, Loading } from '../components';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock movie data
  const mockMovies = [
    {
      id: 299534,
      title: "Avengers: Endgame",
      poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
      backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
      overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos.",
      release_date: "2019-04-24",
      vote_average: 8.3,
      type: "movie"
    },
    {
      id: 299536,
      title: "Avengers: Infinity War",
      poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
      backdrop_path: "/lmZFxXgJE3vgrciwuDib0N8CfQo.jpg",
      overview: "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle.",
      release_date: "2018-04-25",
      vote_average: 8.3,
      type: "movie"
    },
    {
      id: 155,
      title: "The Dark Knight",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdrop_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
      overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
      release_date: "2008-07-16",
      vote_average: 9.0,
      type: "movie"
    },
    {
      id: 238,
      title: "The Godfather",
      poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
      overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
      release_date: "1972-03-14",
      vote_average: 8.7,
      type: "movie"
    },
    {
      id: 424,
      title: "Schindler's List",
      poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
      backdrop_path: "/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg",
      overview: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis.",
      release_date: "1993-11-30",
      vote_average: 8.6,
      type: "movie"
    },
    {
      id: 240,
      title: "The Godfather: Part II",
      poster_path: "/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg",
      backdrop_path: "/kGzFbGhp99zva6oZODW5atUtnqi.jpg",
      overview: "In the continuing saga of the Corleone crime family, a young Vito Corleone grows up in Sicily.",
      release_date: "1974-12-20",
      vote_average: 8.6,
      type: "movie"
    }
  ];

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setMovies(mockMovies);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  return (
    <div className="movies-page" style={{ padding: '2rem 0' }}>
      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: 'var(--netflix-white)',
          margin: '0 0 0.5rem 0'
        }}>
          Movies
        </h1>
        <p style={{ 
          color: 'var(--netflix-text-gray)', 
          fontSize: '1.1rem',
          margin: 0
        }}>
          Discover and stream thousands of movies in HD, Full HD and 4K quality.
        </p>
      </div>

      <ContentGrid
        title="Popular Movies"
        items={movies}
        loading={loading}
        error={error}
        cardSize="medium"
        showTitle={false}
      />
    </div>
  );
};

export default Movies;
