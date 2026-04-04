interface EmptyStateProps {
  query?: string;
  genre?: string;
}

export function EmptyState({ query, genre }: EmptyStateProps) {
  const isSearch = Boolean(query);
  const isGenre = Boolean(genre) && !isSearch;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-4 text-4xl">
        🎬
      </div>

      <h2 className="text-xl font-semibold text-white">
        {isSearch
          ? 'No results found'
          : isGenre
          ? `No movies in "${genre}"`
          : 'No movies available'}
      </h2>

      <p className="mt-2 max-w-md text-sm text-gray-400">
        {isSearch
          ? `We couldn’t find anything for "${query}". Try a different keyword.`
          : isGenre
          ? `There are currently no movies available for this genre. Try another one.`
          : 'Try adjusting your filters or come back later.'}
      </p>

      <p className="mt-4 text-xs text-gray-500">
        Tip: Check your spelling or try a broader search.
      </p>
    </div>
  );
}