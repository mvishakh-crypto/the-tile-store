# Next.js SSR Migration — Status

See `tile-store-nextjs-ssr-migration-plan.md` (shared separately in chat) for
the full 10-phase plan. This file tracks what's actually landed in this repo.

## Phase 1 — Scaffold: DONE

- Fresh Next.js App Router project (`next build` verified clean —
  TypeScript check + production build both pass with zero errors).
- Tailwind v4 (CSS-first `@theme` config, matching the existing setup —
  no `tailwind.config.js` needed).
- Ported the real design system from the Vite app's `src/index.css`
  verbatim: the gold color scale, ivory/charcoal/warmwhite tokens, dark
  mode CSS variables, Playfair Display/Inter/JetBrains Mono fonts, the
  custom animations (float, slow-zoom, marquee), glassmorphism utilities.
  This is the actual design system, not a placeholder — verified the
  build still passes with it in place.
- `next/font/google` (the default Geist font Next.js ships with) was
  removed rather than ported — the site doesn't use Geist, and the real
  fonts are already loaded via the ported CSS's own `@import` from Google
  Fonts, same mechanism as the Vite app already used.
- `.env.local.example` — ported variable names from the Vite app's
  `.env.example`, updated to Next.js convention: `VITE_*` → `NEXT_PUBLIC_*`
  for anything client-exposed. Added `SUPABASE_SERVICE_ROLE_KEY` as a
  genuinely server-only variable, which the old client-only Vite app had
  no safe way to use at all.

## Phase 2 — Route skeleton: DONE

- Real file-based routes for every path from Phase 6's scheme: `/`,
  `/collections`, `/product/[slug]`, `/partners`, `/calculator`, `/blog`,
  `/blog/read/[slug]`.
- Verified beyond just "it builds" this time — actually ran `next start`
  and curled every route:
  - All 7 return HTTP 200; an unknown path correctly returns 404 (Next's
    own not-found handling, working out of the box).
  - `/` and `/collections`'s raw HTML (curled directly, no JS execution)
    already contains real `<title>`/`<meta>` tags in the initial
    response — confirms the actual point of this migration is working,
    not just assumed.
  - `/product/[slug]` and `/blog/read/[slug]` are marked dynamic (ƒ) by
    Next's own build output, not static — and the slug value was
    confirmed present in the server-rendered payload for a test URL
    (`/product/kajaria-enormearenado-grey`), so the dynamic segment is
    genuinely reaching the server-rendered output, not just routing
    correctly.
- All pages are still placeholder content — Phase 2's job was proving the
  routes resolve and render server-side, not building real UI.

## Phase 3 — Shared components: IN PROGRESS

Foundational layer ported first (everything else depends on it):
- `types/index.ts`, `lib/database.types.ts`, `lib/analytics.ts`,
  `lib/queryClient.ts`, `lib/rateLimiter.ts`, `lib/validation.ts`,
  `data/tiles.ts` — copied as-is, no Next.js-specific changes needed.
- `lib/supabase.ts` — the one file needing real changes: `VITE_*` env
  vars → `NEXT_PUBLIC_*`, and `getSessionId()` (touches `localStorage`
  directly) now throws explicitly if called during server-side rendering
  instead of silently misbehaving, so a mistake here fails loud in
  development rather than shipping a bug.
- `lib/seo-legacy.ts` — the old `seo.ts` kept for reference during the
  port, explicitly named to make clear it's being replaced (Phase 5), not
  the real SEO system going forward.
- Verified with both `next build` and a standalone `npx tsc --noEmit` —
  confirmed via `tsconfig.json`'s `include` pattern that these files are
  genuinely type-checked project-wide, not just silently unreferenced.

**Process note, logged honestly:** early in this phase, work continued in
this directory without re-checking-out the `nextjs-migration` branch
first (a prior step had switched to `main`, which doesn't track this
directory at all). Running `npm install` in that state overwrote
`package.json` with a fresh one containing only the newly-added packages
— `next`/`react`/all scripts briefly gone. Caught before committing
anything: discarded the untracked directory, re-checked-out the branch
(restoring the real Phase 1–2 state from git with nothing lost), and
redid the foundational-layer work correctly. No bad commit ever went out
because of this, but the mistake happened and is logged here rather than
quietly omitted.

## Phase 3 — Shared components: DONE

All 55 files ported: 11 services, 15 hooks, 25 components, 4 page-level
composites (`page-components/` — not `pages/`, to avoid colliding with
Next.js's legacy Pages Router naming). Directory structure preserves the
same sibling relationships as the Vite app (`lib/`, `services/`, `hooks/`,
`components/`, `types/`, `data/` all siblings) specifically so every
existing relative import resolves unchanged — confirmed, zero import path
rewrites were needed anywhere.

Only one Vite-specific line existed in this entire batch:
`aiService.ts`'s Gemini key (`import.meta.env.VITE_*` ->
`process.env.NEXT_PUBLIC_*`). Confirmed via a full-tree grep both before
and after, not assumed.

