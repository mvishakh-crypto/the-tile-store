import { useState, useMemo, useRef, useEffect } from 'react';
import { useProducts, useCategories } from '../hooks/useProducts';
import { TileProduct } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Shield, Ruler, MapPin, Layers, X, ClipboardCheck, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Filter, Heart, Scale, Calculator, ShoppingBag, Info, Search, LayoutGrid } from 'lucide-react';
import ProgressiveImage from './ProgressiveImage';
import AdvancedFilterDrawer from './AdvancedFilterDrawer';

interface TileCollectionsProps {
  onSelectTileForVisualizer: (tile: TileProduct) => void;
  onOpenBooking: () => void;
  externalSelectedTile?: TileProduct | null;
  onClearExternalSelectedTile?: () => void;
  wishlist: TileProduct[];
  onAddToWishlist: (tile: TileProduct) => void;
  onRemoveFromWishlist: (tileId: string) => void;
  comparedProducts: TileProduct[];
  onAddToCompare: (tile: TileProduct) => void;
  onRemoveFromCompare: (tileId: string) => void;
  onOpenCalculator: (tile: TileProduct) => void;
  onOpenCompareModal: () => void;
  onAddToInquiry: (tile: TileProduct) => void;
  onOpenProductDetail: (tile: TileProduct) => void;
  isFullscreen?: boolean;
  onNavigate?: (hash: string) => void;
}

