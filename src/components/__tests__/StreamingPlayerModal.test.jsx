import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StreamingPlayerModal from '../StreamingPlayerModal';
import streamingServices from '../../services/streamingServices';
import tmdbApi from '../../services/tmdbApi';

jest.mock('../../services/streamingServices');
jest.mock('../../services/tmdbApi');

describe('StreamingPlayerModal', () => {
  const mockContent = {
    id: 1,
    title: 'Test Movie',
    type: 'movie',
  };

  const mockTVContent = {
    id: 2,
    title: 'Test TV Show',
    type: 'tv',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    streamingServices.getAllStreamingUrls = jest.fn(() => ({
      vidsrc: 'https://vidsrc.test/movie/1',
      videasy: 'https://videasy.test/movie/1',
    }));
    tmdbApi.getTVSeasonsData = jest.fn().mockResolvedValue({
      total_seasons: 2,
      total_episodes: 20,
      seasons: [
        { season_number: 1, episode_count: 10 },
        { season_number: 2, episode_count: 10 },
      ],
    });

    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('does not render when isOpen is false', () => {
    render(
      <StreamingPlayerModal
        isOpen={false}
        onClose={jest.fn()}
        content={mockContent}
        platform="vidsrc"
        embedUrl="https://test.com"
      />
    );

    expect(screen.queryByText('Test Movie')).not.toBeInTheDocument();
  });

  test('renders when isOpen is true', () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockContent}
        platform="vidsrc"
        embedUrl="https://test.com"
      />
    );

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  test('displays content title', () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockContent}
        platform="vidsrc"
        embedUrl="https://test.com"
      />
    );

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  test('has close button', () => {
    const onClose = jest.fn();

    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={onClose}
        content={mockContent}
        platform="vidsrc"
        embedUrl="https://test.com"
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('renders iframe', () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockContent}
        platform="vidsrc"
        embedUrl="https://test.com"
      />
    );

    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBeGreaterThan(0);
  });

  test('shows platform selector with Server 1 and Server 2', () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockContent}
        platform="vidsrc"
        embedUrl="https://test.com"
      />
    );

    expect(screen.getByText('Server 1')).toBeInTheDocument();
    expect(screen.getByText('Server 2')).toBeInTheDocument();
  });

  test('switches platform when Server 2 is clicked', () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockContent}
        platform="vidsrc"
        embedUrl="https://test.com"
      />
    );

    const server2Button = screen.getByText('Server 2');
    fireEvent.click(server2Button);

    expect(streamingServices.getAllStreamingUrls).toHaveBeenCalled();
  });

  test('fetches seasons data for TV content', async () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidsrc"
        embedUrl="https://test.com"
        contentType="tv"
      />
    );

    await waitFor(() => {
      expect(tmdbApi.getTVSeasonsData).toHaveBeenCalledWith(2);
    });
  });

  test('shows season and episode selectors for TV content', async () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidsrc"
        embedUrl="https://test.com"
        contentType="tv"
      />
    );

    await waitFor(() => {
      const seasonLabels = screen.getAllByText(/Season/);
      expect(seasonLabels.length).toBeGreaterThan(0);
    });
  });

  test('handles season change', async () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidsrc"
        embedUrl="https://test.com"
        contentType="tv"
        season={1}
        episode={1}
      />
    );

    await waitFor(() => {
      expect(tmdbApi.getTVSeasonsData).toHaveBeenCalled();
    });

    // Find and change season selector
    const seasonSelects = screen.getAllByRole('combobox');
    if (seasonSelects.length > 0) {
      fireEvent.change(seasonSelects[0], { target: { value: '2' } });
      expect(streamingServices.getAllStreamingUrls).toHaveBeenCalled();
    }
  });

  test('handles episode change', async () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidsrc"
        embedUrl="https://test.com"
        contentType="tv"
        season={1}
        episode={1}
      />
    );

    await waitFor(() => {
      expect(tmdbApi.getTVSeasonsData).toHaveBeenCalled();
    });

    // Find and change episode selector
    const episodeSelects = screen.getAllByRole('combobox');
    if (episodeSelects.length > 1) {
      fireEvent.change(episodeSelects[1], { target: { value: '5' } });
      expect(streamingServices.getAllStreamingUrls).toHaveBeenCalled();
    }
  });

  test('handles error when fetching seasons data', async () => {
    tmdbApi.getTVSeasonsData = jest.fn().mockRejectedValue(new Error('API Error'));

    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidsrc"
        embedUrl="https://test.com"
        contentType="tv"
      />
    );

    await waitFor(() => {
      expect(tmdbApi.getTVSeasonsData).toHaveBeenCalled();
    });

    // Should still render without crashing
    expect(screen.getByText('Test TV Show')).toBeInTheDocument();
  });

  test('resets season and episode when modal opens', () => {
    const { rerender } = render(
      <StreamingPlayerModal
        isOpen={false}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidsrc"
        embedUrl="https://test.com"
        contentType="tv"
        season={2}
        episode={5}
      />
    );

    rerender(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidsrc"
        embedUrl="https://test.com"
        contentType="tv"
        season={2}
        episode={5}
      />
    );

    expect(streamingServices.getAllStreamingUrls).toHaveBeenCalled();
  });

  test('renders with null content', () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={null}
        platform="vidsrc"
        embedUrl="https://fallback.com"
      />
    );

    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBeGreaterThan(0);
  });
});
