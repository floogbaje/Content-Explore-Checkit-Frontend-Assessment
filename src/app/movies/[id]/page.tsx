import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getMovieById,
  getStaticMovieParams,
  getSimilarMovies,
  buildImageUrl,
  formatReleaseYear,
  formatRuntime,
  formatRating,
} from '@/lib/tmdb';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import { MovieCard } from '@/components/MovieCard/MovieCard';
import type { MovieDetail, CastMember } from '@/types/movies';

interface PageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  return getStaticMovieParams();
}

// ── Dynamic metadata ───────────────────────────
// generateMetadata runs on the server before render.
// It receives the same params as the page component.
// Next.js deduplicates the fetch — getMovieById is
// called once even though both functions use it,
// because Next.js caches fetch() calls within a
// single request lifecycle.

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const id = Number(params.id);

  // Return minimal metadata if the ID is invalid
  // to avoid throwing during metadata generation.
  if (isNaN(id)) {
    return { title: 'Movie not found' };
  }

  // Wrap in try/catch — metadata generation should
  // never throw, even if the API call fails.
  try {
    const movie = await getMovieById(id);

    const posterUrl = buildImageUrl(movie.poster_path, 'w500');
    const backdropUrl = buildImageUrl(movie.backdrop_path, 'w1280');

    return {
      title: `${movie.title} (${formatReleaseYear(movie.release_date)})`,
      description:
        movie.overview ||
        `Details, cast, and ratings for ${movie.title}.`,
      openGraph: {
        title: movie.title,
        description: movie.overview || '',
        type: 'video.movie',
        // og:image — backdrop preferred for OG (wider aspect ratio),
        // falling back to poster, then no image.
        images: backdropUrl
          ? [{ url: backdropUrl, width: 1280, height: 720, alt: movie.title }]
          : posterUrl
          ? [{ url: posterUrl, width: 500, height: 750, alt: movie.title }]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: movie.title,
        description: movie.overview || '',
        images: backdropUrl ? [backdropUrl] : [],
      },
    };
  } catch {
    return {
      title: 'Movie — Content Explorer',
      description: 'Movie details powered by TMDB.',
    };
  }
}

// ── Page component ──