export default function TileCollections({ 
  onSelectTileForVisualizer, 
  onOpenBooking,
  externalSelectedTile,
  onClearExternalSelectedTile,
  wishlist,
  onAddToWishlist,
  onRemoveFromWishlist,
  comparedProducts,
  onAddToCompare,
  onRemoveFromCompare,
  onOpenCalculator,
  onOpenCompareModal,
  onAddToInquiry,
  onOpenProductDetail,
  isFullscreen = false,
  onNavigate
}: TileCollectionsProps) {
  const { data: productsData, isLoading: productsLoading } = useProducts({}, { field: 'popularity_score', direction: 'desc' }, 1, 1000);
  const { data: categoriesData } = useCategories();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Advanced filters state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    finishes: [] as string[],
    prices: [] as string[],
    usages: [] as string[],
    antiSkid: null as boolean | null,
    styles: [] as string[],
    indoorOutdoors: [] as string[],
    textures: [] as string[],
    materials: [] as string[]
  });

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('recommended');

  // Search query (fullscreen only)
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = isFullscreen ? 8 : 12;

  // Skeletons load simulation
  const [isGridLoading, setIsGridLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsGridLoading(true);
    const timer = setTimeout(() => setIsGridLoading(false), 350);
    return () => clearTimeout(timer);
  }, [activeCategory, selectedFilters, sortBy, searchQuery, currentPage]);

  // Recently Viewed state
  const [recentlyViewed, setRecentlyViewed] = useState<TileProduct[]>(() => {
    const saved = localStorage.getItem('atelier-recently-viewed');
    return saved ? JSON.parse(saved) : [];
  });

  const addToRecentlyViewed = (tile: TileProduct) => {
    const filtered = recentlyViewed.filter(item => item.id !== tile.id);
    const updated = [tile, ...filtered].slice(0, 4);
    setRecentlyViewed(updated);
    localStorage.setItem('atelier-recently-viewed', JSON.stringify(updated));
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedFilters, sortBy, searchQuery]);

  // Synchronize with search selection — navigate directly to product page
  useEffect(() => {
    if (externalSelectedTile) {
      addToRecentlyViewed(externalSelectedTile);
      onOpenProductDetail(externalSelectedTile);
      setActiveCategory('all');
      onClearExternalSelectedTile?.();
    }
  }, [externalSelectedTile, onClearExternalSelectedTile]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const categories = useMemo(() => {
    const base = [{ label: 'All Collections', id: 'all' }];
    if (!categoriesData) return base;
    return [
      ...base,
      ...categoriesData.map(c => ({
        label: c.name,
        id: c.slug
      }))
    ];
  }, [categoriesData]);

  // Helper check for active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += selectedFilters.brands.length;
    count += selectedFilters.sizes.length;
    count += selectedFilters.colors.length;
    count += selectedFilters.finishes.length;
    count += selectedFilters.prices.length;
    count += selectedFilters.usages.length;
    count += (selectedFilters.styles?.length || 0);
    count += (selectedFilters.indoorOutdoors?.length || 0);
    count += (selectedFilters.textures?.length || 0);
    count += (selectedFilters.materials?.length || 0);
    if (selectedFilters.antiSkid !== null) count += 1;
    return count;
  }, [selectedFilters]);

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    let products = productsData ? [...productsData.products] : [];

    // Category filter
    if (activeCategory !== 'all') {
      products = products.filter(p => p.category === activeCategory);
    }

    // Brands filter
    if (selectedFilters.brands.length > 0) {
      products = products.filter(p => p.brand && selectedFilters.brands.includes(p.brand));
    }

    // Sizes filter
    if (selectedFilters.sizes.length > 0) {
      products = products.filter(p => selectedFilters.sizes.includes(p.size));
    }

    // Colors filter
    if (selectedFilters.colors.length > 0) {
      products = products.filter(p => p.color && selectedFilters.colors.includes(p.color));
    }

    // Finishes filter
    if (selectedFilters.finishes.length > 0) {
      products = products.filter(p => selectedFilters.finishes.includes(p.finish));
    }

    // Prices filter
    if (selectedFilters.prices.length > 0) {
      products = products.filter(p => selectedFilters.prices.includes(p.priceCategory));
    }

    // Usages filter
    if (selectedFilters.usages.length > 0) {
      products = products.filter(p => p.usageArea && p.usageArea.some(u => selectedFilters.usages.includes(u)));
    }

    // Anti Skid filter
    if (selectedFilters.antiSkid !== null) {
      products = products.filter(p => p.antiSkid === selectedFilters.antiSkid);
    }

    // Styles filter
    if (selectedFilters.styles && selectedFilters.styles.length > 0) {
      products = products.filter(p => p.style && selectedFilters.styles.includes(p.style));
    }

    // Indoor/Outdoor filter
    if (selectedFilters.indoorOutdoors && selectedFilters.indoorOutdoors.length > 0) {
      products = products.filter(p => p.indoorOutdoor && selectedFilters.indoorOutdoors.includes(p.indoorOutdoor));
    }

    // Textures filter
    if (selectedFilters.textures && selectedFilters.textures.length > 0) {
      products = products.filter(p => p.textureCategory && selectedFilters.textures.includes(p.textureCategory));
    }

    // Materials filter
    if (selectedFilters.materials && selectedFilters.materials.length > 0) {
      products = products.filter(p => {
        return selectedFilters.materials.some(mat => p.material.toLowerCase().includes(mat.toLowerCase()));
      });
    }

    // Search query filter (name, color, size, material, finish, category)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.color && p.color.toLowerCase().includes(q)) ||
        (p.size && p.size.toLowerCase().includes(q)) ||
        (p.priceCategory && p.priceCategory.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.finish && p.finish.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'name') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price-low') {
      const priceOrder = { Reserve: 1, Premium: 2, Signature: 3 };
      products.sort((a, b) => priceOrder[a.priceCategory] - priceOrder[b.priceCategory]);
    } else if (sortBy === 'price-high') {
      const priceOrder = { Reserve: 1, Premium: 2, Signature: 3 };
      products.sort((a, b) => priceOrder[b.priceCategory] - priceOrder[a.priceCategory]);
    } else if (sortBy === 'latest') {
      products.sort((a, b) => (b.latest ? 1 : 0) - (a.latest ? 1 : 0));
    } else if (sortBy === 'popular') {
      products.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
    }

    return products;
  }, [productsData, activeCategory, selectedFilters, sortBy, searchQuery]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleResetFilters = () => {
    setSelectedFilters({
      brands: [],
      sizes: [],
      colors: [],
      finishes: [],
      prices: [],
      usages: [],
      antiSkid: null,
      styles: [],
      indoorOutdoors: [],
      textures: [],
      materials: []
    });
    setSearchQuery('');
  };

  // Helper check for Wishlist/Compare inclusion
  const isInWishlist = (id: string) => wishlist.some(item => item.id === id);
  const isInCompare = (id: string) => comparedProducts.some(item => item.id === id);

  const SkeletonGrid = () => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFullscreen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6 w-full`}>
      {Array.from({ length: itemsPerPage }).map((_, idx) => (
        <div key={idx} className="bg-white border border-charcoal/5 p-0 flex flex-col justify-between h-[380px] animate-pulse">
          <div className="aspect-square bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 relative overflow-hidden" />
          <div className="p-5 border-t border-charcoal/5 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 w-1/3 bg-gray-100" />
              <div className="h-3 w-1/4 bg-gray-100" />
            </div>
            <div className="h-5 w-3/4 bg-gray-100" />
            <div className="pt-3 border-t border-charcoal/5 flex justify-between">
              <div className="h-3 w-1/4 bg-gray-100" />
              <div className="h-3 w-1/5 bg-gold-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMainGrid = () => {
    if (isGridLoading || productsLoading) {
      return <SkeletonGrid />;
    }
    if (paginatedProducts.length === 0) {
      return (
        <div className="text-center py-16 bg-white border border-charcoal/8 w-full flex flex-col items-center justify-center col-span-full">
          <Filter className="w-6 h-6 mx-auto text-charcoal/20 mb-2 animate-bounce" />
          <h4 className="font-serif text-sm font-semibold text-charcoal">No products match your filters</h4>
          <p className="font-sans text-xs text-charcoal/40 mt-1">Try resetting some of your search parameters.</p>
        </div>
      );
    }
    return (
      <motion.div 
        layout
        className={`grid grid-cols-1 sm:grid-cols-2 ${isFullscreen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6 w-full`}
      >
        <AnimatePresence mode="popLayout">
          {paginatedProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              key={product.id}
              className="group bg-white border border-charcoal/5 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-gold-400/40 flex flex-col justify-between cursor-pointer relative animate-fadeIn"
            >
              {/* Wishlist Heart overlay on top right */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInWishlist(product.id)) {
                    onRemoveFromWishlist(product.id);
                  } else {
                    onAddToWishlist(product);
                  }
                }}
                className="absolute top-3 right-3 z-20 p-2 bg-white/95 border border-charcoal/5 hover:border-gold-500 text-charcoal shadow-md cursor-pointer transition-all duration-300"
              >
                <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(product.id) ? 'fill-gold-600 text-gold-600' : 'text-charcoal/60'}`} />
              </button>

              {/* Compare Checkmark overlay on top left */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInCompare(product.id)) {
                    onRemoveFromCompare(product.id);
                  } else {
                    if (comparedProducts.length >= 3) {
                      alert("You can compare up to 3 products at a time.");
                      return;
                    }
                    onAddToCompare(product);
                  }
                }}
                className="absolute top-3 left-3 z-20 p-2 bg-white/95 border border-charcoal/5 hover:border-gold-500 text-charcoal shadow-md cursor-pointer transition-all duration-300"
              >
                <Scale className={`w-3.5 h-3.5 transition-colors ${isInCompare(product.id) ? 'text-gold-600 font-bold' : 'text-charcoal/60'}`} />
              </button>

              {/* Click zone for product details */}
              <div onClick={() => { addToRecentlyViewed(product); onOpenProductDetail(product); }} className="flex-1 flex flex-col cursor-pointer">
                {/* Product Image Frame */}
                <div className="relative aspect-square overflow-hidden bg-ivory">
                  <ProgressiveImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full"
                    imgClassName="group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-x-0 inset-y-0 bg-charcoal/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                    <span className="px-5 py-2.5 bg-warmwhite text-charcoal font-sans text-[10px] tracking-widest uppercase font-semibold shadow-xl flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5" />
                      View Blueprint Specs
                    </span>
                  </div>

                  {/* Bottom corner details label */}
                  <span className="absolute bottom-3 left-3 z-10 font-mono text-[8px] tracking-widest uppercase px-2 py-1 bg-charcoal/90 text-warmwhite rounded-sm">
                    {product.finish}
                  </span>

                  <span className="absolute bottom-3 right-3 z-10 font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 bg-gold-500 text-charcoal font-semibold shadow-md">
                    {product.priceCategory}
                  </span>
                </div>

                {/* Info Text Box */}
                <div className="p-5 border-t border-charcoal/5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] tracking-widest text-charcoal/40 uppercase">
                        {product.code}
                      </span>
                      <span className="font-mono text-[9px] tracking-widest text-gold-600 font-semibold uppercase">
                        {product.brand || (product.origin.split(',')[1] || product.origin)}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-semibold text-charcoal leading-snug group-hover:text-gold-600 transition-colors duration-300">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-4 border-t border-charcoal/5 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest">
                      {product.size}
                    </span>
                    <span className="text-[10px] text-gold-500 font-mono group-hover:underline uppercase tracking-wider font-medium">
                      DETAILS
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <section 
      className="py-24 bg-ivory scroll-mt-20 relative" 
      id="collections"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Title Block */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-[1px] w-6 bg-gold-400"></span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold-600 font-semibold">
              THE SURFACES ARCHIVE
            </span>
            <span className="h-[1px] w-6 bg-gold-400"></span>
          </div>

          <h2 className="font-serif text-3xl md:text-5xl font-bold text-charcoal tracking-tight mb-4">
            Curated Design Collections
          </h2>
          
          <p className="font-sans text-xs sm:text-sm text-charcoal/60 leading-relaxed">
            Our physical library consists of over 4,000 architectural designs. Filter by structural classification below to explore select signature slabs.
          </p>
        </div>

        {/* Filter Navigation Row Grid with Arrow Controllers (only if horizontal category badges are shown) */}
        {!isFullscreen && (
          <div className="relative max-w-5xl mx-auto flex items-center mb-6 px-2 sm:px-6">
            {/* Scroll Left Button */}
            <button
              onClick={scrollLeft}
              type="button"
              className="absolute left-0 z-10 p-2.5 bg-white border border-charcoal/5 hover:border-gold-500 rounded-none shadow-md cursor-pointer hover:bg-gold-50 text-charcoal flex items-center justify-center transition-all duration-300 -translate-y-2"
              aria-label="Scroll Categories Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Filter Navigation Row */}
            <div 
              ref={scrollContainerRef}
              className="flex items-center justify-start overflow-x-auto pb-4 gap-2 no-scrollbar w-full scroll-smooth select-none px-10" 
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-none font-sans text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-300 border cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-gold-500 border-gold-500 text-charcoal font-semibold shadow-md'
                      : 'bg-white/70 border-charcoal/5 text-charcoal/60 hover:border-gold-300 hover:text-charcoal'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={scrollRight}
              type="button"
              className="absolute right-0 z-10 p-2.5 bg-white border border-charcoal/5 hover:border-gold-500 rounded-none shadow-md cursor-pointer hover:bg-gold-50 text-charcoal flex items-center justify-center transition-all duration-300 -translate-y-2"
              aria-label="Scroll Categories Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic Layout Selector */}
        {isFullscreen ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto" id="fullscreen-collections-layout">
            {/* Left sticky sidebar filter column (only desktop) */}
            <div className="hidden lg:block lg:col-span-1 sticky top-24 self-start max-h-[85vh] overflow-y-auto no-scrollbar">
              <AdvancedFilterDrawer
                isOpen={true}
                onClose={() => {}}
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
                onReset={handleResetFilters}
                isInline={true}
              />
            </div>
            
            {/* Right main grid area */}
            <div className="lg:col-span-3">
              {/* Search bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, color, size, material, finish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-charcoal/10 focus:border-gold-500 outline-none font-sans text-xs tracking-wide text-charcoal placeholder:text-charcoal/30 transition-colors duration-200"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-charcoal/5 gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="font-mono text-[10px] text-charcoal/40 uppercase">Category:</span>
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-charcoal/10 outline-none font-sans text-xs tracking-wider uppercase cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                {/* Mobile Filter Button (below lg width) */}
                <button
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-charcoal/10 hover:border-gold-500 hover:bg-gold-50 text-charcoal text-xs font-semibold tracking-widest uppercase transition-all duration-300 w-full sm:w-auto justify-center cursor-pointer shadow-sm"
                >
                  <Filter className="w-3.5 h-3.5 text-gold-600" />
                  Filters ({activeFilterCount})
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-mono text-[10px] tracking-widest text-charcoal/40 uppercase">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white border border-charcoal/10 outline-none font-sans text-xs tracking-wider uppercase cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="latest">Latest</option>
                    <option value="popular">Popularity</option>
                  </select>
                </div>
              </div>
              
              {renderMainGrid()}
            </div>
          </div>
        ) : (
          <>
            {/* Standard non-fullscreen controls row */}
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-16 px-6">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-charcoal/10 hover:border-gold-500 hover:bg-gold-50 text-charcoal text-xs font-semibold tracking-widest uppercase transition-all duration-300 justify-center cursor-pointer"
                >
                  <Filter className="w-4 h-4 text-gold-600" />
                  Advanced Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1.5 h-5 w-5 bg-gold-500 text-charcoal rounded-full flex items-center justify-center text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate?.('#/collections')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-charcoal border border-charcoal text-warmwhite hover:bg-gold-500 hover:border-gold-500 hover:text-charcoal text-xs font-semibold tracking-widest uppercase transition-all duration-300 justify-center cursor-pointer"
                >
                  <LayoutGrid className="w-4 h-4" />
                  All Collections
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="font-mono text-[10px] tracking-widest text-charcoal/40 uppercase">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-charcoal/10 outline-none font-sans text-xs tracking-wider uppercase cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="latest">Latest</option>
                  <option value="popular">Popularity</option>
                </select>
              </div>
            </div>

            {renderMainGrid()}
          </>
        )}

        {/* Visual Paging Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12 pb-8 animate-fadeIn" id="collections-pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 bg-white border border-charcoal/10 hover:border-gold-500 disabled:opacity-30 text-charcoal hover:bg-gold-50 transition-all duration-300 disabled:hover:bg-white disabled:hover:border-charcoal/10 cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1.5 font-mono text-xs">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-9 h-9 flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                    currentPage === pageNumber
                      ? 'bg-gold-500 border-gold-500 text-charcoal font-bold shadow-sm'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-400 hover:text-charcoal'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-3 bg-white border border-charcoal/10 hover:border-gold-500 disabled:opacity-30 text-charcoal hover:bg-gold-50 transition-all duration-300 disabled:hover:bg-white disabled:hover:border-charcoal/10 cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Recently Viewed Slabs Horizontal ribbon */}
        {recentlyViewed.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 mt-16 pt-16 border-t border-charcoal/10 animate-fadeIn" id="recently-viewed-strip">
            <div className="flex items-center gap-2 mb-8">
              <span className="h-[1px] w-4 bg-gold-400"></span>
              <span className="font-mono text-[9px] tracking-[0.25em] text-gold-600 font-bold uppercase">
                RECENTLY VIEWED SLABS
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recentlyViewed.map(tile => (
                <div
                  key={`recent-${tile.id}`}
                  onClick={() => { addToRecentlyViewed(tile); onOpenProductDetail(tile); }}
                  className="bg-white border border-charcoal/5 p-3 flex items-center gap-3 cursor-pointer hover:border-gold-400 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 overflow-hidden bg-ivory shrink-0 border border-charcoal/5">
                    <img src={tile.image} alt={tile.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif text-xs font-semibold text-charcoal truncate group-hover:text-gold-600 transition-colors">
                      {tile.name}
                    </h4>
                    <span className="block font-mono text-[8px] text-charcoal/40 uppercase mt-0.5">{tile.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Compare Action Bar at bottom */}
      <AnimatePresence>
        {comparedProducts.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 z-40 bg-charcoal text-warmwhite border border-gold-500/20 p-4 shadow-2xl flex flex-col sm:flex-row items-center gap-4 sm:max-w-md w-auto"
          >
            <div className="flex-1 text-left">
              <span className="font-mono text-[9px] text-gold-400 block tracking-widest uppercase">SLAB COMPARISON BAR</span>
              <p className="font-sans text-[11px] text-gray-300 font-semibold">{comparedProducts.length} out of 3 tiles selected</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenCompareModal}
                className="px-4 py-2 bg-gold-500 text-charcoal font-mono text-[9px] tracking-widest uppercase font-bold hover:bg-gold-600 transition-all cursor-pointer shadow"
              >
                Compare Now
              </button>
              <button
                onClick={() => {
                  comparedProducts.forEach(p => onRemoveFromCompare(p.id));
                }}
                className="font-mono text-[9px] text-gray-400 hover:text-warmwhite uppercase tracking-widest cursor-pointer"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filter Drawer Component */}
      <AdvancedFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedFilters={selectedFilters}
        onFilterChange={setSelectedFilters}
        onReset={handleResetFilters}
      />
    </section>
  );
}
