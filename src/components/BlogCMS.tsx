import { useState } from 'react';
import { X, BookOpen, Clock, Tag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ArticleItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Materials' | 'Trends' | 'Guides' | 'Interior';
  date: string;
  readTime: string;
  image: string;
  author: string;
}

const articlesData: ArticleItem[] = [
  {
    id: 'a1',
    title: 'The Art of Sourcing Carrara Marble Slabs',
    excerpt: 'Deep dive into geological veins, crystallization structures, and selecting signature block-match slabs for double-height residential ceilings.',
    category: 'Materials',
    date: 'June 02, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    author: 'Elena Rostova, Lead Materialologist',
    content: 'Carrara Marble is not simply stone; it is the physical crystallisation of geological time. Quarried in the Apuan Alps of northern Italy, selecting a blockmatch slab requires evaluating vein structure, color grade (ranging from pristine white to grey-cast), and mineral density. In double-height foyers, bookmatching creates a breathtaking mirror effect. Ensure you request quarry-origin certificates and test for zero-acid sealants before booking your surfaces.'
  },
  {
    id: 'a2',
    title: 'Anti-Skid Ratings vs High-Gloss Reflectivity',
    excerpt: 'An architect’s handbook for balancing safety requirements with mirror polish aesthetics across master bathroom suites and pool surrounds.',
    category: 'Guides',
    date: 'May 28, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    author: 'Vikram Dev, Principal Consultant',
    content: 'A classic dilemma: clients demand high-gloss mirror-finish reflectivity but safety standards dictate slip-resistance. The solution lies in advanced Lappato finishes and R-ratings. For wet zones (bathrooms and pools), an R11 slip-resistance certification is vital. This is achieved through micro-abrasions in the glaze that trigger friction when wet, while maintaining optical clarity. Standard polished vitrified tiles should be restricted to zero-moisture zones like dry bedrooms or reception lobbies.'
  },
  {
    id: 'a3',
    title: 'Moroccan Zellige: Embracing Organic Imperfection',
    excerpt: 'How handcrafted glaze variations and irregular clay edges create dynamic, light-refracting backsplashes in chef-style kitchens.',
    category: 'Interior',
    date: 'May 14, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1523413651479-797eb2e2adac?auto=format&fit=crop&w=600&q=80',
    author: 'Sarah Jenkins, Interior Designer',
    content: 'Moroccan Zellige tiles, double-fired and hand-chiseled in Fez, are defined by their flaws. No two tiles share the exact thickness or edge shape. When installed closely with minimal grouting, the irregular surfaces catch side-lighting to generate undulating waves of color variation. Perfect for modern kitchen backsplashes, they inject tactile texture and heritage warmth to offset cold, steel appliances.'
  },
  {
    id: 'a4',
    title: 'Brutalist Concrete & Large Format Slabs',
    excerpt: 'Exploring the modern architectural trend of using monolithic 1600x3200mm sintered stone for seamless indoor-outdoor floor transitions.',
    category: 'Trends',
    date: 'April 20, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80',
    author: 'Marcus Aurel, Architect',
    content: 'Large Format Slabs (LFS) are reshaping modern spatial scale. By using massive sintered stone panels, architects can lay down continuous floors with minimal grout lines (less than 1.5mm joints). This creates a monolithic, brutalist concrete or uniform stone platform that flows directly from internal living areas out to open verandas, maximizing perceived space and offering seamless structural coherence.'
  }
];

