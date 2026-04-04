'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  defaultValue = '',
  placeholder = 'Search movies...',
  debounceMs = 300,
}: SearchBarProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(defaultValue);

  const debouncedValue = useDebounce(value, debounceMs);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedValue) {
      params.set('query', debouncedValue);
    } else {
      params.delete('query');
    }

    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  function handleClear() {
    setValue('');
  }

  return (
    <div
      className="relative w-full max-w-xs"
      role="search"
      aria-label="Search movies"
    >

      <div
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center"
        aria-hidden="true"
      >
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search movies"
        className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-9 pr-9 text-sm text-white placeholder-gray-500 transition-colors focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
