import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieCard, type MovieCardProps } from './MovieCard';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    priority,
    ...rest
  }: {
    src: string;
    alt: string;
    priority?: boolean;
    [key: string]: unknown;
  }) => (
    <img
      src={src}
      alt={alt}
      data-priority={priority ? 'true' : 'false'}
      data-testid="movie-image"
    />
  ),
}));


vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));


const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
};

const BASE_PROPS: MovieCardProps = {
  id: 550,
  title: 'Fight Club',
  posterPath: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  releaseYear: '1999',
  rating: 8.4,
  genreIds: [28, 12],
  genreMap: GENRE_MAP,
  priority: false,
};

function renderCard(overrides: Partial<MovieCardProps> = {}) {
  return render(<MovieCard {...BASE_PROPS} {...overrides} />);
}

describe('MovieCard', () => {

  describe('renders core content from props', () => {
    it('renders the movie title', () => {
      renderCard();
      expect(
        screen.getByRole('heading', { name: /Fight Club/i })
      ).toBeInTheDocument();
    });

    it('renders the release year', () => {
      renderCard();
      expect(screen.getByText('1999')).toBeInTheDocument();
    });

    it('renders the rating value formatted to 1 decimal place', () => {
      renderCard();
      expect(screen.getByText('8.4')).toBeInTheDocument();
    });

    it('renders the poster image with the correct src', () => {
      renderCard();
      const img = screen.getByTestId('movie-image');
      expect(img).toHaveAttribute('src', BASE_PROPS.posterPath);
    });

    it('renders a descriptive alt text when poster is available', () => {
      renderCard();
      const img = screen.getByTestId('movie-image');
      expect(img).toHaveAttribute('alt', 'Fight Club poster');
    });
  });

  describe('null posterPath fallback', () => {
    it('uses the fallback svg src when posterPath is null', () => {
      renderCard({ posterPath: null });
      const img = screen.getByTestId('movie-image');
      expect(img).toHaveAttribute('src', '/images/poster-fallback.svg');
    });

    it('uses fallback alt text when posterPath is null', () => {
      renderCard({ posterPath: null });
      const img = screen.getByTestId('movie-image');
      expect(img).toHaveAttribute(
        'alt',
        'Fight Club — no poster available'
      );
    });
  });

  describe('rating badge colour', () => {
    it('applies green for rating >= 7', () => {
      renderCard({ rating: 7.0 });
      expect(screen.getByText('7.0')).toHaveClass('text-green-400');
    });

    it('applies green for rating well above 7', () => {
      renderCard({ rating: 9.2 });
      expect(screen.getByText('9.2')).toHaveClass('text-green-400');
    });

    it('applies yellow for rating >= 5 and < 7', () => {
      renderCard({ rating: 6.5 });
      expect(screen.getByText('6.5')).toHaveClass('text-yellow-400');
    });

    it('applies yellow for rating of exactly 5', () => {
      renderCard({ rating: 5.0 });
      expect(screen.getByText('5.0')).toHaveClass('text-yellow-400');
    });

    it('applies red for rating < 5', () => {
      renderCard({ rating: 3.1 });
      expect(screen.getByText('3.1')).toHaveClass('text-red-400');
    });

    it('renders N/A when rating is 0', () => {
      renderCard({ rating: 0 });
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('genre tags', () => {
    it('renders genre names resolved from genreMap', () => {
      renderCard({ genreIds: [28, 12] });
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Adventure')).toBeInTheDocument();
    });

    it('caps genre display at 2 tags even when more IDs are provided', () => {
      renderCard({ genreIds: [28, 12, 16] });
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Adventure')).toBeInTheDocument();
      expect(screen.queryByText('Animation')).not.toBeInTheDocument();
    });

    it('renders no genre list when genreIds is empty', () => {
      renderCard({ genreIds: [] });
      expect(
        screen.queryByRole('list', { name: /genres/i })
      ).not.toBeInTheDocument();
    });

    it('skips genre IDs with no matching entry in genreMap', () => {
      renderCard({ genreIds: [999, 28] });
      expect(screen.queryByText('undefined')).not.toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('navigation link', () => {
    it('links to the correct detail route', () => {
      renderCard({ id: 550 });
      expect(screen.getByRole('link')).toHaveAttribute('href', '/movies/550');
    });

    it('includes title and year in the accessible link label', () => {
      renderCard();
      expect(
        screen.getByRole('link', { name: /Fight Club \(1999\)/i })
      ).toBeInTheDocument();
    });
  });

  describe('priority prop', () => {
    it('defaults priority to false', () => {
      renderCard({ priority: false });
      expect(screen.getByTestId('movie-image')).toHaveAttribute(
        'data-priority',
        'false'
      );
    });

    it('passes priority=true through to the image when set', () => {
      renderCard({ priority: true });
      expect(screen.getByTestId('movie-image')).toHaveAttribute(
        'data-priority',
        'true'
      );
    });
  });

  describe('snapshot', () => {
    it('matches snapshot with all props', () => {
      const { container } = renderCard();
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with null posterPath', () => {
      const { container } = renderCard({ posterPath: null });
      expect(container.firstChild).toMatchSnapshot();
    });
  });

});
