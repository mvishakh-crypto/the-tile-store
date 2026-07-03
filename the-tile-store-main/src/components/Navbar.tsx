import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, ShieldCheck, Search, Heart, BookOpen, Briefcase, ShoppingBag, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenBooking: () => void;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenPartnership: () => void;
  onOpenInquiryCart: () => void;
  wishlistCount: number;
  inquiryCartCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Navbar({
  activeSection,
  onNavigate,
  onOpenBooking,
  onOpenSearch,
  onOpenWishlist,
  onOpenPartnership,
  onOpenInquiryCart,
  wishlistCount,
  inquiryCartCount,
  isDarkMode,
  onToggleDarkMode
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', hash: '#/' },
    { label: 'Collections', hash: '#/collections' },
    { label: 'Visualizer', hash: '#/visualizer' },
    { label: 'Calculator', hash: '#/calculator' },
    { label: 'Brands', hash: '#/brands' },
    { label: 'Projects', hash: '#/projects' },
    { label: 'Partners', hash: '#/partners' }
  ];

  const isActive = (itemHash: string) => {
    if (activeSection === itemHash) return true;
    if (itemHash !== '#/' && activeSection.startsWith(itemHash)) return true;
    const hashMapping: Record<string, string> = {
      'home': '#/',
      'collections': '#/collections',
      'visualizer': '#/visualizer',
      'calculator-section': '#/calculator',
      'brands': '#/brands',
      'projects': '#/projects',
'partners': '#/partners'
    };
    return hashMapping[activeSection] === itemHash;
  };

  const handleItemClick = (item: typeof navItems[0]) => {
    setMobileMenuOpen(false);
    onNavigate(item.hash);
  };

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 relative transition-all duration-500 px-6 md:px-12 py-4 ${
          scrolled 
            ? 'bg-warmwhite/75 backdrop-blur-xl border-b border-charcoal/5 shadow-sm py-3' 
            : 'bg-transparent py-6'
        }`}
        id="navbar-header"
      >
        {/* Logo — flush to top-left corner, outside normal flow */}
        <div
          onClick={() => handleItemClick({ label: 'Home', hash: '#/' })}
          className="absolute left-0 top-0 bottom-0 w-[72px] flex items-center justify-center group cursor-pointer select-none"
          id="brand-logo"
        >
          <img
            src="/tile-logo.png"
            alt="The Tile Store"
            className="w-[64px] h-[64px] object-contain transition-opacity duration-300 group-hover:opacity-80 [filter:brightness(0)_invert(0.412)_sepia(1)_saturate(372%)_hue-rotate(6.5deg)]"
          />
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between pl-[80px]">
          <nav className="hidden lg:flex items-center gap-8" id="desktop-nav-menu">
            {navItems.map((item) => {
              const active = isActive(item.hash);
              return (
                <button
                  key={item.hash}
                  onClick={() => handleItemClick(item)}
                  className={`relative font-sans text-xs tracking-widest uppercase transition-all duration-300 py-1 cursor-pointer hover:text-charcoal ${
                    active 
                      ? 'text-charcoal font-semibold' 
                      : 'text-charcoal/60'
                  }`}
                  id={`nav-item-${item.label.toLowerCase()}`}
                >
                  {item.label}
                  {active && (
                    <motion.span 
                      layoutId="navbar-underline" 
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gold-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Call to action & Menu Toggle */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Elegant Desktop Search Icon Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-2 bg-charcoal/5 border border-charcoal/5 hover:border-gold-500 hover:bg-gold-50 transition-all duration-300 rounded-none cursor-pointer text-charcoal group"
              title="Search collection or brands (Press '/' or 'CMD+K')"
              aria-label="Open Search Box"
              id="navbar-search-btn"
            >
              <Search className="w-4 h-4 text-charcoal/70 group-hover:text-gold-600 transition-colors" />
              <span className="hidden md:inline font-mono text-[9px] tracking-widest uppercase text-charcoal/40 font-bold px-1 select-none">
                SEARCH
              </span>
            </button>

            {/* Elegant Desktop Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="flex items-center gap-2 px-3 py-2 bg-charcoal/5 border border-charcoal/5 hover:border-gold-500 hover:bg-gold-50 transition-all duration-300 rounded-none cursor-pointer text-charcoal group relative"
              title="Open Curated Wishlist Moodboard"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 text-charcoal/70 group-hover:text-gold-600 transition-colors ${wishlistCount > 0 ? 'fill-gold-600 text-gold-600' : ''}`} />
              <span className="hidden md:inline font-mono text-[9px] tracking-widest uppercase text-charcoal/40 font-bold px-1 select-none">
                WISHLIST
              </span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-gold-500 text-charcoal rounded-full flex items-center justify-center text-[9px] font-extrabold shadow">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Elegant Desktop Inquiry Cart Button */}
            <button
              onClick={onOpenInquiryCart}
              className="flex items-center gap-2 px-3 py-2 bg-charcoal/5 border border-charcoal/5 hover:border-gold-500 hover:bg-gold-50 transition-all duration-300 rounded-none cursor-pointer text-charcoal group relative"
              title="Inquiry Cart"
              aria-label="Inquiry Cart"
              id="navbar-inquiry-cart-btn"
            >
              <ShoppingBag className={`w-4 h-4 text-charcoal/70 group-hover:text-gold-600 transition-colors ${inquiryCartCount > 0 ? 'text-gold-600' : ''}`} />
              <span className="hidden md:inline font-mono text-[9px] tracking-widest uppercase text-charcoal/40 font-bold px-1 select-none">
                INQUIRE
              </span>
              {inquiryCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-gold-500 text-charcoal rounded-full flex items-center justify-center text-[9px] font-extrabold shadow">
                  {inquiryCartCount}
                </span>
              )}
            </button>

            {/* Dark / Light mode toggle */}
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-2 px-3 py-2 bg-charcoal/5 border border-charcoal/5 hover:border-gold-500 hover:bg-gold-50 transition-all duration-300 rounded-none cursor-pointer text-charcoal group"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
              id="navbar-theme-toggle"
            >
              {isDarkMode
                ? <Sun className="w-4 h-4 text-charcoal/70 group-hover:text-gold-600 transition-colors" />
                : <Moon className="w-4 h-4 text-charcoal/70 group-hover:text-gold-600 transition-colors" />
              }
            </button>

            <button
              onClick={onOpenBooking}
              className="hidden sm:flex items-center gap-2 px-6 py-2 border border-charcoal text-charcoal hover:bg-charcoal hover:text-warmwhite rounded-none text-[10px] font-sans font-semibold tracking-widest uppercase transition-all duration-300 cursor-pointer"
              id="cta-private-tour"
            >
              Book Consultation
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-charcoal hover:text-gold-600 transition-colors duration-300 cursor-pointer"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </motion.header>

      {/* Mobile Glass Overlay Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-45 bg-warmwhite/95 backdrop-blur-2xl flex flex-col justify-between pt-28 pb-10 px-8"
            id="mobile-navigation-overlay"
          >
            <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar" id="mobile-nav-items">
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-charcoal/40 mb-2">
                EXHIBITIONS & SECTIONS
              </span>

              {/* Mobile Search Ingress */}
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="group flex items-center justify-between py-2.5 border-b border-charcoal/10 font-serif text-xl tracking-wide text-gold-600 font-medium text-left cursor-pointer"
                id="mobile-search-trigger"
              >
                <span className="flex items-center gap-2 text-gold-600">
                  <Search className="w-5 h-5 text-gold-600" />
                  Search Archival Slabs...
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-gold-500 font-bold">
                  FIND NOW
                </span>
              </motion.button>

              {/* Mobile Wishlist Ingress */}
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWishlist();
                }}
                className="group flex items-center justify-between py-2.5 border-b border-charcoal/10 font-serif text-xl tracking-wide text-gold-600 font-medium text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 text-gold-600">
                  <Heart className="w-5 h-5 text-gold-600 fill-gold-600" />
                  My Curated Wishlist ({wishlistCount})
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-gold-500 font-bold">
                  VIEW BOARD
                </span>
              </motion.button>

              {/* Mobile Inquiry Cart Ingress */}
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInquiryCart();
                }}
                className="group flex items-center justify-between py-2.5 border-b border-charcoal/10 font-serif text-xl tracking-wide text-gold-600 font-medium text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 text-gold-600">
                  <ShoppingBag className="w-5 h-5 text-gold-600" />
                  Inquiry Cart ({inquiryCartCount})
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-gold-500 font-bold">
                  VIEW CART
                </span>
              </motion.button>

              {navItems.map((item, index) => {
                const active = isActive(item.hash);
                return (
                  <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    key={item.hash}
                    onClick={() => handleItemClick(item)}
                    className="group flex items-center justify-between py-2 border-b border-charcoal/5 font-serif text-2xl tracking-wide text-charcoal text-left cursor-pointer"
                    id={`mobile-nav-item-${item.label.toLowerCase()}`}
                  >
                    <span className={`${active ? 'text-gold-600 font-medium' : ''}`}>
                      {item.label}
                    </span>
                    <div className="h-2 w-2 rounded-full bg-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                );
              })}
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-4 mt-6"
              id="mobile-overlay-footer"
            >
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full text-center py-4 bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal font-sans text-xs font-semibold tracking-widest uppercase transition-all duration-300"
                id="mobile-tour-button"
              >
                Inquire & Book Private Tour
              </button>

              {/* Dark mode toggle for mobile */}
              <button
                onClick={onToggleDarkMode}
                className="w-full flex items-center justify-center gap-2 py-3 border border-charcoal/10 text-charcoal/60 hover:text-gold-600 hover:border-gold-500 font-mono text-[10px] tracking-widest uppercase transition-all duration-300 cursor-pointer"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>

              <div className="flex items-center justify-center gap-2 mt-2">
                <ShieldCheck className="w-4 h-4 text-gold-500" />
                <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest">
                  Licensed showroom and studio
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
