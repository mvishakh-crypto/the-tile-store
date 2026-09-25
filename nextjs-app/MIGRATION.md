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

## Phase 2 onward — NOT STARTED

Route skeleton, data fetching, SEO system, interactive features, admin
panel, deployment config, parity testing, cutover — all still ahead, per
the full plan. Nothing beyond the scaffold above should be assumed done.
