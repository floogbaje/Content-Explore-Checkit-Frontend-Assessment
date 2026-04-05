// 404 NOT FOUND PAGE
//
// Next.js renders this automatically when:
//   - notFound() is called from a Server Component
//     (used in app/movies/[id]/page.tsx for invalid
//     or non-existent movie IDs)
//   - A route simply doesn't exist
//
// Kept intentionally simple — a 404 page should
// get the user back on track quickly, not distract
// them with elaborate design.

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Page Not Found | Content Explorer',
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 text-center">

      {/* Large 404 */}
      <p className="text-8xl font-bold tracking-tight text-gray-800 select-none">
        404
      </p>

      {/* Heading */}
      <h1 className="mt-4 text-2xl font-semibold text-white">
        Page not found
      </h1>

      {/* Explanation */}
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-400">
        The movie or page you&apos;re looking for doesn&apos;t exist,
        may have been removed, or the URL might be incorrect.
      </p>

      {/* Action */}
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to movies
      </Link>

    </main>
  );
}
