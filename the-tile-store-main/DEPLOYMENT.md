# The Tile Store — Deployment Guide

Enterprise-grade Supabase + Vite + Gemini AI deployment guide for production.

---

## Prerequisites

- Node.js 18+
- Supabase account (https://supabase.com)
- Gemini API key (https://aistudio.google.com/apikey)
- Supabase CLI (optional, for Edge Functions): `npm install -g supabase`

---

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com → New Project
2. Choose a region close to your users (e.g., `ap-south-1` for India)
3. Save the **Project URL** and **anon key** from **Settings → API**
4. Save the **service_role key** for Edge Functions (keep this secret)

---

## Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase Connection
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key

# Gemini AI (for AI Image Search & Embeddings)
VITE_GEMINI_API_KEY=AIzaSy...your-gemini-key
```

---

## Step 3: Run Database Migrations

In your **Supabase Dashboard → SQL Editor**, run each migration file **in order**:

| Order | File | Contents |
|-------|------|----------|
| 1 | `supabase/migrations/001_initial_schema.sql` | 30+ tables, enums, views, triggers |
| 2 | `supabase/migrations/002_rls_policies.sql` | Row-Level Security for all tables |
| 3 | `supabase/migrations/003_indexes.sql` | Performance indexes (HNSW, GIN, BTree) |
| 4 | `supabase/migrations/004_seed_data.sql` | 20 products, 6 brands, testimonials |
| 5 | `supabase/migrations/005_functions.sql` | Stored functions (search, recommendations) |
| 6 | `supabase/migrations/006_storage_policies.sql` | Storage bucket RLS + recently_viewed table |

> ⚠️ **Run in order.** Migration 6 depends on tables created in migration 1.

---

## Step 4: Create Storage Buckets

In **Supabase Dashboard → Storage**, create 4 public buckets:

| Bucket Name | Access | Purpose |
|-------------|--------|---------|
| `tile-images` | Public | Product tile images (admin uploads later) |
| `room-uploads` | Public | User room photos for AI Visualizer |
| `moodboards` | Public | Exported moodboard PNG screenshots |
| `blog-covers` | Public | Blog article cover images |

**Via Supabase CLI** (alternative):
```bash
supabase storage create tile-images --public
supabase storage create room-uploads --public
supabase storage create moodboards --public
supabase storage create blog-covers --public
```

> ℹ️ **Product images are uploaded later** by the admin via the admin panel or directly to the `tile-images` bucket. The platform gracefully shows placeholder images until real uploads happen.

---

## Step 5: Deploy Edge Functions

### Configure Edge Function Secrets

```bash
supabase secrets set GEMINI_API_KEY=AIzaSy...your-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

### Deploy All Edge Functions

```bash
# Link to your project first
supabase link --project-ref your-project-id

# Deploy all functions
supabase functions deploy ai-image-search
supabase functions deploy submit-inquiry
supabase functions deploy send-booking-confirmation
supabase functions deploy sitemap
supabase functions deploy generate-embedding
```

### Edge Function Endpoints

| Function | Trigger | Purpose |
|----------|---------|---------|
| `ai-image-search` | POST | Vector similarity search for AI image upload |
| `submit-inquiry` | POST | Process and validate inquiry form submissions |
| `send-booking-confirmation` | POST | Email confirmation for consultation bookings |
| `sitemap` | GET | Dynamic XML sitemap with all product URLs |
| `generate-embedding` | POST | Gemini text-embedding-004 → stores in pgvector |

---

## Step 6: Generate AI Embeddings (Post-Launch)

After uploading product images and populating the database, generate embeddings for semantic search:

```typescript
// In your admin panel or a one-time script:
import { adminGenerateAllEmbeddings } from './src/services/adminService';

const result = await adminGenerateAllEmbeddings((completed, total) => {
  console.log(`Progress: ${completed}/${total}`);
});

console.log(`Done: ${result.completed} succeeded, ${result.failed} failed`);
```

Or trigger individual product embeddings via the Edge Function:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-embedding \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"productId": "uuid-here", "text": "Statuario marble, polished, white, classic"}'
```

---

## Step 7: Upload Product Images

Images are uploaded to the `tile-images` Supabase Storage bucket. Use the `imageUploadService`:

```typescript
import { uploadProductImage } from './src/services/imageUploadService';

// Upload a single product image
const result = await uploadProductImage(file, productId, {
  isPrimary: true,
  altText: 'Statuario Imperial Gold — front view',
  onProgress: (pct) => console.log(`${pct}%`),
});

if (result.success) {
  console.log('Image URL:', result.url);
}
```

---

## Step 8: Deploy Frontend

### Vercel (Recommended)

```bash
npm run build

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Set the following **Environment Variables** in Vercel Dashboard:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
```

### Netlify

```bash
npm run build
netlify deploy --dir=dist --prod
```

### Static Hosting (any CDN)

```bash
npm run build
# Upload the ./dist folder to your CDN/hosting provider
```

---

## Architecture Overview

```
Frontend (Vite + React + TailwindCSS)
├── src/lib/         → Supabase client, React Query, validation, SEO, analytics
├── src/services/    → 10 service files (product, search, AI, blog, admin, image upload...)
├── src/hooks/       → 10 React hooks (products, wishlist, compare, moodboard, recently viewed...)
├── src/components/  → 24 UI components (DO NOT MODIFY — approved luxury frontend)
└── src/pages/       → 4 page components

Backend (Supabase)
├── PostgreSQL        → 30+ tables, pgvector (768-dim), full-text search
├── Row Level Security → All tables protected
├── Storage Buckets   → 4 buckets with per-bucket RLS policies
└── Edge Functions    → 5 Deno functions (AI search, email, sitemap, embeddings)
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `VITE_GEMINI_API_KEY` | For AI search | Gemini API key for image analysis |
| `GEMINI_API_KEY` | Edge Functions | Server-side Gemini key (set via `supabase secrets`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | Service role key (never expose client-side) |

---

## Graceful Degradation

The platform works **without Supabase** configured — all services fall back to:
- Static product data from `src/data/tiles.ts`
- localStorage for wishlist, cart, compare, recently viewed, moodboards
- Mock responses for bookings and inquiries

This means the frontend always works, even before connecting the database.

---

## Admin Panel (Future)

The backend is fully admin-ready. All required APIs exist in `src/services/adminService.ts`:

- `adminCreateProduct()` / `adminUpdateProduct()` / `adminDeleteProduct()`
- `adminGetInquiries()` / `adminUpdateInquiryStatus()`
- `adminGetBookings()` / `adminUpdateBookingStatus()`
- `adminGetArchitectApplications()` / `adminApprovePartner()`
- `adminGetAnalyticsSummary()` — dashboard stats
- `adminGenerateProductEmbedding()` — trigger AI embedding
- `adminGenerateAllEmbeddings()` — bulk re-index all products
- `adminRebuildRecommendations()` — rebuild AI recommendation pairs

The admin dashboard can be built as a separate protected route at `#/admin` using these APIs.
