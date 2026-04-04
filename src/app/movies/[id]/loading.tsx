// Rendered by Next.js while the detail page server
// component is fetching data. Matches the visual
// structure of the real page exactly — same backdrop
// area height, same hero row layout, same cast grid —
// so there is zero layout shift when content arrives.

export default function DetailLoading() {
  return (
    <main className="min-h-screen bg-gray-950 text-white" aria-busy="true">

      {/* Backdrop skeleton */}
      <div className="h-[40vh] w-full animate-pulse bg-gray-800 sm:h-[50vh]" />

      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">

        {/* Breadcrumb skeleton */}
        <div className="-mt-6 relative z-10 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 animate-pulse rounded bg-gray-700" />
            <div className="h-4 w-3 animate-pulse rounded bg-gray-700" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />
          </div>
        </div>

        {/* Hero row skeleton */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">

          {/* Poster skeleton */}
          <div className="relative mx-auto w-48 flex-shrink-0 overflow-hidden rounded-lg sm:mx-0 sm:w-56">
            <div className="aspect-[2/3] w-full animate-pulse bg-gray-800" />
          </div>

          {/* Info skeleton */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Title */}
            <div className="h-9 w-3/4 animate-pulse rounded-md bg-gray-800" />
            {/* Tagline */}
            <div className="h-4 w-1/2 animate-pulse rounded-md bg-gray-800" />
            {/* Meta row */}
            <div className="flex gap-4">
              <div className="h-4 w-10 animate-pulse rounded-md bg-gray-800" />
              <div className="h-4 w-14 animate-pulse rounded-md bg-gray-800" />
              <div className="h-4 w-24 animate-pulse rounded-md bg-gray-800" />
            </div>
            {/* Rating */}
            <div className="h-8 w-24 animate-pulse rounded-md bg-gray-800" />
            {/* Genre tags */}
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-7 w-20 animate-pulse rounded-full bg-gray-800"
                />
              ))}
            </div>
            {/* Overview */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full animate-pulse rounded-md bg-gray-800" />
              <div className="h-4 w-full animate-pulse rounded-md bg-gray-800" />
              <div className="h-4 w-4/5 animate-pulse rounded-md bg-gray-800" />
              <div className="h-4 w-2/3 animate-pulse rounded-md bg-gray-800" />
            </div>
            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-700" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cast section skeleton */}
        <div className="mt-12">
          <div className="mb-6 h-6 w-16 animate-pulse rounded-md bg-gray-800" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                {/* Profile circle */}
                <div className="h-24 w-24 animate-pulse rounded-full bg-gray-800" />
                {/* Name */}
                <div className="h-3 w-20 animate-pulse rounded bg-gray-800" />
                {/* Character */}
                <div className="h-3 w-16 animate-pulse rounded bg-gray-700" />
              </div>
            ))}
          </div>
        </div>

        {/* Similar movies skeleton */}
        <div className="mt-14">
          <div className="mb-6 h-6 w-40 animate-pulse rounded-md bg-gray-800" />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="overflow-hidden rounded-lg bg-gray-900">
                <div className="aspect-[2/3] w-full animate-pulse bg-gray-800" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-800" />
                  <div className="h-3 w-10 animate-pulse rounded bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
