import { render, screen, fireEvent } from '@testing-library/react';
import StreamingResultCard from '../StreamingResultCard';

// Mock streamingServices
jest.mock('../../services/streamingServices');

// Mock CSS
jest.mock('../StreamingResultCard.css', () => ({}));

describe('StreamingResultCard', () => {
  const mockMovieContent = {
    id: 1,
    title: 'Test Movie',
    type: 'movie',
    poster_path: '/test-poster.jpg',
    release_date: '2024-01-15',
    vote_average: 8.5,
    overview: 'This is a test movie overview that is long enough to be truncated when displayed in the card to ensure proper formatting.',
  };

  const mockTVContent = {
    id: 2,
    title: 'Test TV Show',
    type: 'tv',
    poster_path: '/test-poster-2.jpg',
    release_date: '2023-06-20',
    vote_average: 7.2,
    overview: 'Short overview',
  };

  const mockOnPlay = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders card with movie content', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('Movie')).toBeInTheDocument();
  });

  test('renders card with TV show content', () => {
    render(<StreamingResultCard content={mockTVContent} onPlay={mockOnPlay} />);
    
    expect(screen.getByText('Test TV Show')).toBeInTheDocument();
    expect(screen.getByText('TV')).toBeInTheDocument();
  });

  test('renders poster image when poster_path exists', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);
    
    const image = screen.getByAltText('Test Movie');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/test-poster.jpg');
  });

  test('renders placeholder when poster_path is null', () => {
    const contentWithoutPoster = {
      ...mockMovieContent,
      poster_path: null,
    };
    
    render(<StreamingResultCard content={contentWithoutPoster} onPlay={mockOnPlay} />);
    
    expect(screen.queryByAltText('Test Movie')).not.toBeInTheDocument();
    const placeholder = screen.getByText('Test Movie').closest('.streaming-result-card').querySelector('.streaming-result-card__placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  test('handles image load event', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);
    
    const image = screen.getByAltText('Test Movie');
    fireEvent.load(image);
    
    expect(image).toHaveClass('loaded');
  });

  test('handles image error event', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);
    
    const image = screen.getByAltText('Test Movie');
    fireEvent.error(image);
    
    // After error, placeholder should be shown
    const placeholder = screen.getByText('Test Movie').closest('.streaming-result-card').querySelector('.streaming-result-card__placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  test('truncates long overview text', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);
    
    const overview = screen.getByText(/This is a test movie overview/);
    expect(overview.textContent).toContain('...');
    expect(overview.textContent.length).toBeLessThanOrEqual(123); // 120 chars + "..."
  });

  test('displays short overview without truncation', () => {
    render(<StreamingResultCard content={mockTVContent} onPlay={mockOnPlay} />);
    
    const overview = screen.getByText('Short overview');
    expect(overview.textContent).not.toContain('...');
  });

  test('renders play buttons', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);
    
    expect(screen.getByTitle('Play on Server 1')).toBeInTheDocument();
    expect(screen.getByTitle('Play on Server 2')).toBeInTheDocument();
  });

  test('calls onPlay when Server 1 button is clicked', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);
    
    const server1Button = screen.getByTitle('Play on Server 1');
    fireEvent.click(server1Button);
    
    expect(mockOnPlay).toHaveBeenCalledWith(
      mockMovieContent,
      'vidsrc',
      expect.any(String)
    );
  });

  test('calls onPlay when Server 2 button is clicked', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);
    
    const server2Button = screen.getByTitle('Play on Server 2');
    fireEvent.click(server2Button);
    
    expect(mockOnPlay).toHaveBeenCalledWith(
      mockMovieContent,
      'videasy',
      expect.any(String)
    );
  });

  test('handles content without release date', () => {
    const contentWithoutDate = {
      ...mockMovieContent,
      release_date: null,
    };
    
    render(<StreamingResultCard content={contentWithoutDate} onPlay={mockOnPlay} />);
    
    expect(screen.queryByText('2024')).not.toBeInTheDocument();
  });

  test('handles content without rating', () => {
    const contentWithoutRating = {
      ...mockMovieContent,
      vote_average: null,
    };
    
    render(<StreamingResultCard content={contentWithoutRating} onPlay={mockOnPlay} />);
    
    expect(screen.queryByText('8.5')).not.toBeInTheDocument();
  });

  test('handles content without overview', () => {
    const contentWithoutOverview = {
      ...mockMovieContent,
      overview: null,
    };
    
    render(<StreamingResultCard content={contentWithoutOverview} onPlay={mockOnPlay} />);
    
    expect(screen.queryByText(/This is a test/)).not.toBeInTheDocument();
  });

  test('displays title with title attribute', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);
    
    const titleElement = screen.getByText('Test Movie');
    expect(titleElement).toHaveAttribute('title', 'Test Movie');
  });

  test('rounds rating to one decimal place', () => {
    const contentWithPreciseRating = {
      ...mockMovieContent,
      vote_average: 8.567,
    };
    
    render(<StreamingResultCard content={contentWithPreciseRating} onPlay={mockOnPlay} />);
    
    expect(screen.getByText('8.6')).toBeInTheDocument();
  });

  test('extracts year from release date correctly', () => {
    const contentWithDifferentDate = {
      ...mockMovieContent,
      release_date: '2020-12-25',
    };
    
    render(<StreamingResultCard content={contentWithDifferentDate} onPlay={mockOnPlay} />);
    
    expect(screen.getByText('2020')).toBeInTheDocument();
  });

  test('does not call onPlay when onPlay is not provided', () => {
    render(<StreamingResultCard content={mockMovieContent} />);
    
    const server1Button = screen.getByTitle('Play on Server 1');
    fireEvent.click(server1Button);
    
    // Should not throw error
    expect(mockOnPlay).not.toHaveBeenCalled();
  });

  test('renders all metadata elements when all data is present', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);
    
    // Check that year, rating, and type are all present
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('Movie')).toBeInTheDocument();
  });

  test('applies correct CSS classes', () => {
    const { container } = render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);
    
    expect(container.querySelector('.streaming-result-card')).toBeInTheDocument();
    expect(container.querySelector('.streaming-result-card__poster')).toBeInTheDocument();
    expect(container.querySelector('.streaming-result-card__info')).toBeInTheDocument();
    expect(container.querySelector('.streaming-result-card__meta')).toBeInTheDocument();
  });
});

