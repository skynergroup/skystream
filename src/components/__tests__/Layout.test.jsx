import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

jest.mock('../Layout.css', () => ({}));
jest.mock('../ThemeToggle', () => {
  return function MockThemeToggle() {
    return <div data-testid="theme-toggle">Theme Toggle</div>;
  };
});

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('Layout', () => {
  test('renders logo', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('SkyStream')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.queryByText('Live TV')).not.toBeInTheDocument();
  });

  test('renders children content', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders footer', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText(/SkyStream - Search and stream/)).toBeInTheDocument();
    expect(screen.getByText(/Content provided by third-party services/)).toBeInTheDocument();
  });

  test('renders theme toggle', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  test('highlights active Discover link when on /home', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>,
      { route: '/home' }
    );

    const discoverLink = screen.getByText('Discover').closest('a');
    expect(discoverLink).toHaveClass('layout__nav-link--active');
  });

  test('highlights active Search link when on /', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>,
      { route: '/' }
    );

    const searchLink = screen.getByText('Search').closest('a');
    expect(searchLink).toHaveClass('layout__nav-link--active');
  });
});
