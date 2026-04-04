// ROUTE-LEVEL SKELETON LOADER
//
// Next.js automatically renders this while page.tsx is
// fetching data on the server. It replaces bare spinners
// with a layout-accurate skeleton that prevents CLS —
// the skeleton occupies the same space as real cards,
// so the layout doesn't shift when content arrives.


export default function Loading() {
  // Render 20 skeleton cards — matches TMDB's default page size
  // so the skeleton layout matches the real content layout exactly.
  const skeletonCards = Array.from({ length: 20 }, (_, i) => i);

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Sticky header skeleton */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {/* Title skeleton */}
              <div className="h-8 w-48 animate-pulse rounded-md bg-gray-800" />
              {/* Subtitle skeleton */}
              <div className="mt-1.5 h-4 w-32 animate-pulse rounded-md bg-gray-800" />
            </div>
            {/* SearchBar skeleton */}
            <div className="h-10 w-full max-w-xs animate-pulse rounded-lg bg-gray-800" />
          </div>

          {/* Genre filter skeleton */}
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="h-8 w-20 animate-pulse rounded-full bg-gray-800"
              />
            ))}
          </div>
        </div>
      </header>

      {/* Results section skeleton */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Result count skeleton */}
        <div className="mb-6 h-4 w-40 animate-pulse rounded-md bg-gray-800" />

        {/* Card grid skeleton — matches real grid breakpoints exactly */}
        <ul
          role="list"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-label="Loading movies"
          aria-busy="true"
        >
          {skeletonCards.map((i) => (
            <li key={i}>
              <SkeletonCard />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

// ── Skeleton card ──
// Matches the visual dimensions of MovieCard so there's
// zero layout shift when real cards replace the skeletons.

function SkeletonCard() {
  return (
    <div
      className="overflow-hidden rounded-lg bg-gray-900"
      aria-hidden="true"
    >
      {/* Poster area — same aspect ratio as a movie poster (2:3) */}
      <div className="aspect-[2/3] w-full animate-pulse bg-gray-800" />

      {/* Card body */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-gray-800" />
        {/* Subtitle row — year + rating */}
        <div className="flex justify-between">
          <div className="h-3 w-10 animate-pulse rounded-md bg-gray-800" />
          <div className="h-3 w-10 animate-pulse rounded-md bg-gray-800" />
        </div>
        {/* Genre tags */}
        <div className="flex gap-1.5">
          <div className="h-5 w-14 animate-pulse rounded-full bg-gray-800" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
