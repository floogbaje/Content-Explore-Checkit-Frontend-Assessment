export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null; 
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
  video: boolean;
}

export interface MovieDetail extends Omit<Movie, 'genre_ids'> {
  genres: Genre[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  budget: number; 
  revenue: number;
  homepage: string | null;
  imdb_id: string | null;
  spoken_languages: SpokenLanguage[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  belongs_to_collection: Collection | null;
}

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

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
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

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type MovieListResponse = PaginatedResponse<Movie>;

export interface MovieListParams {
  page?: number;
  language?: string;
}

export interface MovieSearchParams extends MovieListParams {
  query: string;
  year?: number;
}

export interface MovieDiscoverParams extends MovieListParams {
  with_genres?: string;
  sort_by?: SortOption;
  'vote_average.gte'?: number;
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


export interface FilterState {
  query: string;
  genre: string;
  sortBy: SortOption;
  page: number;
}

export interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  rating: number;
  genreIds: number[];
}


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


export interface TMDBError {
  status_code: number;
  status_message: string;
  success: false;
}