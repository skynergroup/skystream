const streamingServices = {
  getAllStreamingUrls: jest.fn(content => ({
    vidsrc: `https://vidsrc.to/embed/${content.type}/${content.id}`,
    videasy: `https://videasy.to/embed/${content.type}/${content.id}`,
  })),
  getVidsrcMovieUrl: jest.fn(id => `https://vidsrc.to/embed/movie/${id}`),
  getVideasyMovieUrl: jest.fn(id => `https://videasy.to/embed/movie/${id}`),
  getVidsrcTVUrl: jest.fn(
    (id, season, episode) => `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
  ),
  getVideasyTVUrl: jest.fn(
    (id, season, episode) => `https://videasy.to/embed/tv/${id}/${season}/${episode}`
  ),
};

export default streamingServices;