export default async function MovieDetailPage({ params }: PageProps) {
  const id = Number(params.id);

  // notFound() renders the nearest not-found.tsx boundary.
  // Handles malformed routes like /movies/abc.
  if (isNaN(id)) notFound();

  // Fetch movie detail and similar movies in parallel.
  // getMovieById uses append_to_response=credits so
  // cast arrives with the movie — no second fetch needed.
  const [movie, similarData] = await Promise.all([
    getMovieById(id).catch(() => null),
    getSimilarMovies(id, { page: 1 }).catch(() => null),
  ]);

  // Movie not found — render 404.
  if (!movie) notFound();

  const posterUrl   = buildImageUrl(movie.poster_path, 'w500');
  const backdropUrl = buildImageUrl(movie.backdrop_path, 'w1280');
  const releaseYear = formatReleaseYear(movie.release_date);
  const runtime     = formatRuntime(movie.runtime);
  const rating      = formatRating(movie.vote_average);

  // Cast — show top 10 billed actors only.
  // The full cast list can be hundreds of entries.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cast: CastMember[] = ((movie as any).credits?.cast ?? []).slice(0, 10);

  // Director from crew
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const director = ((movie as any).credits?.crew ?? []).find(
    (m: { job: string }) => m.job === 'Director'
  );

  const similarMovies = similarData?.results.slice(0, 4) ?? [];

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* ── BACKDROP ── */}
      {backdropUrl && (
        <div className="relative h-[40vh] w-full overflow-hidden sm:h-[50vh]">
          <Image
            src={backdropUrl}
            alt={`${movie.title} backdrop`}
            fill
            priority            // above the fold — critical for LCP
            sizes="100vw"
            className="object-cover"
          />
          {/* Gradient overlay so text above is readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">

        {/* Breadcrumb — pull up into backdrop area */}
        <div className={backdropUrl ? '-mt-6 relative z-10' : 'pt-8'}>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: movie.title },
            ]}
          />
        </div>

        {/* ── HERO ROW ── */}
        <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">

          {/* Poster */}
          <div className="relative mx-auto w-48 flex-shrink-0 overflow-hidden rounded-lg sm:mx-0 sm:w-56">
            <div className="aspect-[2/3] w-full bg-gray-800">
              <Image
                src={posterUrl ?? '/images/poster-fallback.svg'}
                alt={posterUrl ? `${movie.title} poster` : `${movie.title} — no poster`}
                fill
                sizes="(max-width: 640px) 192px, 224px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Movie info */}
          <div className="flex-1 min-w-0">

            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {movie.title}
            </h1>

            {/* Tagline */}
            {movie.tagline && (
              <p className="mt-1 text-base italic text-gray-400">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
              <span>{releaseYear}</span>
              <span aria-hidden="true">·</span>
              <span>{runtime}</span>
              {director && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Dir. {director.name}</span>
                </>
              )}
            </div>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md bg-yellow-400/10 px-2.5 py-1">
                <svg
                  className="h-4 w-4 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-yellow-400">
                  {rating}
                </span>
                <span className="text-xs text-gray-500">
                  / 10
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {movie.vote_count.toLocaleString()} votes
              </span>
            </div>

            {/* Genres */}
            {movie.genres.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Genres">
                {movie.genres.map((genre) => (
                  <li
                    key={genre.id}
                    className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300"
                  >
                    {genre.name}
                  </li>
                ))}
              </ul>
            )}

            {/* Overview */}
            {movie.overview && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Overview
                </h2>
                <p className="text-sm leading-relaxed text-gray-300">
                  {movie.overview}
                </p>
              </div>
            )}

            {/* Additional details */}
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
              {movie.status && (
                <div>
                  <dt className="font-medium text-gray-500">Status</dt>
                  <dd className="mt-0.5 text-gray-300">{movie.status}</dd>
                </div>
              )}
              {movie.original_language && (
                <div>
                  <dt className="font-medium text-gray-500">Language</dt>
                  <dd className="mt-0.5 text-gray-300 uppercase">
                    {movie.original_language}
                  </dd>
                </div>
              )}
              {movie.budget > 0 && (
                <div>
                  <dt className="font-medium text-gray-500">Budget</dt>
                  <dd className="mt-0.5 text-gray-300">
                    ${movie.budget.toLocaleString()}
                  </dd>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <dt className="font-medium text-gray-500">Revenue</dt>
                  <dd className="mt-0.5 text-gray-300">
                    ${movie.revenue.toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* ── CAST ── */}
        {cast.length > 0 && (
          <section className="mt-12" aria-labelledby="cast-heading">
            <h2
              id="cast-heading"
              className="mb-6 text-lg font-semibold"
            >
              Cast
            </h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {cast.map((member) => {
                const profileUrl = buildImageUrl(member.profile_path, 'w185');
                return (
                  <li key={member.id} className="text-center">
                    {/* Profile image */}
                    <div className="relative mx-auto mb-2 h-24 w-24 overflow-hidden rounded-full bg-gray-800">
                      <Image
                        src={profileUrl ?? '/images/poster-fallback.svg'}
                        alt={member.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs font-medium text-white line-clamp-1">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {member.character}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* ── SIMILAR MOVIES ── */}
        {similarMovies.length > 0 && (
          <section className="mt-14" aria-labelledby="similar-heading">
            <h2
              id="similar-heading"
              className="mb-6 text-lg font-semibold"
            >
              You might also like
            </h2>
            <ul
              className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
              role="list"
            >
              {similarMovies.map((film, index) => {
                return (
                  <li key={film.id}>
                    <MovieCard
                      id={film.id}
                      title={film.title}
                      posterPath={buildImageUrl(film.poster_path, 'w500')}
                      releaseYear={formatReleaseYear(film.release_date)}
                      rating={Number(formatRating(film.vote_average))}
                      genreIds={film.genre_ids}
                      genreMap={{}}
                      priority={index < 2}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        )}

      </div>
    </main>
  );
}
