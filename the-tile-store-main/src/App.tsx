import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BrandShowcase from './components/BrandShowcase';
import TileCollections from './components/TileCollections';
import SpaceVisualizer from './components/SpaceVisualizer';
import WhyChooseUs from './components/WhyChooseUs';
import ProjectGallery from './components/ProjectGallery';
import Testimonials from './components/Testimonials';
import ConsultationBooking from './components/ConsultationBooking';
import Footer from './components/Footer';
import GlobalSearch from './components/GlobalSearch';
import { TileProduct } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { applySEO, SEO_CONFIGS } from './lib/seo';

// Sub-module Component Imports
import WishlistDrawer from './components/WishlistDrawer';
import MoodboardCanvas from './components/MoodboardCanvas';
import CompareModal from './components/CompareModal';
import BlogCMS from './components/BlogCMS';
import PartnershipModal from './components/PartnershipModal';
import InquiryCartDrawer, { InquiryItem } from './components/InquiryCartDrawer';
import InstagramFeed from './components/InstagramFeed';
import ProductDetailModal from './components/ProductDetailModal';
import CalculatorPage from './pages/CalculatorPage';
import ProductDetailPage from './pages/ProductDetailPage';
import PartnersPage from './pages/PartnersPage';
import BlogPage from './pages/BlogPage';
import { useWishlist } from './hooks/useWishlist';
import { useInquiryCart } from './hooks/useInquiryCart';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { useCompare } from './hooks/useCompare';
import { useRecentlyViewed } from './hooks/useRecentlyViewed';
import { getProductById } from './services/productService';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import {
  trackProductView,
  trackWishlistAdd,
  trackInquiryAdd,
  trackPageView,
  flushAnalytics,
} from './lib/analytics';
import AdminApp from './admin/AdminApp';
import './admin/admin.css';

