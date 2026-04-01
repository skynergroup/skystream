import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => mockPathname),
}));

jest.mock('next/link', () => {
  return function MockLink({ href, className, children }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

jest.mock('../Layout.css', () => ({}));
jest.mock('../ThemeToggle', () => {
  return function MockThemeToggle() {
    return <div data-testid="theme-toggle">Theme Toggle</div>;
  };
});

const renderLayout = () =>
  render(
    <Layout>
      <div>Test Content</div>
    </Layout>
  );

describe('Layout', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  test('renders logo, navigation, children, footer, and theme toggle', () => {
    renderLayout();

    expect(screen.getByRole('heading', { name: 'SkyStream' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'SkyStream' })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('link', { name: /discover/i })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('link', { name: /search/i })).toHaveAttribute('href', '/');
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(
      screen.getByText(/SkyStream - Search and stream your favorite content instantly/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Content provided by third-party services\. We do not host any content\./)
    ).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  test('highlights Discover when pathname is /home', () => {
    mockPathname = '/home';

    renderLayout();

    expect(screen.getByRole('link', { name: /discover/i })).toHaveClass(
      'layout__nav-link--active'
    );
    expect(screen.getByRole('link', { name: /search/i })).not.toHaveClass(
      'layout__nav-link--active'
    );
  });

  test('highlights Search when pathname is /', () => {
    renderLayout();

    expect(screen.getByRole('link', { name: /search/i })).toHaveClass(
      'layout__nav-link--active'
    );
    expect(screen.getByRole('link', { name: /discover/i })).not.toHaveClass(
      'layout__nav-link--active'
    );
  });
});
