import type {
  Movie,
  MovieDetail,
  MovieListResponse,
  MovieListParams,
  MovieSearchParams,
  MovieDiscoverParams,
  Genre,
  Credits,
  TMDBError,
  PosterSize,
  BackdropSize,
  ProfileSize,
} from '@/types/movies';

const BASE_URL = process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL =
  process.env.TMDB_IMAGE_BASE_URL ?? 'https://image.tmdb.org/t/p';
const API_KEY = process.env.TMDB_API_KEY;

if (!API_KEY) {
  throw new Error(
    'Missing environment variable: TMDB_API_KEY. ' +
      'Copy .env.example to .env.local and add your key.'
  );
}

export const ITEMS_PER_PAGE = 20;

function buildUrl(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {}
): string {
  const url = new URL(`${BASE_URL}${endpoint}`);

  url.searchParams.set('api_key', API_KEY!);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function tmdbFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error: TMDBError = await response.json().catch(() => ({
      status_code: response.status,
      status_message: response.statusText,
      success: false as const,
    }));

    throw new Error(
      `TMDB API error ${error.status_code}: ${error.status_message}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * @param path
 * @param size
 * @returns
 */
export function buildImageUrl(
  path: string | null,
  size: PosterSize | BackdropSize | ProfileSize
): string | null {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export async function getGenres(): Promise<Genre[]> {
  const url = buildUrl('/genre/movie/list', { language: 'en-US' });

  const data = await tmdbFetch<{ genres: Genre[] }>(url, {
    next: { tags: ['genres'] },
    cache: 'force-cache',
  });

  return data.genres;
}

export function buildGenreMap(genres: Genre[]): Record<number, string> {
  return genres.reduce<Record<number, string>>((acc, genre) => {
    acc[genre.id] = genre.name;
    return acc;
  }, {});
}

export async function getPopularMovies(
  params: MovieListParams = {}
): Promise<MovieListResponse> {
  const { page = 1, language = 'en-US' } = params;

  const url = buildUrl('/movie/popular', { page, language });

  return tmdbFetch<MovieListResponse>(url, {
    next: { revalidate: 3600, tags: ['movies', 'popular'] },
  });
}

export async function getTopRatedMovies(
  params: MovieListParams = {}
): Promise<MovieListResponse> {
  const { page = 1, language = 'en-US' } = params;

  const url = buildUrl('/movie/top_rated', { page, language });

  return tmdbFetch<MovieListResponse>(url, {
    next: { revalidate: 3600, tags: ['movies', 'top-rated'] },
  });
}

export async function discoverMovies(
  params: MovieDiscoverParams = {}
): Promise<MovieListResponse> {
  const {
    page = 1,
    language = 'en-US',
    with_genres,
    sort_by = 'popularity.desc',
    'vote_average.gte': minRating,
    primary_release_year,
  } = params;

  const url = buildUrl('/discover/movie', {
    page,
    language,
    sort_by,
    with_genres,
    'vote_average.gte': minRating,
    primary_release_year,
  });

  return tmdbFetch<MovieListResponse>(url, {
    next: { revalidate: 3600, tags: ['movies', 'discover'] },
  });
}

export async function searchMovies(
  params: MovieSearchParams
): Promise<MovieListResponse> {
  const { query, page = 1, language = 'en-US', year } = params;

  const url = buildUrl('/search/movie', {
    query,
    page,
    language,
    year,
  });

  return tmdbFetch<MovieListResponse>(url, {
    cache: 'no-store',
  });
}

export async function getMovieById(id: number): Promise<MovieDetail> {
  const url = buildUrl(`/movie/${id}`, {
    language: 'en-US',
    append_to_response: 'credits',
  });

  return tmdbFetch<MovieDetail>(url, {
    next: { tags: [`movie-${id}`] },
    cache: 'force-cache',
  });
}

export async function getMovieCredits(id: number): Promise<Credits> {
  const url = buildUrl(`/movie/${id}/credits`);

  return tmdbFetch<Credits>(url, {
    next: { tags: [`movie-${id}`, 'credits'] },
    cache: 'force-cache',
  });
}

export async function getSimilarMovies(
  id: number,
  params: MovieListParams = {}
): Promise<MovieListResponse> {
  const { page = 1, language = 'en-US' } = params;

  const url = buildUrl(`/movie/${id}/similar`, { page, language });

  return tmdbFetch<MovieListResponse>(url, {
    next: { revalidate: 3600, tags: [`movie-${id}`, 'similar'] },
  });
}

export async function getStaticMovieParams(): Promise<{ id: string }[]> {
  const data = await getPopularMovies({ page: 1 });
  return data.results.map((movie: Movie) => ({ id: String(movie.id) }));
}

/**
 *
 * @param releaseDate
 * @returns             - the year as a string e.g. "2023", or "TBA" if releaseDate is null
 */
export function formatReleaseYear(releaseDate: string | null | undefined): string {
  if (!releaseDate) return 'TBA';
  return releaseDate.slice(0, 4);
}

/**
 *
 * @param minutes
 * @returns         - formatted runtime string e.g. "2h 15m", or "N/A" if null
 */
export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/**
 *
 * @param rating - average rating number from TMDB (0-10, may be null)
 * @returns       - formatted rating with 1 decimal place, or "N/A" if null
 */
export function formatRating(rating: number | null | undefined): string {
  if (!rating) return 'N/A';
  return rating.toFixed(1);
}