import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock all dependencies
jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

jest.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => null,
}));

jest.mock('../pages', () => ({
  Search: () => <div>Search Page</div>,
  Discover: () => <div>Discover Page</div>,
}));

jest.mock('../components', () => ({
  Layout: ({ children }) => <div data-testid="layout">{children}</div>,
}));

jest.mock('../utils', () => ({
  analytics: {
    init: jest.fn(),
  },
}));

describe('App', () => {
  test('renders without crashing', () => {
    render(<App />);

    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders Search page on root path', () => {
    window.history.pushState({}, 'Test page', '/');
    render(<App />);

    expect(screen.getByText('Search Page')).toBeInTheDocument();
  });

  test('renders Discover page on /home path', () => {
    window.history.pushState({}, 'Test page', '/home');
    render(<App />);

    expect(screen.getByText('Discover Page')).toBeInTheDocument();
  });
});