`'use client'` added to all 44 hook/component/page-component files —
every one of them needed it (none were purely server-renderable as
written). Boundary *optimization* (pushing `'use client'` down to just
the interactive leaf elements, letting more of the tree be genuinely
server-rendered) is a valid future refinement, not done here — Phase 3's
job was getting everything compiling and functioning as client
components first.

**Two real issues found and fixed, not papered over:**

1. Three hook files (`useCompare.ts`, `useMoodboard.ts`,
   `useRecentlyViewed.ts`) already had `// @ts-nocheck` in the original
   codebase (those Supabase tables aren't in the generated
   `database.types.ts`, so the original author suppressed the resulting
   errors). Blanket-prepending `'use client'` above that comment broke
   it — `'use client'` is a real statement, not a comment, so it pushed
   `@ts-nocheck` out of the leading position TypeScript requires to honor
   it, and 9 real (pre-existing, previously-suppressed) type errors
   surfaced. Fixed by reordering to `// @ts-nocheck` first, `'use
   client'` second — satisfies both TypeScript's requirement and Next's
   (which tolerates a leading comment before the directive).

2. `useSearch.ts` had one genuine type gap (`SearchFilters` passed where
   `queryKeys.search.results()` expects `Record<string, unknown>`) that
   does NOT reproduce in the original Vite project — spent real time
   trying to find the environmental cause (TypeScript version, `strict`
   mode, exact package versions, even a byte-diff of the files — all
   ruled out, all identical between both projects) without finding a
   definitive answer. Time-boxed the investigation and fixed the actual
   type gap directly at the call site instead (a narrow, correct cast —
   `queryKeys.search.results()` only needs the value to be serializable
   into a cache key, it doesn't structurally depend on `SearchFilters`'
   shape). Correct either way, whatever the environmental cause turns
   out to be.

Verified with `npx tsc --noEmit` (full project, confirmed via
`tsconfig.json`'s `include` that these files are actually checked) AND
`next build` — both clean, zero errors, after the fixes above.

**Honest scope note:** none of these 55 files are wired into any actual
page yet — Phase 2's placeholder pages still don't import them. This
phase verified they compile correctly in isolation, not that they render
correctly composed together (that needs real data flowing through them,
which is Phase 4's job). Don't read "Phase 3 done" as "the site works" —
it isn't wired up yet.

## Phase 4 — Data fetching: IN PROGRESS

**Product page (`/product/[slug]`) — done and verified end-to-end.**

- `app/product/[slug]/page.tsx`: real async Server Component —
  `getProductByIdOrSlug()` awaited directly server-side, `notFound()` on a
  miss, `generateMetadata()` built from the real product (title,
  description, canonical, OG image), Product + BreadcrumbList JSON-LD
  rendered server-side as an inline script tag from the same data.
- `ProductPageClient.tsx`: thin client wrapper — receives the
  server-fetched product/related-products as props, translates the
  app's existing `'#/...'` route-key strings to real `router.push()`
  calls, and explicitly stubs the wishlist/compare/inquiry-cart
  handlers with a comment marking them Phase 6's job — not silently
  faked as working.
- `ProductDetailPage.tsx` and `useProduct`/`useRelatedProducts` updated
  to accept optional `initialData`, seeding React Query's cache from the
  server fetch — first paint already has real content, client-side
  re-fetching/revalidation still works normally after hydration.

**One real bug found and fixed before it ever reached production:**
`lib/queryClient.ts` exported a single module-level `QueryClient`
singleton — copied straight from the Vite app, where that's correct
(one browser tab, one client, for the app's whole lifetime). In Next.js,
Server Components for *every* concurrent request on the same server
process would have shared that one instance — one visitor's cached data
leaking into another's response. Caught via a real 500 error
("No QueryClient set") while testing, traced to its actual root cause
rather than papered over, and fixed properly: `getQueryClient()` now
returns a fresh client per request on the server, and a stable
browser-side singleton on the client (the standard documented pattern
for React Query + Next.js App Router). Wired in via a new
`components/Providers.tsx` in the root layout.

Verified with a real running server, not just a build:
- `/product/t1` (a real product from the static fallback data, since
  this sandbox has no live Supabase connection) returns 200.
- `/product/does-not-exist-xyz` correctly returns 404.
- Curled directly, no JS execution: the real product title is in
  `<title>`, the real product name is in the Product JSON-LD, and a
  full, correct BreadcrumbList is present. This is the actual point of
  the whole migration, confirmed working on a real request, not assumed.
- Server log clean — no errors, including after the QueryClientProvider
  fix.

**Debugging note, logged honestly:** getting to a real product initially
returned 404 even for a real product id, because the first id I tested
with (`b1`) turned out to belong to the `premiumBrands` array in
`tiles.ts`, not `tileProducts` — a wrong assumption on my part about the
sample data, not a bug in the code. Caught by adding temporary debug
logging (since removed) rather than guessing, confirmed against the
actual data, then retested with a real product id (`t1`).

**Not done yet:** collections, home, partners, calculator, blog, and
blog-post routes — still Phase 2's placeholder content. Same
server-fetch-plus-client-wrapper pattern established here carries over
to each of them.

## Phase 5 onward — NOT STARTED