interface BlogCMSProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BlogCMS({ isOpen, onClose }: BlogCMSProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  const categories = ['All', 'Materials', 'Trends', 'Guides', 'Interior'];

  const filteredArticles = activeCategory === 'All'
    ? articlesData
    : articlesData.filter(a => a.category === activeCategory);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/80 flex items-center justify-center p-4 sm:p-6" id="blog-cms-wrapper">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 cursor-pointer bg-charcoal/30 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-warmwhite max-w-5xl w-full border border-charcoal/10 overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-[80vh] z-10"
            id="blog-panel-container"
          >
            {/* Header banner */}
            <div className="p-6 border-b border-charcoal/10 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold-600" />
                <span className="font-serif text-base font-bold text-charcoal tracking-wide uppercase">
                  Atelier Editorial Archive
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal transition-all rounded-full cursor-pointer shadow"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split layout: Filter options & articles list */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Horizontal Category Switcher */}
              <div className="px-6 py-4 bg-white/40 border-b border-charcoal/5 flex gap-2 overflow-x-auto no-scrollbar shrink-0 select-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase transition-all duration-200 border cursor-pointer whitespace-nowrap ${
                      activeCategory === cat
                        ? 'bg-charcoal border-charcoal text-warmwhite font-bold'
                        : 'bg-white border-charcoal/5 text-charcoal/50 hover:border-gold-300 hover:text-charcoal'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid scrollview */}
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredArticles.map(article => (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="bg-white border border-charcoal/5 hover:border-gold-500/30 overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-lg"
                    >
                      {/* Image header */}
                      <div className="aspect-[16/9] w-full overflow-hidden bg-ivory relative">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <span className="absolute top-3 left-3 bg-charcoal/90 text-warmwhite px-2 py-0.5 font-mono text-[8px] tracking-widest uppercase">
                          {article.category}
                        </span>
                      </div>

                      {/* Info details */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 font-mono text-[9px] text-charcoal/40 mb-2 uppercase">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gold-500" />
                              {article.readTime}
                            </span>
                            <span>•</span>
                            <span>{article.date}</span>
                          </div>
                          
                          <h4 className="font-serif text-base font-bold text-charcoal group-hover:text-gold-600 transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          
                          <p className="font-sans text-[11px] text-charcoal/60 leading-relaxed mt-2 line-clamp-3">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-charcoal/5 flex items-center justify-between text-gold-600 font-mono text-[9px] tracking-widest uppercase font-semibold">
                          <span>Read Full Editorial</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reading Overlay panel for detailed article reading */}
            <AnimatePresence>
              {selectedArticle && (
                <motion.div
                  initial={{ opacity: 0, x: '100%' }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: '100%' }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  className="absolute inset-0 bg-warmwhite z-30 flex flex-col overflow-hidden"
                  id="article-read-panel"
                >
                  {/* Article close trigger */}
                  <div className="p-5 bg-white border-b border-charcoal/10 flex items-center justify-between shrink-0">
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="font-mono text-[10px] tracking-widest uppercase text-charcoal/50 hover:text-charcoal flex items-center gap-1.5 cursor-pointer"
                    >
                      ← Back to Archive
                    </button>
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="p-1 bg-charcoal/5 border border-charcoal/5 hover:border-gold-500 rounded-none cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scrollable Article Content */}
                  <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
                    <div className="max-w-2xl mx-auto px-6 pt-8">
                      
                      {/* Meta tag */}
                      <span className="font-mono text-[9px] tracking-[0.25em] bg-gold-400 text-charcoal font-bold px-2 py-0.5 rounded-sm uppercase inline-block mb-4">
                        {selectedArticle.category}
                      </span>
                      
                      <h2 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal leading-tight mb-4">
                        {selectedArticle.title}
                      </h2>

                      {/* Author credentials */}
                      <div className="flex items-center gap-4 text-xs font-mono text-charcoal/40 border-b border-charcoal/10 pb-5 mb-6">
                        <span>By {selectedArticle.author}</span>
                        <span>•</span>
                        <span>{selectedArticle.date}</span>
                        <span>•</span>
                        <span>{selectedArticle.readTime}</span>
                      </div>

                      {/* Header image snap */}
                      <div className="aspect-[16/9] bg-ivory border border-charcoal/5 overflow-hidden mb-8 shadow-sm">
                        <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                      </div>

                      {/* Detailed text markup */}
                      <p className="font-sans text-sm sm:text-base text-charcoal/80 leading-relaxed font-light first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-gold-600 first-letter:float-left first-letter:pr-2.5 first-letter:pt-1 whitespace-pre-line">
                        {selectedArticle.content}
                      </p>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
