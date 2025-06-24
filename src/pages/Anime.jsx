import { useState, useEffect } from 'react';
import { ContentGrid, Loading } from '../components';

const Anime = () => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock anime data
  const mockAnime = [
    {
      id: 21,
      name: "One Piece",
      poster_path: "/cMD9Ygz11zjJzAovURpO75Qg7rT.jpg",
      backdrop_path: "/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg",
      overview: "Monkey D. Luffy sails with his crew of Straw Hat Pirates through the Grand Line to find the treasure One Piece and become the next king of the pirates.",
      first_air_date: "1999-10-20",
      vote_average: 8.9,
      type: "anime"
    },
    {
      id: 11061,
      name: "Hunter x Hunter",
      poster_path: "/yWjcNDcWOGnJZfCDzpJnGYr2PB1.jpg",
      backdrop_path: "/ye7BnbLYbOjXvOQmZnVAkqACDrT.jpg",
      overview: "Twelve-year-old Gon Freecss one day discovers that the father he had always been told was dead was alive and well.",
      first_air_date: "2011-10-02",
      vote_average: 9.0,
      type: "anime"
    },
    {
      id: 1735,
      name: "Naruto",
      poster_path: "/vauCEnR7CiyBDzRCeElKkCaXIYu.jpg",
      backdrop_path: "/eCGAUSoebcfcUgJdKSNNhVHvdJr.jpg",
      overview: "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage.",
      first_air_date: "2002-10-03",
      vote_average: 8.4,
      type: "anime"
    },
    {
      id: 1429,
      name: "Attack on Titan",
      poster_path: "/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
      backdrop_path: "/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg",
      overview: "Many years ago, the last remnants of humanity were forced to retreat behind the towering walls of a fortified city to escape the massive, man-eating Titans.",
      first_air_date: "2013-04-07",
      vote_average: 8.7,
      type: "anime"
    },
    {
      id: 1268,
      name: "Monster",
      poster_path: "/9eRJkNWEWapjqfggjRJCd0Dj1XJ.jpg",
      backdrop_path: "/asDqvkE66EegtKJJXIRhBJPxscr.jpg",
      overview: "Dr. Kenzo Tenma, an elite neurosurgeon recently engaged to his hospital director's daughter, is well on his way to ascending the hospital hierarchy.",
      first_air_date: "2004-04-07",
      vote_average: 9.2,
      type: "anime"
    },
    {
      id: 30831,
      name: "Dragon Ball Super",
      poster_path: "/3wxTNr6EzpxdvgkWl9Od8S8BQjj.jpg",
      backdrop_path: "/jBIMZ6eCxuJXfOxHJvGMfWlnmUG.jpg",
      overview: "With Majin Buu defeated half-a-year prior, peace returns to Earth, where Son Goku (now a radish farmer) and his friends now live peaceful lives.",
      first_air_date: "2015-07-05",
      vote_average: 8.3,
      type: "anime"
    }
  ];

  useEffect(() => {
    const loadAnime = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setAnime(mockAnime);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadAnime();
  }, []);

  return (
    <div className="anime-page" style={{ padding: '2rem 0' }}>
      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: 'var(--netflix-white)',
          margin: '0 0 0.5rem 0'
        }}>
          Anime
        </h1>
        <p style={{ 
          color: 'var(--netflix-text-gray)', 
          fontSize: '1.1rem',
          margin: 0
        }}>
          Explore the best anime series and movies with both subtitled and dubbed versions.
        </p>
      </div>

      <ContentGrid
        title="Popular Anime"
        items={anime}
        loading={loading}
        error={error}
        cardSize="medium"
        showTitle={false}
      />
    </div>
  );
};

export default Anime;
