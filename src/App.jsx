import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { Home, Movies, TVShows, Anime, Search, Library, ContentDetail, NotFound } from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="browse/movies" element={<Movies />} />
          <Route path="browse/tv" element={<TVShows />} />
          <Route path="browse/anime" element={<Anime />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="movie/:id" element={<ContentDetail />} />
          <Route path="tv/:id" element={<ContentDetail />} />
          <Route path="anime/:id" element={<ContentDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
