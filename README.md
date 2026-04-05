# Content Explorer — Checkit Frontend Assessment
A high performance movie discovery  web application

**Candidate:** Flo Ogbaje
**Role:** Frontend Engineer
**API:** [The Movie Database (TMDB)](https://developer.themoviedb.org/docs)
**Stack:** Next.js 15 · TypeScript · Tailwind CSS · TanStack Query
**Deployment:** https://content-explore-checkit-frontend-as.vercel.app/
**Repository:** Content-Explore-Checkit-Frontend-Assessment

## Quick Start


## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Listing page (SSR)
│   ├── loading.tsx               # Route-level skeleton loader
│   ├── error.tsx                 # Route-level error boundary
│   └── movies/
│       └── [id]/
│           ├── page.tsx          # Detail page (SSR + metadata export)
│           └── loading.tsx       # Detail skeleton
├── components/
│   ├── MovieCard/
│   │   ├── MovieCard.tsx
│   │   └── MovieCard.test.tsx
│   ├── SearchBar/
│   │   ├── SearchBar.tsx
│   │   └── SearchBar.test.tsx
│   ├── Pagination/
│   │   └── Pagination.tsx
│   ├── Breadcrumb/
│   │   └── Breadcrumb.tsx
│   └── EmptyState/
│       └── EmptyState.tsx
├── lib/
│   └── tmdb.ts                   # All TMDB fetch calls — components never call fetch() directly
├── hooks/
│   └── useDebounce.ts            # Debounce hook used by SearchBar
└── types/
    └── movie.ts                  # All shared TypeScript types
```

**Why this structure:**
Components are co-located with their tests. The `lib/` layer abstracts all API calls so components stay declarative and testable. A component should never know or care how data is fetched, only what shape it arrives in. All shared types live in `types/` as a single source of truth across server and client components. Hooks are separated from components because a debounce or query hook is a behaviour, not a UI concern.

## API Choice — TMDB

TMDB was chosen for three reasons. First, it provides high-quality poster images through its own CDN (`image.tmdb.org`), making `next/image` optimisation straightforward and producing measurably good LCP scores. Second, it has rich, well-structured metadata per item  (title, release year, genres, rating, overview), giving each card and detail page genuine depth without fabricating content. Third, it supports server-side pagination natively via a `page` query parameter, which maps cleanly to URL driven state.

## Architecture Decisions

### Server vs Client Components

The listing page (`app/page.tsx`) and detail page (`app/movies/[id]/page.tsx`) are **Server Components**. Data is fetched at the server level using native `fetch` with Next.js cache directives. The initial HTML delivered to the browser contains real content, not a loading spinner waiting for a client-side request. This directly improves LCP and is better for SEO.

Search and filter interactions are handled client-side via `useSearchParams` so the URL reflects state without a full page reload. The `SearchBar` component is a Client Component (`'use client'`) isolated at the leaf level, keeping the rest of the tree server-rendered.

### Pagination vs Infinite Scroll

**Pagination was chosen over infinite scroll** for three reasons:

1. **Shareable URLs** : each page is addressable (`?page=2&query=inception`), meaning results are bookmarkable and shareable. Infinite scroll cannot produce this without significant additional complexity.
2. **Accessibility** : pagination is navigable by keyboard and screen reader without special handling. Infinite scroll requires careful focus management to avoid trapping keyboard users at the bottom of a growing list.
3. **Predictability** : users know where they are in the dataset. Infinite scroll creates disorientation, particularly when a user wants to return to a previously seen item.

### State Management

React built-ins (`useState`) are used for local UI state. URL search params (`useSearchParams`, `useRouter`) serve as the source of truth for search query, active filter, and current page; making state shareable, bookmarkable, and resilient to page refresh without any global state library. TanStack Query manages client side data fetching where needed, providing caching, background refetching, and clean loading/error/empty states out of the box.

### Data Fetching Strategy

All TMDB API calls are abstracted behind `lib/tmdb.ts`. Components receive typed data, they never call `fetch()` directly. This keeps components declarative, makes the API layer independently testable, and means a future API change requires editing one file rather than hunting through JSX.

## Performance Optimisations

### 1. `next/image` with explicit dimensions and `priority`

All movie poster images use `next/image` with explicit `width` and `height` props. Above the fold poster images on the listing page are marked `priority={true}`, which causes Next.js to inject a `<link rel="preload">` tag in the document head, eliminating the LCP penalty of late-discovered images.

A fallback placeholder is defined for posters that TMDB returns as null, preventing layout shift when an image is missing.

**Impact:** Directly reduces LCP. Eliminates image-related CLS.

### 2. `next/font` for typography

The application font is loaded via `next/font/google`, which self-hosts font files and injects `font-display: swap` automatically. This eliminates the flash of unstyled text (FOUT) and the layout shift it causes.

**Impact:** Reduces CLS.

### 3. Next.js `fetch` cache directives

Different routes have different data freshness requirements:

| Route | Cache Setting | Reason |

| Listing page (`/`) | `revalidate: 3600` | Popular movies list changes infrequently; 1hr ISR balances freshness with performance |
| Detail page (`/movies/[id]`) | `force-cache` | Movie metadata is stable; title, cast, and overview do not change |
| Search results | `no-store` | Search results must reflect the current query and cannot be shared across users |

**Impact:** Reduces server load and improves TTFB on cached routes.

## Deployment — Vercel

Vercel was chosen over Cloudflare Workers deliberately: deployment reliability within the assessment window took priority. The OpenNext Cloudflare adapter has known edge cases with Next.js App Router's streaming behaviour that would introduce meaningful debugging risk within a 72hr constraint. A clean, fully functional Vercel deployment demonstrates the same Next.js knowledge. The platform differs but the cache semantics, SSR behaviour, and performance characteristics are equivalent.

In a production context, I would implement Cloudflare Workers edge caching as follows:

- Use `@opennextjs/cloudflare` to wrap the Next.js build for Workers compatibility
- Add `Cache-Control: public, max-age=31536000, immutable` headers for static assets via `next.config.js`
- Implement `caches.default` in a Cloudflare Worker for the listing page with a TTL matching the `revalidate` value
- Add an `x-cache-status: HIT | MISS` response header for cache observability via DevTools or `curl`

## Testing

Tests are written with **Vitest** and **React Testing Library**.

Two components are tested with full coverage:

### `MovieCard`
- Renders title, rating, and release year correctly from props
- Renders the fallback placeholder when `posterPath` is null
- Matches snapshot for visual regression baseline

### `SearchBar`
- Renders the input element correctly
- Calls `onChange` after the debounce delay (≥300ms) when the user types
- Does not call `onChange` before the debounce delay has elapsed
- Clears the input and calls `onChange` with an empty string when the clear button is clicked

**Why these two components:**
`MovieCard` is the most-rendered component in the application. A bug here affects every item on the listing page. `SearchBar` contains the debounce logic, which is the most behavioural, non-visual piece of the frontend and the most likely to break silently under a refactor.

**Running tests:**
```bash
npm run test            # run all tests
npm run test:coverage   # run with coverage report
```

## Trade-offs & Known Limitations

| Area | Decision Made | What I'd Do With More Time |

| Search | Client-side debounced search via TMDB API | Add URL persistence of search state on navigation back from detail page |
| Images | `next/image` with TMDB CDN | Implement blurhash placeholders using TMDB's `blur_hash` field for smoother loading |
| Error handling | Route-level `error.tsx` boundary | Add per-component error boundaries with retry logic for partial failures |
| Testing | 2 components at 100% coverage | Expand to integration tests covering the full search → results → detail navigation flow |
| Accessibility | Semantic HTML and ARIA labels applied throughout | Run full axe-core audit and document any remaining violations |
| Deployment | Vercel for reliability | Cloudflare Workers with OpenNext for true edge delivery in production |


## Environment Variables

```bash
# .env.example
TMDB_API_KEY=           # Required. Free key at https://developer.themoviedb.org
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

*Submitted by Flo Ogbaje — April 2026*
