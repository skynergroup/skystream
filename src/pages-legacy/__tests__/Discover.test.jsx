import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DiscoverPage from '../../app/home/page';
import tmdbApi from '../../services/tmdbApi';
import { analytics } from '../../utils';

jest.mock('../../services/tmdbApi');
jest.mock('../../utils');
jest.mock('../../components/FeaturedHero', () => {
  return function MockFeaturedHero({ content, onPlay }) {
    return (
      <div data-testid="featured-hero">
        <button onClick={() => onPlay(content[0], 'vidsrc', 'test-url')}>Play</button>
      </div>
    );
  };
});
jest.mock('../../components/ContentRow', () => {
  return function MockContentRow({ title, content, onPlay }) {
    return (
      <div data-testid={`content-row-${title}`}>
        <h2>{title}</h2>
        <button onClick={() => onPlay(content[0], 'vidsrc', 'test-url')}>Play</button>
      </div>
    );
  };
});
jest.mock('../../components/StreamingPlayerModal', () => {
  return function MockStreamingPlayerModal({ isOpen, onClose }) {
    return isOpen ? (
      <div data-testid="player-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});
jest.mock('../../components', () => ({
  Loading: ({ text }) => <div data-testid="loading">{text}</div>,
}));

describe('Discover page', () => {
  const mockContent = {
    featured: [{ id: 1, title: 'Featured Movie', type: 'movie' }],
    trending: [{ id: 2, title: 'Trending Movie', type: 'movie' }],
    popularMovies: [{ id: 3, title: 'Popular Movie', type: 'movie' }],
    popularTV: [{ id: 4, title: 'Popular TV', type: 'tv' }],
    topRated: [{ id: 5, title: 'Top Rated', type: 'movie' }],
    popularAnime: [{ id: 6, title: 'Popular Anime', type: 'tv' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    analytics.trackPageView = jest.fn();
    analytics.trackEvent = jest.fn();
    analytics.trackError = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('shows loading state initially', () => {
    tmdbApi.getHomePageContent = jest.fn(() => new Promise(() => {}));

    render(<DiscoverPage />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });

  test('fetches and displays the active /home route sections', async () => {
    tmdbApi.getHomePageContent = jest.fn().mockResolvedValue(mockContent);

    render(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.getByTestId('featured-hero')).toBeInTheDocument();
    });

    expect(screen.getByTestId('content-row-Trending Now')).toBeInTheDocument();
    expect(screen.getByTestId('content-row-Popular Movies')).toBeInTheDocument();
    expect(screen.getByTestId('content-row-Popular TV Shows')).toBeInTheDocument();
    expect(screen.getByTestId('content-row-Top Rated')).toBeInTheDocument();
    expect(screen.getByTestId('content-row-Popular Anime')).toBeInTheDocument();
    expect(analytics.trackPageView).toHaveBeenCalledWith('/home', 'SkyStream - Discover');
  });

  test('displays the error state and tracks failures', async () => {
    const error = new Error('Failed to fetch');
    tmdbApi.getHomePageContent = jest.fn().mockRejectedValue(error);

    render(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Content')).toBeInTheDocument();
    });

    expect(screen.getByText(/Unable to fetch content/)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(analytics.trackError).toHaveBeenCalledWith(
      'Homepage content fetch failed: Failed to fetch',
      'content_error'
    );
  });

  test('opens and closes the player modal while tracking play analytics', async () => {
    tmdbApi.getHomePageContent = jest.fn().mockResolvedValue(mockContent);

    render(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.getByTestId('featured-hero')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Play')[0]);

    expect(screen.getByTestId('player-modal')).toBeInTheDocument();
    expect(analytics.trackEvent).toHaveBeenCalledWith(
      'content_play',
      expect.objectContaining({
        category: 'streaming',
        label: 'vidsrc',
        content_id: 1,
        content_type: 'movie',
        content_title: 'Featured Movie',
      })
    );

    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('player-modal')).not.toBeInTheDocument();
  });

  test('does not render sections with empty content', async () => {
    tmdbApi.getHomePageContent = jest.fn().mockResolvedValue({
      featured: [],
      trending: [],
      popularMovies: [],
      popularTV: [],
      topRated: [],
      popularAnime: [],
    });

    render(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.queryByTestId('featured-hero')).not.toBeInTheDocument();
    });

    expect(screen.queryByTestId('content-row-Trending Now')).not.toBeInTheDocument();
  });
});
