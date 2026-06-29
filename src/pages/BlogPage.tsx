import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, X, Search, ChevronRight, CornerDownLeft, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { useBlogs, useBlogArticle, useBlogCategories } from '../hooks/useBlogs';

interface BlogPageProps {
  currentArticleId?: string | null;
  onNavigate: (hash: string) => void;
}

export default function BlogPage({ currentArticleId, onNavigate }: BlogPageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch blog articles and categories from service
  const { data: blogsData, isLoading } = useBlogs();
  const { data: categoriesData } = useBlogCategories();
  const { data: activeArticle } = useBlogArticle(currentArticleId || '');

  const allArticles = blogsData?.blogs || [];

  const categories = useMemo(() => {
    const base = ['All'];
    if (categoriesData && categoriesData.length > 0) {
      return [...base, ...categoriesData.map((c: { name: string }) => c.name)];
    }
    // Derive categories from loaded articles
    const cats = [...new Set(allArticles.map(a => a.categoryName || 'Editorial'))];
    return [...base, ...cats];
  }, [categoriesData, allArticles]);

  // Related articles matching engine
  const relatedArticles = useMemo(() => {
    if (!activeArticle) return [];
    return allArticles
      .filter(a => a.id !== activeArticle.id && a.categoryName === activeArticle.categoryName)
      .slice(0, 2);
  }, [activeArticle, allArticles]);

  // Filtering list
  const filteredArticles = useMemo(() => {
    let result = allArticles;

    if (activeCategory !== 'All') {
      result = result.filter(a => (a.categoryName || 'Editorial') === activeCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        (a.content && a.content.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allArticles, activeCategory, searchQuery]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentArticleId]);

  return (
    <div className="min-h-screen bg-ivory pt-24 pb-16" id="blog-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Breadcrumbs 
            items={activeArticle ? [{ label: 'Editorial', hash: '#/blog' }, { label: activeArticle.title }] : [{ label: 'Editorial' }]} 
            onNavigate={onNavigate} 
          />

          {activeArticle && (
            <button
              onClick={() => onNavigate('#/blog')}
              className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-charcoal/50 hover:text-charcoal transition-colors cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Editorial
            </button>
          )}
        </div>

        {/* Dynamic Panel Reader or Listing View */}
        <AnimatePresence mode="wait">
          {activeArticle ? (
            /* ── ARTICLE READER MODE ── */
            <motion.div
              key={`read-${activeArticle.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
              id="article-reader-container"
            >
              {/* Main reading content (8 cols) */}
              <div className="lg:col-span-8 bg-white border border-charcoal/8 p-6 sm:p-10 shadow-sm">
                <span className="font-mono text-[9px] tracking-[0.25em] bg-gold-400 text-charcoal font-bold px-2 py-0.5 rounded-sm uppercase inline-block mb-4">
                  {activeArticle.categoryName || 'Editorial'}
                </span>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal leading-tight mb-4">
                  {activeArticle.title}
                </h1>

                <div className="flex items-center gap-4 text-xs font-mono text-charcoal/45 border-b border-charcoal/8 pb-4 mb-6">
                  <span>By {activeArticle.authorName}</span>
                  <span>•</span>
                  <span>{activeArticle.publishedAt ? new Date(activeArticle.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
                  <span>•</span>
                  <span>{activeArticle.readTime ? `${activeArticle.readTime} min read` : ''}</span>
                </div>

                <div className="aspect-[16/9] w-full overflow-hidden bg-ivory border border-charcoal/5 mb-8 shadow-sm">
                  <img src={activeArticle.coverImage || ''} alt={activeArticle.title} className="w-full h-full object-cover" />
                </div>

                <p className="font-sans text-sm sm:text-base text-charcoal/80 leading-relaxed font-light first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-gold-600 first-letter:float-left first-letter:pr-2.5 first-letter:pt-1 whitespace-pre-line">
                  {activeArticle.content}
                </p>
              </div>

              {/* Sidebar related articles (4 cols) */}
              <div className="lg:col-span-4 space-y-6" id="article-reader-sidebar">
                <div className="bg-white border border-charcoal/8 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-charcoal/5">
                    <Sparkles className="w-4 h-4 text-gold-600" />
                    <span className="font-mono text-[9px] tracking-widest uppercase text-charcoal font-bold">Related Readings</span>
                  </div>

                  {relatedArticles.length === 0 ? (
                    <p className="font-sans text-xs text-charcoal/40">No additional articles in this category.</p>
                  ) : (
                    <div className="space-y-4">
                      {relatedArticles.map((art: { id: string; coverImage?: string | null; title: string; publishedAt?: string | null }) => (
                        <div
                          key={art.id}
                          onClick={() => onNavigate(`#/blog/read/${art.id}`)}
                          className="group cursor-pointer flex gap-3 text-left items-start"
                        >
                          <div className="h-14 w-14 overflow-hidden border border-charcoal/5 bg-ivory shrink-0">
                            <img src={art.coverImage || ''} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div>
                            <h4 className="font-serif text-xs font-semibold text-charcoal group-hover:text-gold-600 transition-colors line-clamp-2">
                              {art.title}
                            </h4>
                            <span className="font-mono text-[8px] text-charcoal/40 mt-1 block">{art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 bg-charcoal text-warmwhite border border-white/5 text-center">
                  <BookOpen className="w-6 h-6 mx-auto text-gold-500 mb-2" />
                  <h4 className="font-serif text-sm font-semibold mb-1">Looking for Specifications?</h4>
                  <p className="font-sans text-[11px] text-gray-400 leading-relaxed mb-4">
                    Explore our materials specifications directly in our collections directory.
                  </p>
                  <button
                    onClick={() => onNavigate('#/collections')}
                    className="w-full py-2 bg-gold-500 text-charcoal hover:bg-gold-600 transition-colors font-mono text-[9px] tracking-widest uppercase font-bold cursor-pointer"
                  >
                    View Materials Catalog
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── BLOG LISTING MODE ── */
            <motion.div
              key="listing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header Titles */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <h2 className="font-serif italic text-3xl md:text-5xl font-normal text-charcoal tracking-tight">
                    Atelier <span className="not-italic font-medium text-gold-600">Editorial</span>
                  </h2>
                  <p className="font-sans text-xs text-charcoal/50 mt-1 uppercase tracking-widest font-mono">
                    Guides, specifications, and interior trends
                  </p>
                </div>

                {/* Article search */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search editorial archive..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-charcoal/10 font-sans text-xs text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Category selector row */}
              <div className="flex items-center justify-start overflow-x-auto pb-3 mb-8 gap-2 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-none font-mono text-[9.5px] tracking-widest uppercase transition-all duration-350 border cursor-pointer whitespace-nowrap ${
                      activeCategory === cat
                        ? 'bg-charcoal border-charcoal text-warmwhite font-bold'
                        : 'bg-white border-charcoal/5 text-charcoal/45 hover:border-gold-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of articles */}
              {filteredArticles.length === 0 ? (
                <div className="text-center py-16 bg-white border border-charcoal/8">
                  <BookOpen className="w-6 h-6 mx-auto text-charcoal/20 mb-2" />
                  <h4 className="font-serif text-sm font-semibold text-charcoal">No articles found</h4>
                  <p className="font-sans text-xs text-charcoal/40 mt-1">Try resetting your search query or choosing another category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredArticles.map(art => (
                    <div
                      key={art.id}
                      onClick={() => onNavigate(`#/blog/read/${art.id}`)}
                      className="bg-white border border-charcoal/8 overflow-hidden hover:shadow-lg hover:border-gold-400/40 transition-all duration-350 flex flex-col justify-between cursor-pointer group"
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-ivory relative">
                        <img src={(art as any).coverImage || ''} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <span className="absolute top-4 left-4 bg-charcoal/90 text-warmwhite px-2.5 py-0.5 font-mono text-[8px] tracking-widest uppercase">
                          {(art as any).categoryName || 'Editorial'}
                        </span>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 font-mono text-[9px] text-charcoal/40 mb-2 uppercase">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gold-500" />
                              {(art as any).readTime ? `${(art as any).readTime} min read` : ''}
                            </span>
                            <span>•</span>
                            <span>{(art as any).publishedAt ? new Date((art as any).publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                          </div>

                          <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal leading-snug group-hover:text-gold-600 transition-colors">
                            {art.title}
                          </h3>

                          <p className="font-sans text-xs text-charcoal/50 leading-relaxed mt-2 line-clamp-3">
                            {art.excerpt}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-charcoal/5 flex justify-between items-center text-gold-600 font-mono text-[9px] tracking-widest uppercase font-semibold">
                          <span>Read Article</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
