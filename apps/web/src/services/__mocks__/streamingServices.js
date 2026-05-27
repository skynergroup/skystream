const streamingServices = {
  getStreamingUrl: jest.fn(
    (content, options = {}) =>
      `https://player.videasy.net/${content.type}/${content.id}${content.type === 'tv' ? `/${options.season || 1}/${options.episode || 1}` : ''}`
  ),
  getAllStreamingUrls: jest.fn(content => ({
    server1: `https://player.videasy.net/${content.type}/${content.id}`,
    videasy: `https://player.videasy.net/${content.type}/${content.id}`,
    vidsrc: `https://player.videasy.net/${content.type}/${content.id}`,
  })),
  getMovieUrl: jest.fn(id => `https://player.videasy.net/movie/${id}`),
  getVideasyMovieUrl: jest.fn(id => `https://player.videasy.net/movie/${id}`),
  getTVUrl: jest.fn(
    (id, season, episode) => `https://player.videasy.net/tv/${id}/${season}/${episode}`
  ),
  getVideasyTVUrl: jest.fn(
    (id, season, episode) => `https://player.videasy.net/tv/${id}/${season}/${episode}`
  ),
};

export default streamingServices;
