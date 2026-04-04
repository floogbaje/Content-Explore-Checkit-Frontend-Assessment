'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  rating: number;
  genreIds: number[];
  genreMap: Record<number, string>;
  priority?: boolean;
}

const FALLBACK_POSTER = '/images/poster-fallback.svg';

const MAX_GENRES = 2;

export function MovieCard({
  id,
  title,
  posterPath,
  releaseYear,
  rating,
  genreIds,
  genreMap,
  priority = false,
}: MovieCardProps) {

  const genres = genreIds
    .slice(0, MAX_GENRES)
    .map((gId) => genreMap[gId])
    .filter(Boolean);

  const ratingColour =
    rating >= 7
      ? 'text-green-400'
      : rating >= 5
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <Link
      href={`/movies/${id}`}
      className="group block overflow-hidden rounded-lg bg-gray-900 ring-1 ring-gray-800 transition-all duration-200 hover:ring-gray-600 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      aria-label={`${title} (${releaseYear}) — rated ${rating}`}
    >
      {/* POSTER */}
      <div className="relative aspect-2/3 w-full overflow-hidden bg-gray-800">
        <Image
          src={posterPath ?? FALLBACK_POSTER}
          alt={posterPath ? `${title} poster` : `${title} — no poster available`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={priority}
          onError={(e) => {
            const img = e.currentTarget;
            img.src = FALLBACK_POSTER;
          }}
        />

        <div
          className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-gray-950/80 px-1.5 py-0.5 backdrop-blur-sm"
          aria-hidden="true"
        >
          <svg
            className="h-3 w-3 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className={`text-xs font-semibold ${ratingColour}`}>
            {rating > 0 ? rating.toFixed(1) : 'N/A'}
          </span>
        </div>
      </div>

      <div className="p-3 space-y-1.5">

        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-gray-200">
          {title}
        </h2>

        <p className="text-xs text-gray-400">
          {releaseYear}
        </p>

        {genres.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Genres">
            {genres.map((genre) => (
              <li
                key={genre}
                className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300"
              >
                {genre}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
