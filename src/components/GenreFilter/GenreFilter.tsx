'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Genre, SortOption } from '@/types/movies';

interface GenreFilterProps {
  genres: Genre[];
  activeGenre: string;
  activeSort: SortOption;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Most Popular',   value: 'popularity.desc'    },
  { label: 'Highest Rated',  value: 'vote_average.desc'  },
  { label: 'Newest First',   value: 'release_date.desc'  },
  { label: 'Oldest First',   value: 'release_date.asc'   },
];

export function GenreFilter({
  genres,
  activeGenre,
  activeSort,
}: GenreFilterProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  function buildUrl(changes: Record<string, string | null>): string {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete('page');

    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function handleGenreClick(genreId: number) {
    const id = String(genreId);
    const isActive = activeGenre === id;

    router.push(
      buildUrl({
        genre: isActive ? null : id,
        query: null,
      })
    );
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(buildUrl({ sort: e.target.value }));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        role="group"
        aria-label="Filter by genre"
      >

        <GenrePill
          label="All"
          isActive={activeGenre === ''}
          onClick={() => router.push(buildUrl({ genre: null, query: null }))}
        />

        {genres.map((genre) => (
          <GenrePill
            key={genre.id}
            label={genre.name}
            isActive={activeGenre === String(genre.id)}
            onClick={() => handleGenreClick(genre.id)}
          />
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <label
          htmlFor="sort-select"
          className="text-xs font-medium text-gray-500 whitespace-nowrap"
        >
          Sort by
        </label>
        <select
          id="sort-select"
          value={activeSort}
          onChange={handleSortChange}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          aria-label="Sort movies"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
}

interface GenrePillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function GenrePill({ label, isActive, onClick }: GenrePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={[
        'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
        'transition-colors duration-150 whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
        isActive
          ? 'bg-white text-gray-950'
          : 'border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