export default function App() {
  useRealtimeSync();

  const [currentPage, setCurrentPage] = useState<'home' | 'collections' | 'calculator' | 'product-detail' | 'partners' | 'blog' | 'admin'>('home');
  const [activeSection, setActiveSection] = useState<string>('home');
  const [selectedTileForVisualizer, setSelectedTileForVisualizer] = useState<TileProduct | null>(null);

  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash || '#/');
  const [currentProductId, setCurrentProductId] = useState<string>('');
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);

  // Global search open & external tile selection state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [externalSelectedTile, setExternalSelectedTile] = useState<TileProduct | null>(null);

  // ── Enterprise Backend Hooks ──────────────────────────────────────
  // Auth: get current user & anonymous session ID
  const { user } = useSupabaseAuth();

  // DB-backed wishlist (localStorage + Supabase, graceful degradation)
  const {
    wishlist,
    addToWishlist: addToWishlistHook,
    removeFromWishlist: removeFromWishlistHook,
    isInWishlist,
  } = useWishlist(user?.id);

  // DB-persisted comparison (up to 3 tiles, localStorage + Supabase)
  const {
    compareItems: comparedProducts,
    addToCompare: addToCompareHook,
    removeFromCompare: removeFromCompareHook,
    canAddMore: canAddMoreToCompare,
  } = useCompare(user?.id);

  // Recently viewed tracker (localStorage + Supabase sync)
  const { addToRecent } = useRecentlyViewed();

  // Modal / Drawer Toggles
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isMoodboardOpen, setIsMoodboardOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [calculatorTile, setCalculatorTile] = useState<TileProduct | null>(null);
  const [isBlogOpen, setIsBlogOpen] = useState<boolean>(false);
  const [isPartnershipOpen, setIsPartnershipOpen] = useState<boolean>(false);

  // DB-backed inquiry cart (localStorage + Supabase, graceful degradation)
  const {
    items: inquiryCart,
    itemCount: inquiryCartCount,
    addToCart: addToInquiryCartHook,
    removeItem: removeFromInquiryCartHook,
    updateItem: updateInquiryCartItem,
    clearAll: clearInquiryCart,
    submitInquiry: submitInquiryHook,
    isInCart: isInInquiryCart,
  } = useInquiryCart(user?.id);
  const [isInquiryCartOpen, setIsInquiryCartOpen] = useState<boolean>(false);

  // Flush analytics on page unload
  useEffect(() => {
    return () => flushAnalytics();
  }, []);



  // Product Detail Modal State
  const [productDetailTile, setProductDetailTile] = useState<TileProduct | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState<boolean>(false);

  // Global keyboard shortcut listener for search overlay (Press '/' or 'CMD+K')
  useEffect(() => {
    const handleShortcutKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && e.key === 'k')
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcutKeyDown);
    return () => window.removeEventListener('keydown', handleShortcutKeyDown);
  }, []);

  const handleSelectSearchTile = (tile: TileProduct) => {
    setExternalSelectedTile(tile);
    setTimeout(() => {
      handleNavigate('#/collections');
    }, 100);
  };

  const handleSelectSearchBrand = (brandName: string) => {
    handleNavigate('#/collections');
  };
  
  // Luxury page loading indicator
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);

  // Scroll to top button display state
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Simulated sleek loader progress tracker
  useEffect(() => {
    if (window.location.hash.startsWith('#/admin')) {
      setIsLoading(false);
      return;
    }
    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 600);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20 + 10);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Hash-based routing controller
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setCurrentHash(hash);

      if (hash.startsWith('#/admin')) {
        setCurrentPage('admin');
      } else if (hash.startsWith('#/product/')) {
        const id = hash.replace('#/product/', '');
        setCurrentProductId(id);
        setCurrentPage('product-detail');
      } else if (hash.startsWith('#/blog/read/')) {
        const id = hash.replace('#/blog/read/', '');
        setCurrentArticleId(id);
        setCurrentPage('blog');
      } else if (hash === '#/blog') {
        setCurrentArticleId(null);
        setCurrentPage('blog');
      } else if (hash === '#/partners') {
        setCurrentPage('partners');
      } else if (hash === '#/calculator') {
        setCurrentPage('calculator');
      } else if (hash === '#/collections') {
        setCurrentPage('collections');
      } else {
        setCurrentPage('home');
        const sectionMapping: Record<string, string> = {
          '#/visualizer': 'visualizer',
          '#/brands': 'brands',
          '#/projects': 'projects',
          '#/booking': 'booking'
        };
        const sectionId = sectionMapping[hash];
        if (sectionId) {
          setTimeout(() => {
            const targetElement = document.getElementById(sectionId);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 150);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dynamic SEO — Full Open Graph, Twitter Cards, JSON-LD via SEO library
  useEffect(() => {
    // Analytics page tracking
    trackPageView(currentHash);

    if (currentHash === '#/' || currentHash === '') {
      applySEO(SEO_CONFIGS.home());
    } else if (currentHash === '#/collections') {
      applySEO(SEO_CONFIGS.collections());
    } else if (currentHash.startsWith('#/product/')) {
      const id = currentHash.replace('#/product/', '');
      getProductById(id).then(tile => {
        if (tile) {
          applySEO(SEO_CONFIGS.product({
            name: tile.name,
            description: tile.description,
            image: tile.image,
            code: tile.code,
            material: tile.material,
            finish: tile.finish,
            brand: tile.brand,
            priceCategory: tile.priceCategory,
            id: tile.id,
          }));
          // Track product page view
          trackProductView(id, 'direct');
        }
      });
    } else if (currentHash.startsWith('#/blog/read/')) {
      // Blog post SEO handled within BlogPage
    } else if (currentHash === '#/blog') {
      applySEO(SEO_CONFIGS.blog());
    } else if (currentHash === '#/partners') {
      applySEO(SEO_CONFIGS.partners());
    } else if (currentHash === '#/calculator') {
      applySEO(SEO_CONFIGS.calculator());
    } else {
      applySEO(SEO_CONFIGS.home());
    }
  }, [currentHash]);

  // Section highlight tracker scrollspy
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);

      const navSections = [
        'home',
        'collections',
        'visualizer',
        'calculator-section',
        'brands',
        'why-choose-us',
        'projects',
        'booking'
      ];

      for (const sectionId of navSections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 180) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (hash: string) => {
    window.location.hash = hash;
  };

  const handleOpenBooking = () => {
    // Always scroll directly — hashchange won't fire if hash is already #/booking
    const isOnHome = currentPage === 'home';
    window.location.hash = '#/booking';
    setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, isOnHome ? 50 : 300);
  };

  const handleSelectTileForVisualizer = (tile: TileProduct) => {
    setSelectedTileForVisualizer(tile);
  };

  // State callbacks for Wishlist / Compare — delegated to enterprise hooks
  const handleAddToWishlist = (tile: TileProduct) => {
    addToWishlistHook(tile);
    trackWishlistAdd(tile.id);  // ← Analytics
  };

  const handleRemoveFromWishlist = (tileId: string) => {
    removeFromWishlistHook(tileId);
  };

  const handleAddToCompare = (tile: TileProduct) => {
    addToCompareHook(tile);
  };

  const handleRemoveFromCompare = (tileId: string) => {
    removeFromCompareHook(tileId);
  };

  const handleOpenCalculator = (_tile: TileProduct) => {
    setCurrentPage('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent("Hello, I would like to inquire about premium surfaces for my architecture project.");
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  // Inquiry Cart Handlers — delegated to enterprise hooks
  const handleAddToInquiry = (tile: TileProduct) => {
    addToInquiryCartHook(tile);
    trackInquiryAdd(tile.id);  // ← Analytics
  };

  const handleUpdateInquiryItem = (productId: string, updates: Partial<InquiryItem>) => {
    updateInquiryCartItem(productId, updates);
  };

  const handleRemoveInquiryItem = (productId: string) => {
    removeFromInquiryCartHook(productId);
  };

  const handleClearInquiryCart = () => {
    clearInquiryCart();
  };

  // Product Detail Modal Handler — with analytics + recently viewed
  const handleOpenProductDetail = (tile: TileProduct) => {
    setProductDetailTile(tile);
    setIsProductDetailOpen(true);
    trackProductView(tile.id, 'catalog');  // ← Analytics
    addToRecent(tile);                      // ← Recently viewed
  };

  if (currentPage === 'admin') {
    return <AdminApp />;
  }

  return (
    <>
      {/* 1. Cinematic Luxury Loading Stage */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] bg-warmwhite flex flex-col justify-between p-12 select-none"
            id="global-luxury-loader"
          >
            <div></div> {/* Empty Spacing */}

            <div className="flex flex-col items-center text-center">
              <motion.span
                initial={{ letterSpacing: '0.1em', opacity: 0 }}
                animate={{ letterSpacing: '0.3em', opacity: 1 }}
                transition={{ duration: 1 }}
                className="font-serif text-2xl md:text-3xl uppercase font-bold text-charcoal tracking-[0.3em]"
              >
                The Tile Store
              </motion.span>
              
              <div className="flex items-center gap-2 mt-3">
                <span className="h-[1px] w-8 bg-gold-500"></span>
                <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-gold-600 font-semibold">
                  SURFACES & INTERIORS ARCHIVE
                </span>
                <span className="h-[1px] w-8 bg-gold-400"></span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5" id="loader-percentage-bar">
              <div className="font-mono text-[10px] tracking-widest text-charcoal/40 uppercase">
                CALIBRATING ATELIER MATRIX • {Math.min(loadProgress, 100)}%
              </div>
              <div className="h-[1px] w-48 bg-charcoal/10 relative overflow-hidden">
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-gold-500 transition-all duration-300"
                  style={{ width: `${Math.min(loadProgress, 100)}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Website Frame */}
      {!isLoading && (
        <div className="min-h-screen bg-warmwhite text-charcoal selection:bg-gold-200 selection:text-charcoal relative">
          
          {/* Floating Glass Navbar Header */}
          <Navbar 
            activeSection={
              currentPage === 'home' ? activeSection :
              currentPage === 'collections' ? 'collections' :
              currentPage === 'blog' ? 'blog' :
              currentPage === 'partners' ? 'partners' :
              currentPage === 'calculator' ? 'calculator-section' :
              currentPage === 'product-detail' ? 'collections' : 'home'
            }
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenWishlist={() => setIsWishlistOpen(true)}
            onOpenBlog={() => handleNavigate('#/blog')}
            onOpenPartnership={() => handleNavigate('#/partners')}
            onOpenInquiryCart={() => setIsInquiryCartOpen(true)}
            wishlistCount={wishlist.length}
            inquiryCartCount={inquiryCart.length}
          />

          {/* Dynamic Page Router Switcher */}
          <main className="min-h-screen">
            {currentPage === 'home' && (
              <>
                {/* 2. Hero fullscreen section */}
                <Hero 
                  onExploreClick={() => handleNavigate('#/collections')}
                  onBookingClick={handleOpenBooking}
                />

                {/* 3. Interactive Slabs and Tile Collections */}
                <TileCollections 
                  onSelectTileForVisualizer={handleSelectTileForVisualizer} 
                  onOpenBooking={handleOpenBooking}
                  externalSelectedTile={externalSelectedTile}
                  onClearExternalSelectedTile={() => setExternalSelectedTile(null)}
                  wishlist={wishlist}
                  onAddToWishlist={handleAddToWishlist}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                  comparedProducts={comparedProducts}
                  onAddToCompare={handleAddToCompare}
                  onRemoveFromCompare={handleRemoveFromCompare}
                  onOpenCalculator={handleOpenCalculator}
                  onOpenCompareModal={() => setIsCompareOpen(true)}
                  onAddToInquiry={handleAddToInquiry}
                  onOpenProductDetail={handleOpenProductDetail}
                />

                {/* 4. Real-Time Spatial Room Visualizer */}
                <SpaceVisualizer 
                  selectedTileFromParent={selectedTileForVisualizer}
                  clearParentTileSelection={() => setSelectedTileForVisualizer(null)}
                />

                {/* 5. Authorized Brands showcase */}
                <BrandShowcase />

                {/* 6. Why Choose us bento statistics */}
                <WhyChooseUs />

                {/* 7. Beautiful Masonry Architectural Gallery */}
                <ProjectGallery />

                {/* 8. Floating client testimonial slider */}
                <Testimonials />

                {/* 9. Social Media Instagram Feed */}
                <InstagramFeed />

                {/* 10. Booking scheduler & final CTA */}
                <ConsultationBooking />
              </>
            )}

            {currentPage === 'collections' && (
              <div className="pt-8">
                <TileCollections 
                  isFullscreen={true}
                  onSelectTileForVisualizer={handleSelectTileForVisualizer} 
                  onOpenBooking={handleOpenBooking}
                  externalSelectedTile={externalSelectedTile}
                  onClearExternalSelectedTile={() => setExternalSelectedTile(null)}
                  wishlist={wishlist}
                  onAddToWishlist={handleAddToWishlist}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                  comparedProducts={comparedProducts}
                  onAddToCompare={handleAddToCompare}
                  onRemoveFromCompare={handleRemoveFromCompare}
                  onOpenCalculator={handleOpenCalculator}
                  onOpenCompareModal={() => setIsCompareOpen(true)}
                  onAddToInquiry={handleAddToInquiry}
                  onOpenProductDetail={handleOpenProductDetail}
                  onNavigate={handleNavigate}
                />
              </div>
            )}

            {currentPage === 'calculator' && (
              <CalculatorPage onBack={() => handleNavigate('#/')} />
            )}

            {currentPage === 'product-detail' && (
              <ProductDetailPage
                productId={currentProductId}
                onNavigate={handleNavigate}
                onAddToInquiry={handleAddToInquiry}
                onAddToWishlist={handleAddToWishlist}
                onRemoveFromWishlist={handleRemoveFromWishlist}
                wishlist={wishlist}
                comparedProducts={comparedProducts}
                onAddToCompare={handleAddToCompare}
                onRemoveFromCompare={handleRemoveFromCompare}
                onSelectTileForVisualizer={handleSelectTileForVisualizer}
              />
            )}

            {currentPage === 'partners' && (
              <PartnersPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'blog' && (
              <BlogPage currentArticleId={currentArticleId} onNavigate={handleNavigate} />
            )}
          </main>

          {/* 11. Refined design footer (omitted on dedicated calculator page since that has its own) */}
          {currentPage !== 'calculator' && (
            <Footer onNavigate={(id) => id === 'booking' ? handleOpenBooking() : handleNavigate(`#/${id}`)} />
          )}

          {/* Global Floating Search Portal Overlay */}
          <GlobalSearch
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSelectTile={handleSelectSearchTile}
            onSelectBrand={handleSelectSearchBrand}
          />

          {/* Floating WhatsApp Callback Button */}
          <div className="fixed bottom-24 right-6 z-40">
            <button
              onClick={handleWhatsAppInquiry}
              className="p-4 bg-charcoal border border-gold-500/30 text-gold-500 hover:bg-[#C9A227] hover:text-[#FCFBF8] hover:border-[#C9A227] transition-all duration-300 rounded-none shadow-2xl cursor-pointer flex items-center justify-center relative group"
              title="WhatsApp Inquiry callback"
              aria-label=" WhatsApp Chat"
            >
              <span className="absolute right-14 bg-charcoal text-[9px] tracking-widest text-warmwhite font-mono uppercase px-2.5 py-1 border border-white/10 rounded-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Atelier WhatsApp
              </span>
              {/* Minimal Elegant chat glyph */}
              <span className="font-mono text-xs font-bold font-sans">WA</span>
            </button>
          </div>

          {/* Scroll To Top Anchor Button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 z-40 p-4.5 bg-charcoal border border-charcoal text-warmwhite hover:bg-gold-500 hover:border-gold-500 hover:text-charcoal transition-all duration-300 rounded-none shadow-2xl cursor-pointer"
                aria-label="Scroll to top"
                id="scroll-to-top-btn"
              >
                <ArrowUp className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Modular Drawer / Modal Integrations */}
          <WishlistDrawer
            isOpen={isWishlistOpen}
            onClose={() => setIsWishlistOpen(false)}
            wishlist={wishlist}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onSelectTileForVisualizer={handleSelectTileForVisualizer}
            onOpenCalculator={handleOpenCalculator}
            onOpenMoodboard={() => setIsMoodboardOpen(true)}
          />

          <MoodboardCanvas
            isOpen={isMoodboardOpen}
            onClose={() => setIsMoodboardOpen(false)}
            wishlist={wishlist}
          />

          <CompareModal
            isOpen={isCompareOpen}
            onClose={() => setIsCompareOpen(false)}
            comparedProducts={comparedProducts}
            onRemoveFromCompare={handleRemoveFromCompare}
            onSelectTileForVisualizer={handleSelectTileForVisualizer}
          />

          <BlogCMS
            isOpen={isBlogOpen}
            onClose={() => setIsBlogOpen(false)}
          />

          <PartnershipModal
            isOpen={isPartnershipOpen}
            onClose={() => setIsPartnershipOpen(false)}
          />

          <InquiryCartDrawer
            isOpen={isInquiryCartOpen}
            onClose={() => setIsInquiryCartOpen(false)}
            items={inquiryCart}
            onUpdateItem={handleUpdateInquiryItem}
            onRemoveItem={handleRemoveInquiryItem}
            onClearAll={handleClearInquiryCart}
            onSubmitInquiry={submitInquiryHook}
          />

          <ProductDetailModal
            isOpen={isProductDetailOpen}
            onClose={() => setIsProductDetailOpen(false)}
            product={productDetailTile}
            onAddToInquiry={handleAddToInquiry}
            onAddToWishlist={handleAddToWishlist}
          />

        </div>
      )}
    </>
  );
}
