import { useState, useEffect } from 'react';
import { ContentGrid, Loading } from '../components';

const TVShows = () => {
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock TV show data
  const mockTVShows = [
    {
      id: 1399,
      name: "Game of Thrones",
      poster_path: "/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg",
      backdrop_path: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
      overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war.",
      first_air_date: "2011-04-17",
      vote_average: 8.3,
      type: "tv"
    },
    {
      id: 94605,
      name: "Arcane",
      poster_path: "/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
      backdrop_path: "/rkB4LyZHo1NHXFEDHl9vSD9r1lI.jpg",
      overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.",
      first_air_date: "2021-11-06",
      vote_average: 8.7,
      type: "tv"
    },
    {
      id: 1396,
      name: "Breaking Bad",
      poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
      overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
      first_air_date: "2008-01-20",
      vote_average: 8.9,
      type: "tv"
    },
    {
      id: 85552,
      name: "Euphoria",
      poster_path: "/jtnfNzqZwN4E32FGGxx1YZaBWWf.jpg",
      backdrop_path: "/oKt4J3TFjWirVwBqoHyIvv5IImd.jpg",
      overview: "A group of high school students navigate love and friendships in a world of drugs, sex, trauma and social media.",
      first_air_date: "2019-06-16",
      vote_average: 8.4,
      type: "tv"
    },
    {
      id: 60625,
      name: "Rick and Morty",
      poster_path: "/gdIrmf2DdY5mgN6ycVP0XlzKzbE.jpg",
      backdrop_path: "/eV3XnUul70X3jRuHeHAZYrVaEQd.jpg",
      overview: "An animated series that follows the exploits of a super scientist and his not-so-bright grandson.",
      first_air_date: "2013-12-02",
      vote_average: 8.7,
      type: "tv"
    },
    {
      id: 1402,
      name: "The Walking Dead",
      poster_path: "/rqeYMLryjcawh2JeRpCVUDXYM5b.jpg",
      backdrop_path: "/uro2Khv7JxlzXtLb8tCIbRhkb9E.jpg",
      overview: "Sheriff's deputy Rick Grimes awakens from a coma to find a post-apocalyptic world dominated by flesh-eating zombies.",
      first_air_date: "2010-10-31",
      vote_average: 8.1,
      type: "tv"
    }
  ];

  useEffect(() => {
    const loadTVShows = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setTvShows(mockTVShows);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadTVShows();
  }, []);

  return (
    <div className="tv-shows-page" style={{ padding: '2rem 0' }}>
      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: 'var(--netflix-white)',
          margin: '0 0 0.5rem 0'
        }}>
          TV Shows
        </h1>
        <p style={{ 
          color: 'var(--netflix-text-gray)', 
          fontSize: '1.1rem',
          margin: 0
        }}>
          Binge-watch the best TV series and shows from around the world.
        </p>
      </div>

      <ContentGrid
        title="Popular TV Shows"
        items={tvShows}
        loading={loading}
        error={error}
        cardSize="medium"
        showTitle={false}
      />
    </div>
  );
};

export default TVShows;
