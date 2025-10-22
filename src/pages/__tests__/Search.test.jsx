import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Search from '../Search';
import tmdbApi from '../../services/tmdbApi';
import { analytics } from '../../utils';

jest.mock('../../services/tmdbApi');
jest.mock('../../utils');
jest.mock('../../components/StreamingSearchBar', () => {
  return function MockStreamingSearchBar({ onSearch, onClear }) {
    return (
      <div data-testid="search-bar">
        <button onClick={() => onSearch('avengers')}>Search</button>
        <button onClick={onClear}>Clear</button>
      </div>
    );
  };
});
jest.mock('../../components/StreamingResultCard', () => {
  return function MockStreamingResultCard({ content, onPlay }) {
    return (
      <div data-testid={`result-card-${content.id}`}>
        <h3>{content.title}</h3>
        <button onClick={() => onPlay(content, 'vidsrc', 'test-url')}>Play</button>
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

describe('Search', () => {
  const mockSearchResults = {
    results: [
      { id: 1, title: 'Avengers', media_type: 'movie' },
      { id: 2, title: 'Avengers 2', media_type: 'movie' },
      { id: 3, title: 'Actor Name', media_type: 'person' },
    ],
  };

  const mockTransformedResults = [
    { id: 1, title: 'Avengers', type: 'movie' },
    { id: 2, title: 'Avengers 2', type: 'movie' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    analytics.trackPageView = jest.fn();
    analytics.trackSearch = jest.fn();
    analytics.trackEvent = jest.fn();
    analytics.trackError = jest.fn();
    tmdbApi.transformContent = jest.fn(item => ({
      id: item.id,
      title: item.title,
      type: item.media_type,
    }));

    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('renders search page with title and search bar', () => {
    render(<Search />);

    expect(screen.getByText('SkyStream')).toBeInTheDocument();
    expect(screen.getByText(/Search and stream your favorite/)).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  test('tracks page view on mount', () => {
    render(<Search />);

    expect(analytics.trackPageView).toHaveBeenCalledWith('/', 'SkyStream - Search');
  });

  test('performs search and displays results', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue(mockSearchResults);

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('result-card-1')).toBeInTheDocument();
    });

    expect(screen.getByText('Avengers')).toBeInTheDocument();
    expect(screen.getByText('Avengers 2')).toBeInTheDocument();
    expect(screen.getByText('Search Results (2)')).toBeInTheDocument();
  });

  test('filters out person results', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue(mockSearchResults);

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('result-card-1')).toBeInTheDocument();
    });

    expect(screen.queryByText('Actor Name')).not.toBeInTheDocument();
  });

  test('shows loading state during search', async () => {
    tmdbApi.search = jest.fn(() => new Promise(() => {}));

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  test('tracks search analytics', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue(mockSearchResults);

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(analytics.trackSearch).toHaveBeenCalledWith('avengers', 2);
    });
  });

  test('displays error state when search fails', async () => {
    const error = new Error('Search failed');
    tmdbApi.search = jest.fn().mockRejectedValue(error);

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Search Failed')).toBeInTheDocument();
    });

    expect(screen.getByText(/Unable to search content/)).toBeInTheDocument();
  });

  test('tracks error when search fails', async () => {
    const error = new Error('Search failed');
    tmdbApi.search = jest.fn().mockRejectedValue(error);

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(analytics.trackError).toHaveBeenCalledWith(
        'Search failed: Search failed',
        'search_error'
      );
    });
  });

  test('displays no results message when search returns empty', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue({ results: [] });

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('No Results Found')).toBeInTheDocument();
    });

    expect(screen.getByText(/Try searching with different keywords/)).toBeInTheDocument();
  });

  test('clears search results when clear is clicked', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue(mockSearchResults);

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('result-card-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clear'));

    expect(screen.queryByTestId('result-card-1')).not.toBeInTheDocument();
    expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
  });

  test('opens player modal when play is clicked', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue(mockSearchResults);

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('result-card-1')).toBeInTheDocument();
    });

    const playButtons = screen.getAllByText('Play');
    fireEvent.click(playButtons[0]);

    expect(screen.getByTestId('player-modal')).toBeInTheDocument();
  });

  test('closes player modal when close is clicked', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue(mockSearchResults);

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('result-card-1')).toBeInTheDocument();
    });

    const playButtons = screen.getAllByText('Play');
    fireEvent.click(playButtons[0]);

    expect(screen.getByTestId('player-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close'));

    expect(screen.queryByTestId('player-modal')).not.toBeInTheDocument();
  });

  test('tracks play event when content is played', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue(mockSearchResults);

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('result-card-1')).toBeInTheDocument();
    });

    const playButtons = screen.getAllByText('Play');
    fireEvent.click(playButtons[0]);

    expect(analytics.trackEvent).toHaveBeenCalledWith(
      'content_play',
      expect.objectContaining({
        category: 'streaming',
        label: 'vidsrc',
        content_id: 1,
        content_type: 'movie',
        content_title: 'Avengers',
      })
    );
  });

  test('limits results to 20 items', async () => {
    const manyResults = {
      results: Array.from({ length: 30 }, (_, i) => ({
        id: i,
        title: `Movie ${i}`,
        media_type: 'movie',
      })),
    };

    tmdbApi.search = jest.fn().mockResolvedValue(manyResults);

    render(<Search />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Search Results (20)')).toBeInTheDocument();
    });
  });
});
