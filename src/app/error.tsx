
'use client';

import { useEffect } from 'react';
import NextLink from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[ListingPage Error]', error.message);
  }, [error]);

  const isApiError = error.message.includes('TMDB API error');
  const isNetworkError =
    error.message.includes('fetch failed') ||
    error.message.includes('NetworkError');

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md w-full text-center">

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-950">
          <svg
            className="h-8 w-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-white">
          {isNetworkError
            ? "Can't reach the server"
            : isApiError
            ? 'API request failed'
            : 'Something went wrong'}
        </h1>

        <p className="mt-3 text-sm text-gray-400 leading-relaxed">
          {isNetworkError
            ? 'Check your internet connection and try again. If the problem persists, the service may be temporarily unavailable.'
            : isApiError
            ? 'The movie database returned an error. This is usually temporary — try again in a moment.'
            : 'An unexpected error occurred while loading movies. Try refreshing the page.'}
        </p>

        {process.env.NODE_ENV === 'development' && (
          <p className="mt-3 rounded-md bg-gray-900 px-3 py-2 font-mono text-xs text-red-400 text-left break-all">
            {error.message}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Try again
          </button>

          <NextLink
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-600 hover:text-white transition-colors"
          >
            Back to home
          </NextLink>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-600">
            Error reference: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
