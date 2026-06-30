// @ts-nocheck
// ============================================================
// Blog Service — CMS-backed blog articles and categories
// ============================================================
import { supabase, isSupabaseConfigured, getPaginationRange } from '../lib/supabase';
import { projectGallery, premiumTestimonials } from '../data/tiles';

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  categoryId: string | null;
  categoryName: string | null;
  authorName: string;
  authorAvatar: string | null;
  readTime: number | null;
  tags: string[];
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

// Static fallback blog data (minimal)
const STATIC_BLOGS: BlogArticle[] = [
  {
    id: 'blog-01',
    title: 'The Geology of Luxury: Understanding Natural Stone Origins',
    slug: 'geology-of-luxury-natural-stone-origins',
    excerpt: 'A deep dive into the geological processes that create the world\'s most coveted marble and stone surfaces.',
    content: '# The Geology of Luxury\n\nMarble is formed over millions of years through metamorphic processes...',
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    categoryId: null,
    categoryName: 'Material Science',
    authorName: 'Atelier Editorial',
    authorAvatar: null,
    readTime: 8,
    tags: ['marble', 'geology', 'natural stone'],
    publishedAt: '2025-06-01T00:00:00Z',
    viewCount: 1420,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'blog-02',
    title: 'Slip Resistance Ratings Explained: R9 to R13 Guide',
    slug: 'slip-resistance-ratings-explained',
    excerpt: 'Everything architects and contractors need to know about anti-slip tile specifications for residential and commercial projects.',
    content: '# Slip Resistance Ratings\n\nThe DIN 51130 rating system classifies tiles...',
    coverImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80',
    categoryId: null,
    categoryName: 'Buying Guides',
    authorName: 'Atelier Editorial',
    authorAvatar: null,
    readTime: 6,
    tags: ['safety', 'slip resistance', 'specifications'],
    publishedAt: '2025-05-15T00:00:00Z',
    viewCount: 980,
    createdAt: '2025-05-15T00:00:00Z',
  },
  {
    id: 'blog-03',
    title: 'Brutalist Concrete Revival: The Dark Surface Trend of 2026',
    slug: 'brutalist-concrete-revival-dark-surface-trend',
    excerpt: 'How industrial matte surfaces and raw concrete aesthetics are reshaping luxury residential interiors.',
    content: '# Brutalist Concrete Revival\n\nThe resurgence of brutalist aesthetics...',
    coverImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    categoryId: null,
    categoryName: 'Design Trends',
    authorName: 'Atelier Editorial',
    authorAvatar: null,
    readTime: 5,
    tags: ['trends', 'brutalism', 'concrete', 'matte'],
    publishedAt: '2025-04-20T00:00:00Z',
    viewCount: 2100,
    createdAt: '2025-04-20T00:00:00Z',
  },
];

const LOCAL_BLOGS_KEY = 'tts-local-blogs';
const LOCAL_GALLERIES_KEY = 'tts-local-galleries';

export function getLocalBlogs(): BlogArticle[] {
  try {
    const stored = localStorage.getItem(LOCAL_BLOGS_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_BLOGS_KEY, JSON.stringify(STATIC_BLOGS));
      return STATIC_BLOGS;
    }
    return JSON.parse(stored);
  } catch (e) {
    return STATIC_BLOGS;
  }
}

export function saveLocalBlogs(blogs: BlogArticle[]): void {
  try {
    localStorage.setItem(LOCAL_BLOGS_KEY, JSON.stringify(blogs));
  } catch (e) {}
}

export async function getLocalGalleries() {
  try {
    const stored = localStorage.getItem(LOCAL_GALLERIES_KEY);
    if (!stored) {
      const mapped = projectGallery.map(p => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        category: p.category,
        imageUrl: p.image,
        location: p.location,
        size: p.size,
        year: p.year,
        description: p.description,
        roomType: p.room || null,
        style: p.style || null,
      }));
      localStorage.setItem(LOCAL_GALLERIES_KEY, JSON.stringify(mapped));
      return mapped;
    }
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveLocalGalleries(galleries: any[]) {
  try {
    localStorage.setItem(LOCAL_GALLERIES_KEY, JSON.stringify(galleries));
  } catch (e) {}
}

/**
 * Get all published blog articles.
 */
