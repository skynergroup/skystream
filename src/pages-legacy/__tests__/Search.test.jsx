import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SearchPage from '../../app/page';
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

describe('Search page', () => {
  const mockSearchResults = {
    results: [
      { id: 1, title: 'Avengers', media_type: 'movie' },
      { id: 2, title: 'Avengers 2', media_type: 'movie' },
      { id: 3, title: 'Actor Name', media_type: 'person' },
    ],
  };

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

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('renders the active root search route and tracks the page view', () => {
    render(<SearchPage />);

    expect(screen.getByText('SkyStream')).toBeInTheDocument();
    expect(screen.getByText(/Search and stream your favorite/)).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(analytics.trackPageView).toHaveBeenCalledWith('/', 'SkyStream - Search');
  });

  test('performs search and displays transformed results', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue(mockSearchResults);

    render(<SearchPage />);
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('result-card-1')).toBeInTheDocument();
    });

    expect(screen.getByText('Avengers')).toBeInTheDocument();
    expect(screen.getByText('Avengers 2')).toBeInTheDocument();
    expect(screen.getByText('Search Results (2)')).toBeInTheDocument();
    expect(screen.queryByText('Actor Name')).not.toBeInTheDocument();
    expect(analytics.trackSearch).toHaveBeenCalledWith('avengers', 2);
  });

  test('shows loading state during search', async () => {
    tmdbApi.search = jest.fn(() => new Promise(() => {}));

    render(<SearchPage />);
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  test('displays the empty state when no results are returned', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue({ results: [] });

    render(<SearchPage />);
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('No Results Found')).toBeInTheDocument();
    });

    expect(screen.getByText(/Try searching with different keywords/)).toBeInTheDocument();
  });

  test('clears rendered results when clear is clicked', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue(mockSearchResults);

    render(<SearchPage />);
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('result-card-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clear'));

    expect(screen.queryByTestId('result-card-1')).not.toBeInTheDocument();
    expect(screen.queryByText(/Search Results/)).not.toBeInTheDocument();
  });

  test('shows an error state and tracks the failure when search fails', async () => {
    const error = new Error('Search failed');
    tmdbApi.search = jest.fn().mockRejectedValue(error);

    render(<SearchPage />);
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Search Failed')).toBeInTheDocument();
    });

    expect(screen.getByText(/Unable to search content/)).toBeInTheDocument();
    expect(analytics.trackError).toHaveBeenCalledWith(
      'Search failed: Search failed',
      'search_error'
    );
  });

  test('opens and closes the player modal while tracking play analytics', async () => {
    tmdbApi.search = jest.fn().mockResolvedValue(mockSearchResults);

    render(<SearchPage />);
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('result-card-1')).toBeInTheDocument();
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
        content_title: 'Avengers',
      })
    );

    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('player-modal')).not.toBeInTheDocument();
  });
});
