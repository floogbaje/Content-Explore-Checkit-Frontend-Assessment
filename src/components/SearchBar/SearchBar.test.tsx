import {
  render,
  screen,
  fireEvent,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchBar } from './SearchBar';

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () => mockSearchParams,
}));

beforeEach(() => {
  vi.useFakeTimers();
  mockPush.mockClear();
  mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
});

afterEach(() => {
  vi.useRealTimers();
});


function renderSearchBar(props = {}) {
  return render(<SearchBar {...props} />);
}

describe('SearchBar', () => {
  describe('rendering', () => {
    it('renders a search input', () => {
      renderSearchBar();
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('renders with the default placeholder', () => {
      renderSearchBar();
      expect(
        screen.getByPlaceholderText('Search movies...')
      ).toBeInTheDocument();
    });

    it('renders with a custom placeholder when provided', () => {
      renderSearchBar({ placeholder: 'Find a film...' });
      expect(
        screen.getByPlaceholderText('Find a film...')
      ).toBeInTheDocument();
    });

    it('renders with defaultValue pre-filled in the input', () => {
      renderSearchBar({ defaultValue: 'inception' });
      expect(screen.getByRole('searchbox')).toHaveValue('inception');
    });

    it('does not render the clear button when input is empty', () => {
      renderSearchBar();
      expect(
        screen.queryByRole('button', { name: /clear search/i })
      ).not.toBeInTheDocument();
    });

    it('has a search landmark role for accessibility', () => {
      renderSearchBar();
      expect(screen.getByRole('search')).toBeInTheDocument();
    });
  });

  describe('input updates immediately on keystroke', () => {
    it('reflects the typed value in the input immediately', async () => {
      renderSearchBar();
      const input = screen.getByRole('searchbox');

      fireEvent.change(input, { target: { value: 'inc' } });

      expect(input).toHaveValue('inc');
    });

    it('shows the clear button as soon as input has a value', () => {
      renderSearchBar();
      const input = screen.getByRole('searchbox');

      fireEvent.change(input, { target: { value: 'i' } });

      expect(
        screen.getByRole('button', { name: /clear search/i })
      ).toBeInTheDocument();
    });
  });

  describe('does not push URL update before debounce delay', () => {
    it('does not call router.push immediately after typing', () => {
      renderSearchBar({ debounceMs: 300 });
      const input = screen.getByRole('searchbox');

      fireEvent.change(input, { target: { value: 'inception' } });

      act(() => vi.advanceTimersByTime(299));

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('does not call router.push during rapid successive keystrokes', () => {
      renderSearchBar({ debounceMs: 300 });
      const input = screen.getByRole('searchbox');

      fireEvent.change(input, { target: { value: 'i' } });
      act(() => vi.advanceTimersByTime(100));
      fireEvent.change(input, { target: { value: 'in' } });
      act(() => vi.advanceTimersByTime(100));
      fireEvent.change(input, { target: { value: 'inc' } });
      act(() => vi.advanceTimersByTime(100));
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('pushes URL update after debounce delay', () => {
    it('calls router.push with ?query= after the debounce delay', () => {
      renderSearchBar({ debounceMs: 300 });
      const input = screen.getByRole('searchbox');

      fireEvent.change(input, { target: { value: 'inception' } });
      act(() => vi.advanceTimersByTime(300));

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('query=inception')
      );
    });

    it('fires only once even if debounce resets multiple times', () => {
      renderSearchBar({ debounceMs: 300 });
      const input = screen.getByRole('searchbox');

      fireEvent.change(input, { target: { value: 'i' } });
      act(() => vi.advanceTimersByTime(100));
      fireEvent.change(input, { target: { value: 'in' } });
      act(() => vi.advanceTimersByTime(100));
      fireEvent.change(input, { target: { value: 'inc' } });

      act(() => vi.advanceTimersByTime(300));

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('query=inc')
      );
    });
  });

  describe('clear button', () => {
    it('clears the input value when clicked', () => {
      renderSearchBar({ defaultValue: 'inception' });
      const input = screen.getByRole('searchbox');
      const clearBtn = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearBtn);

      expect(input).toHaveValue('');
    });

    it('hides the clear button after clearing', () => {
      renderSearchBar({ defaultValue: 'inception' });

      const clearBtn = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearBtn);

      expect(
        screen.queryByRole('button', { name: /clear search/i })
      ).not.toBeInTheDocument();
    });

    it('removes ?query from the URL after debounce delay when cleared', () => {
      renderSearchBar({ defaultValue: 'inception', debounceMs: 300 });

      const clearBtn = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearBtn);
      act(() => vi.advanceTimersByTime(300));

      expect(mockPush).toHaveBeenCalledWith(
        expect.not.stringContaining('query=')
      );
    });
  });

  describe('preserves existing URL params on search', () => {
    it('keeps ?genre param when adding a query', () => {
      mockSearchParams.set('genre', '28');

      renderSearchBar({ debounceMs: 300 });
      const input = screen.getByRole('searchbox');

      fireEvent.change(input, { target: { value: 'action' } });
      act(() => vi.advanceTimersByTime(300));

      const calledUrl = mockPush.mock.calls[0][0] as string;
      expect(calledUrl).toContain('genre=28');
      expect(calledUrl).toContain('query=action');
    });
  });

  describe('URL param management', () => {
    it('resets ?page to 1 when a new search query is entered', () => {
      mockSearchParams.set('page', '3');

      renderSearchBar({ debounceMs: 300 });
      const input = screen.getByRole('searchbox');

      fireEvent.change(input, { target: { value: 'interstellar' } });
      act(() => vi.advanceTimersByTime(300));

      const calledUrl = mockPush.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('page=');
    });

    it('does not push a URL update on initial render', () => {
      renderSearchBar({ defaultValue: 'inception', debounceMs: 300 });

      act(() => vi.advanceTimersByTime(300));

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

});
