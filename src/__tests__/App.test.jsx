import { render, screen, waitFor } from '@testing-library/react';
import SearchPage from '../app/page';
import DiscoverPage from '../app/home/page';
import tmdbApi from '../services/tmdbApi';
import { analytics } from '../utils';

jest.mock('../services/tmdbApi');
jest.mock('../utils');
jest.mock('../components/StreamingSearchBar', () => {
  return function MockStreamingSearchBar() {
    return <div data-testid="search-bar">Search Bar</div>;
  };
});
jest.mock('../components/StreamingResultCard', () => {
  return function MockStreamingResultCard() {
    return <div data-testid="result-card">Result Card</div>;
  };
});
jest.mock('../components/StreamingPlayerModal', () => {
  return function MockStreamingPlayerModal() {
    return null;
  };
});
jest.mock('../components/FeaturedHero', () => {
  return function MockFeaturedHero() {
    return <div data-testid="featured-hero">Featured Hero</div>;
  };
});
jest.mock('../components/ContentRow', () => {
  return function MockContentRow({ title }) {
    return <div data-testid={`content-row-${title}`}>{title}</div>;
  };
});
jest.mock('../components', () => ({
  Loading: ({ text }) => <div data-testid="loading">{text}</div>,
}));

describe('App Router entrypoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    analytics.trackPageView = jest.fn();
    analytics.trackEvent = jest.fn();
    analytics.trackError = jest.fn();
    tmdbApi.getHomePageContent = jest.fn().mockResolvedValue({
      featured: [{ id: 1, title: 'Featured Movie', type: 'movie' }],
      trending: [{ id: 2, title: 'Trending Movie', type: 'movie' }],
      popularMovies: [],
      popularTV: [],
      topRated: [],
      popularAnime: [],
    });
  });

  test('renders the active root route module', () => {
    render(<SearchPage />);

    expect(screen.getByText('SkyStream')).toBeInTheDocument();
    expect(screen.getByText(/Search and stream your favorite/)).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(analytics.trackPageView).toHaveBeenCalledWith('/', 'SkyStream - Search');
  });

  test('renders the active /home route module', async () => {
    render(<DiscoverPage />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('featured-hero')).toBeInTheDocument();
    });

    expect(screen.getByTestId('content-row-Trending Now')).toBeInTheDocument();
    expect(analytics.trackPageView).toHaveBeenCalledWith('/home', 'SkyStream - Discover');
  });
});
