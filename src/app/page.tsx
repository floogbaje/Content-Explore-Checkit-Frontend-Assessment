import type { Metadata } from 'next';
import type { SortOption } from '@/types/movies';
import {
  getPopularMovies,
  searchMovies,
  discoverMovies,
  getGenres,
  buildGenreMap,
  buildImageUrl,
  formatReleaseYear,
  formatRating,
  ITEMS_PER_PAGE,
} from '@/lib/tmdb';
import { MovieCard } from '@/components/MovieCard/MovieCard';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { GenreFilter } from '@/components/GenreFilter/GenreFilter';
import { Pagination } from '@/components/Pagination/Pagination';
import { EmptyState } from '@/components/EmptyState/EmptyState';

export const metadata: Metadata = {
  title: 'Content Explorer — Discover Movies',
  description:
    'Browse, search, and filter thousands of movies. Powered by TMDB.',
  openGraph: {
    title: 'Content Explorer — Discover Movies',
    description: 'Browse, search, and filter thousands of movies.',
    type: 'website',
  },
};

interface PageProps {
  searchParams: {
    query?: string;
    genre?: string;
    sort?: string;
    page?: string;
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const query   = searchParams.query?.trim() ?? '';
  const genre   = searchParams.genre ?? '';
  const sort    = (searchParams.sort ?? 'popularity.desc') as SortOption;
  const page    = Math.max(1, Number(searchParams.page ?? '1'));
  const [genres, movieData] = await Promise.all([
    getGenres(),
    fetchMovies({ query, genre, sort, page }),
  ]);

  const genreMap   = buildGenreMap(genres);
  const movies     = movieData.results;
  const totalPages = Math.min(movieData.total_pages, 500);

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Content Explorer
              </h1>
              <p className="mt-0.5 text-sm text-gray-400">
                {query
                  ? `Results for "${query}"`
                  : genre
                  ? `Browsing ${genreMap[Number(genre)] ?? 'genre'}`
                  : 'Popular right now'}
              </p>
            </div>

            <SearchBar defaultValue={query} />
          </div>

          <div className="mt-3">
            <GenreFilter
              genres={genres}
              activeGenre={genre}
              activeSort={sort}
            />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {movieData.total_results > 0 && (
          <p className="mb-6 text-sm text-gray-400">
            {movieData.total_results.toLocaleString()} results
            {totalPages > 1 && (
              <span> — page {page} of {totalPages}</span>
            )}
          </p>
        )}

        {movies.length === 0 ? (
          <EmptyState query={query} genre={genreMap[Number(genre)]} />
        ) : (
          <>
            {/*
              Responsive grid:
              - 1 col on mobile  (default)
              - 2 col on tablet  (sm:)
              - 3 col on desktop (lg:)
              - 4 col on wide    (xl:)
            */}
            <ul
              role="list"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {movies.map((movie, index) => (
                <li key={movie.id}>
                  <MovieCard
                    id={movie.id}
                    title={movie.title}
                    posterPath={buildImageUrl(movie.poster_path, 'w500')}
                    releaseYear={formatReleaseYear(movie.release_date)}
                    rating={Number(formatRating(movie.vote_average))}
                    genreIds={movie.genre_ids}
                    genreMap={genreMap}
                    priority={index < 8}
                  />
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  query={query}
                  genre={genre}
                  sort={sort}
                />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

interface FetchMoviesParams {
  query: string;
  genre: string;
  sort: SortOption;
  page: number;
}

async function fetchMovies({ query, genre, sort, page }: FetchMoviesParams) {
  if (query) {
    return searchMovies({ query, page });
  }

  if (genre || sort !== 'popularity.desc') {
    return discoverMovies({
      page,
      sort_by: sort,
      with_genres: genre || undefined,
    });
  }

  return getPopularMovies({ page });
}
