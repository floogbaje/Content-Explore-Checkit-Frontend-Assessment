'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  query: string;
  genre: string;
  sort: string;
}

const WINDOW = 2;

export function Pagination({
  currentPage,
  totalPages,
  query,
  genre,
  sort,
}: PaginationProps) {
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  function pageUrl(page: number): string {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }

    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function getPageNumbers(): (number | null)[] {
    const pages: (number | null)[] = [];

    const windowStart = Math.max(2, currentPage - WINDOW);
    const windowEnd   = Math.min(totalPages - 1, currentPage + WINDOW);

    pages.push(1);

    if (windowStart > 2) pages.push(null);

    for (let p = windowStart; p <= windowEnd; p++) {
      pages.push(p);
    }

    if (windowEnd < totalPages - 1) pages.push(null);

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }

  const pageNumbers  = getPageNumbers();
  const hasPrev      = currentPage > 1;
  const hasNext      = currentPage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1"
    >

      {/* Previous */}
      {hasPrev ? (
        <Link
          href={pageUrl(currentPage - 1)}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 text-gray-400 transition-colors hover:border-gray-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          aria-label="Previous page"
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-gray-800 text-gray-700"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      )}

      {/* Page numbers */}
      {pageNumbers.map((page, index) => {
        // Ellipsis gap
        if (page === null) {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-gray-600"
              aria-hidden="true"
            >
              &hellip;
            </span>
          );
        }

        const isActive = page === currentPage;

        return isActive ? (
          <span
            key={page}
            aria-current="page"
            aria-label={`Page ${page}, current page`}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-semibold text-gray-950"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={pageUrl(page)}
            aria-label={`Page ${page}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 text-sm text-gray-400 transition-colors hover:border-gray-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {page}
          </Link>
        );
      })}

      {/* Next */}
      {hasNext ? (
        <Link
          href={pageUrl(currentPage + 1)}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 text-gray-400 transition-colors hover:border-gray-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          aria-label="Next page"
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-gray-800 text-gray-700"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}

    </nav>
  );
}
