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

Components (52 files, ~16 touching browser APIs directly and needing
`'use client'`) — not started yet.