export async function getBlogs(filters?: {
  categoryId?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ blogs: BlogArticle[]; total: number }> {
  if (!isSupabaseConfigured) {
    const list = getLocalBlogs();
    return { blogs: list, total: list.length };
  }

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const { from, to } = getPaginationRange({ page, pageSize });

  let query = supabase
    .from('blogs')
    .select(`
      *,
      blog_categories (name)
    `, { count: 'exact' })
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(from, to);

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters?.tag) {
    query = query.contains('tags', [filters.tag]);
  }

  const { data, error, count } = await query;

  if (error || !data) {
    const list = getLocalBlogs();
    return { blogs: list, total: list.length };
  }

  return {
    blogs: data.map(b => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      coverImage: b.cover_image,
      categoryId: b.category_id,
      categoryName: (b.blog_categories as { name: string } | null)?.name || null,
      authorName: b.author_name,
      authorAvatar: b.author_avatar,
      readTime: b.read_time,
      tags: b.tags || [],
      publishedAt: b.published_at,
      viewCount: b.view_count,
      createdAt: b.created_at,
    })),
    total: count ?? 0,
  };
}

/**
 * Get a single blog article by ID or slug.
 */
export async function getBlogById(idOrSlug: string): Promise<BlogArticle | null> {
  const staticBlog = getLocalBlogs().find(b => b.id === idOrSlug || b.slug === idOrSlug);

  if (!isSupabaseConfigured) {
    return staticBlog || null;
  }

  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      blog_categories (name)
    `)
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .eq('published', true)
    .single();

  if (error || !data) {
    return staticBlog || null;
  }

  // Increment view count (fire and forget)
  void supabase
    .from('blogs')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id);

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.cover_image,
    categoryId: data.category_id,
    categoryName: (data.blog_categories as { name: string } | null)?.name || null,
    authorName: data.author_name,
    authorAvatar: data.author_avatar,
    readTime: data.read_time,
    tags: data.tags || [],
    publishedAt: data.published_at,
    viewCount: data.view_count,
    createdAt: data.created_at,
  };
}

/**
 * Get all blog categories.
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  if (!isSupabaseConfigured) {
    return [
      { id: 'dt', name: 'Design Trends', slug: 'design-trends' },
      { id: 'ms', name: 'Material Science', slug: 'material-science' },
      { id: 'ps', name: 'Project Spotlights', slug: 'project-spotlights' },
      { id: 'bg', name: 'Buying Guides', slug: 'buying-guides' },
      { id: 'cm', name: 'Care & Maintenance', slug: 'care-maintenance' },
    ];
  }

  const { data, error } = await supabase
    .from('blog_categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error || !data) return [];
  return data;
}

/**
 * Get gallery/project items.
 */
export async function getGalleries(filters?: {
  category?: string;
  style?: string;
  roomType?: string;
}): Promise<Array<{
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  imageUrl: string;
  location: string | null;
  size: string | null;
  year: string | null;
  description: string | null;
  roomType: string | null;
  style: string | null;
}>> {
  if (!isSupabaseConfigured) {
    const list = await getLocalGalleries();
    let filtered = [...list];
    if (filters?.category) filtered = filtered.filter(g => g.category === filters.category);
    if (filters?.style) filtered = filtered.filter(g => g.style === filters.style);
    if (filters?.roomType) filtered = filtered.filter(g => g.roomType === filters.roomType);
    return filtered;
  }

  let query = supabase
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.style) query = query.eq('style', filters.style);
  if (filters?.roomType) query = query.eq('room_type', filters.roomType);

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map(g => ({
    id: g.id,
    title: g.title,
    subtitle: g.subtitle,
    category: g.category,
    imageUrl: g.image_url,
    location: g.location,
    size: g.size,
    year: g.year,
    description: g.description,
    roomType: g.room_type,
    style: g.style,
  }));
}

/**
 * Search blog articles by query string.
 */
export async function searchBlogs(query: string, limit = 6): Promise<BlogArticle[]> {
  const q = query.toLowerCase().trim();

  if (!isSupabaseConfigured) {
    return getLocalBlogs().filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
    ).slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('blogs')
      .select(`*, blog_categories (name)`)
      .eq('published', true)
      .textSearch('search_vector', q, { type: 'websearch' })
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error || !data) return getLocalBlogs().slice(0, limit);

    return data.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      coverImage: b.cover_image,
      categoryId: b.category_id,
      categoryName: (b.blog_categories as { name: string } | null)?.name || null,
      authorName: b.author_name,
      authorAvatar: b.author_avatar,
      readTime: b.read_time,
      tags: b.tags || [],
      publishedAt: b.published_at,
      viewCount: b.view_count,
      createdAt: b.created_at,
    }));
  } catch {
    return getLocalBlogs().slice(0, limit);
  }
}

/**
 * Get related blog articles (same category or shared tags).
 */
export async function getRelatedBlogs(articleId: string, limit = 3): Promise<BlogArticle[]> {
  const source = getLocalBlogs().find((b) => b.id === articleId);

  if (!isSupabaseConfigured) {
    return getLocalBlogs().filter((b) => b.id !== articleId).slice(0, limit);
  }

  try {
    // Get source article's category and tags
    const { data: src } = await supabase
      .from('blogs')
      .select('category_id, tags')
      .eq('id', articleId)
      .single();

    if (!src) return getLocalBlogs().filter((b) => b.id !== articleId).slice(0, limit);

    let query = supabase
      .from('blogs')
      .select(`*, blog_categories (name)`)
      .eq('published', true)
      .neq('id', articleId)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (src.category_id) {
      query = query.eq('category_id', src.category_id);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return getLocalBlogs().filter((b) => b.id !== articleId).slice(0, limit);
    }

    return data.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      coverImage: b.cover_image,
      categoryId: b.category_id,
      categoryName: (b.blog_categories as { name: string } | null)?.name || null,
      authorName: b.author_name,
      authorAvatar: b.author_avatar,
      readTime: b.read_time,
      tags: b.tags || [],
      publishedAt: b.published_at,
      viewCount: b.view_count,
      createdAt: b.created_at,
    }));
  } catch {
    return getLocalBlogs().filter((b) => b.id !== articleId).slice(0, limit);
  }
}

/**
 * Increment view count for a blog article.
 */
export async function incrementBlogViewCount(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.rpc('increment_blog_views' as never, { blog_id: id });
  } catch {
    // Fallback: direct update
    try {
      const { data } = await supabase
        .from('blogs')
        .select('view_count')
        .eq('id', id)
        .single();
      if (data) {
        await supabase
          .from('blogs')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id);
      }
    } catch {}
  }
}

// ============================================================
// ADMIN BLOG MANAGEMENT
// ============================================================

export interface AdminBlogInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  categoryId?: string;
  authorName: string;
  authorAvatar?: string;
  readTime?: number;
  tags?: string[];
  published?: boolean;
}

/**
 * Create a new blog article (admin only).
 */
export async function adminCreateBlog(input: AdminBlogInput): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured) {
    const newId = `sim-blog-${Date.now()}`;
    const newBlog: BlogArticle = {
      id: newId,
      title: input.title,
      slug: input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: input.excerpt || null,
      content: input.content,
      coverImage: input.coverImage || null,
      categoryId: input.categoryId || null,
      categoryName: 'Design Trends',
      authorName: input.authorName || 'Atelier Editorial',
      authorAvatar: null,
      readTime: input.readTime || 5,
      tags: input.tags || [],
      publishedAt: input.published ? new Date().toISOString() : null,
      viewCount: 0,
      createdAt: new Date().toISOString(),
    };
    const stored = getLocalBlogs();
    saveLocalBlogs([...stored, newBlog]);
    return { id: newId };
  }
  try {
    const { data, error } = await supabase
      .from('blogs')
      .insert({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt || null,
        content: input.content,
        cover_image: input.coverImage || null,
        category_id: input.categoryId || null,
        author_name: input.authorName,
        author_avatar: input.authorAvatar || null,
        read_time: input.readTime || null,
        tags: input.tags || [],
        published: input.published ?? false,
        published_at: input.published ? new Date().toISOString() : null,
      })
      .select('id')
      .single();
    if (error || !data) return null;
    return { id: data.id };
  } catch {
    return null;
  }
}

/**
 * Update a blog article (admin only).
 */
export async function adminUpdateBlog(id: string, updates: Partial<AdminBlogInput>): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const stored = getLocalBlogs();
    const updated = stored.map(b => b.id === id ? { ...b, ...updates } : b);
    saveLocalBlogs(updated);
    return true;
  }
  try {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.excerpt !== undefined) dbUpdates.excerpt = updates.excerpt;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.published !== undefined) {
      dbUpdates.published = updates.published;
      if (updates.published) dbUpdates.published_at = new Date().toISOString();
    }
    const { error } = await supabase.from('blogs').update(dbUpdates).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete a blog article (admin only).
 */
export async function adminDeleteBlog(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const stored = getLocalBlogs();
    saveLocalBlogs(stored.filter(b => b.id !== id));
    return true;
  }
  try {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Get featured testimonials.
 */
export async function getTestimonials(): Promise<Array<{
  id: string;
  clientName: string;
  role: string;
  company: string | null;
  quote: string;
  rating: number;
  avatarUrl: string | null;
  projectType: string | null;
}>> {
  if (!isSupabaseConfigured) {
    return premiumTestimonials.map(t => ({
      id: t.id,
      clientName: t.clientName,
      role: t.role,
      company: t.company,
      quote: t.quote,
      rating: t.rating,
      avatarUrl: t.avatar,
      projectType: t.projectType,
    }));
  }

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error || !data) return [];

  return data.map(t => ({
    id: t.id,
    clientName: t.client_name,
    role: t.role,
    company: t.company,
    quote: t.quote,
    rating: t.rating,
    avatarUrl: t.avatar_url,
    projectType: t.project_type,
  }));
}
