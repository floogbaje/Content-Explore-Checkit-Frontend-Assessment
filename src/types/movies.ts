// types/movie.ts
// All shared TypeScript types for the Content Explorer app.
// These match the TMDB v3 API response shapes exactly.
// No inline type definitions should exist elsewhere in the codebase —
// import from here instead.

// ─────────────────────────────────────────────
// GENRE
// ─────────────────────────────────────────────

export interface Genre {
  id: number;
  name: string;
}

// ─────────────────────────────────────────────
// MOVIE — list item shape
// Returned by /movie/popular, /movie/top_rated,
// /search/movie, /discover/movie
// ─────────────────────────────────────────────

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;           // "YYYY-MM-DD"
  poster_path: string | null;     // e.g. "/abc123.jpg" — prepend TMDB image base URL
  backdrop_path: string | null;
  vote_average: number;           // 0–10
  vote_count: number;
  popularity: number;
  genre_ids: number[];            // list endpoint returns IDs, not full Genre objects
  original_language: string;      // ISO 639-1 e.g. "en"
  adult: boolean;
  video: boolean;
}

// ─────────────────────────────────────────────
// MOVIE DETAIL — full shape
// Returned by /movie/{id}
// Extends Movie but replaces genre_ids with full Genre objects
// and adds fields only present on the detail endpoint
// ─────────────────────────────────────────────

export interface MovieDetail extends Omit<Movie, 'genre_ids'> {
  genres: Genre[];
  runtime: number | null;         // minutes
  tagline: string | null;
  status: string;                 // "Released" | "In Production" | etc.
  budget: number;                 // in USD, 0 if unknown
  revenue: number;                // in USD, 0 if unknown
  homepage: string | null;
  imdb_id: string | null;         // e.g. "tt0111161"
  spoken_languages: SpokenLanguage[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  belongs_to_collection: Collection | null;
}

// ─────────────────────────────────────────────
// SUPPORTING TYPES used in MovieDetail
// ─────────────────────────────────────────────

export interface SpokenLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

// ─────────────────────────────────────────────
// CREDITS
// Returned by /movie/{id}/credits
// ─────────────────────────────────────────────

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;                  // billing order
  known_for_department: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

// ─────────────────────────────────────────────
// PAGINATED RESPONSE
// TMDB wraps list endpoints in a pagination envelope.
// Generic so it works for any list type.
// ─────────────────────────────────────────────

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Convenience aliases for the two shapes you'll use most
export type MovieListResponse = PaginatedResponse<Movie>;

// ─────────────────────────────────────────────
// SEARCH / FILTER PARAMS
// Typed params for the lib/tmdb.ts fetch functions.
// Keeps function signatures clean and avoids loose string args.
// ─────────────────────────────────────────────

export interface MovieListParams {
  page?: number;                  // defaults to 1
  language?: string;              // defaults to "en-US"
}

export interface MovieSearchParams extends MovieListParams {
  query: string;
  year?: number;                  // filter by primary release year
}

export interface MovieDiscoverParams extends MovieListParams {
  with_genres?: string;           // comma-separated genre IDs e.g. "28,12"
  sort_by?: SortOption;
  'vote_average.gte'?: number;    // minimum rating filter
  primary_release_year?: number;
}

export type SortOption =
  | 'popularity.desc'
  | 'popularity.asc'
  | 'release_date.desc'
  | 'release_date.asc'
  | 'vote_average.desc'
  | 'vote_average.asc'
  | 'revenue.desc'
  | 'revenue.asc';

// ─────────────────────────────────────────────
// UI STATE TYPES
// Used by components and hooks — not API shapes.
// Keeps UI concerns out of the API type layer.
// ─────────────────────────────────────────────

// The filter state reflected in the URL search params
export interface FilterState {
  query: string;
  genre: string;                  // genre ID as string, or "" for all
  sortBy: SortOption;
  page: number;
}

// What a MovieCard component expects to receive
// Derived from Movie but explicit about what the card
// actually needs — makes refactoring safer
export interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;            // pre-formatted from release_date
  rating: number;                 // vote_average
  genreIds: number[];
}

// ─────────────────────────────────────────────
// IMAGE HELPERS
// TMDB image sizes supported by their CDN.
// Use these constants instead of hardcoding strings.
// ─────────────────────────────────────────────

export type PosterSize =
  | 'w92'
  | 'w154'
  | 'w185'
  | 'w342'
  | 'w500'
  | 'w780'
  | 'original';

export type BackdropSize =
  | 'w300'
  | 'w780'
  | 'w1280'
  | 'original';

export type ProfileSize =
  | 'w45'
  | 'w185'
  | 'h632'
  | 'original';

// ─────────────────────────────────────────────
// API ERROR
// Shape of TMDB error responses (non-2xx)
// ─────────────────────────────────────────────

export interface TMDBError {
  status_code: number;            // TMDB internal error code
  status_message: string;
  success: false;
}